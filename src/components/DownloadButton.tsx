'use client';

import { useState } from 'react';
import { toPng, getFontEmbedCSS } from 'html-to-image';
import JSZip from 'jszip';
import type { CarouselPlan } from '@/lib/types';

interface DownloadButtonProps {
  plan: CarouselPlan;
  cardRefs: React.MutableRefObject<Map<number, HTMLDivElement>>;
}

async function waitForImages(container: HTMLElement): Promise<void> {
  const images = container.querySelectorAll('img');
  await Promise.allSettled(
    Array.from(images).map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
    }),
  );
}

const CAPTURE_OPTIONS = {
  width: 1080,
  height: 1350,
  canvasWidth: 1080,
  canvasHeight: 1350,
  pixelRatio: 1,
  backgroundColor: '#ffffff',
  cacheBust: true,
};

export default function DownloadButton({ plan, cardRefs }: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    setProgress(0);

    try {
      await document.fonts.ready;

      const zip = new JSZip();
      const folder = zip.folder(`instaforge-${plan.topic}`)!;

      // Get font CSS once
      const firstCard = cardRefs.current.get(0);
      let fontEmbedCSS: string | undefined;
      if (firstCard) {
        try {
          fontEmbedCSS = await getFontEmbedCSS(firstCard);
        } catch {
          // Continue without font embedding
        }
      }

      // Sequential capture
      for (let i = 0; i < plan.slides.length; i++) {
        const card = cardRefs.current.get(i);
        if (!card) continue;

        await waitForImages(card);

        // Safari workaround: warm-up call
        try {
          await toPng(card, { ...CAPTURE_OPTIONS, quality: 0.1, fontEmbedCSS });
        } catch {
          // Warm-up may fail, continue
        }

        const dataUrl = await toPng(card, { ...CAPTURE_OPTIONS, fontEmbedCSS });
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        folder.file(`slide-${String(i + 1).padStart(2, '0')}.png`, blob);

        setProgress(((i + 1) / plan.slides.length) * 100);
        await new Promise((r) => setTimeout(r, 50)); // GC breathing room
      }

      // Add caption
      const captionText = `${plan.caption}\n\n${plan.hashtags.map((h) => `#${h}`).join(' ')}`;
      folder.file('caption.txt', captionText);

      // Generate and download ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `instaforge-${plan.topic}-carousel.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      alert('다운로드 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setDownloading(false);
      setProgress(0);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {downloading ? `다운로드 중... ${Math.round(progress)}%` : '전체 ZIP 다운로드'}
      </button>

      {downloading && (
        <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
