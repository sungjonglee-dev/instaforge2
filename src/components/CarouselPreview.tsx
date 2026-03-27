'use client';

import { useState, useRef, useCallback } from 'react';
import CarouselCard from './CarouselCard';
import ImageSelector from './ImageSelector';
import { useCarouselStore } from '@/hooks/useCarouselStore';
import type { CarouselPlan, BrandInfo } from '@/lib/types';

interface CarouselPreviewProps {
  plan: CarouselPlan;
  brandInfo?: Partial<BrandInfo>;
  cardRefs: React.MutableRefObject<Map<number, HTMLDivElement>>;
}

export default function CarouselPreview({ plan, brandInfo, cardRefs }: CarouselPreviewProps) {
  const totalSlides = plan.slides.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const safeIndex = Math.min(currentIndex, totalSlides - 1);
  const containerRef = useRef<HTMLDivElement>(null);
  const scale = 380 / 1080;

  const imageMap = useCarouselStore((s) => s.imageMap);
  const updateSlideImage = useCarouselStore((s) => s.updateSlideImage);

  const currentSlide = plan.slides[safeIndex];
  const candidates = imageMap[safeIndex] || [];
  const hasImageTemplate = plan.templateId !== 'typo';

  const setCardRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      if (el) cardRefs.current.set(index, el);
    },
    [cardRefs],
  );

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Main preview */}
      <div className="relative" style={{ width: 380, height: 380 * (1350 / 1080) }}>
        <div ref={containerRef} className="overflow-hidden rounded-xl shadow-2xl" style={{ width: 380, height: 380 * (1350 / 1080) }}>
          <CarouselCard
            ref={setCardRef(currentIndex)}
            slide={plan.slides[safeIndex]}
            slideIndex={currentIndex}
            totalSlides={totalSlides}
            templateId={plan.templateId}
            brandInfo={brandInfo}
            scale={scale}
          />
        </div>

        {/* Nav buttons */}
        {currentIndex > 0 && (
          <button
            onClick={() => { setCurrentIndex((i) => i - 1); setShowImageSelector(false); }}
            className="absolute left-[-48px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-50"
          >
            ←
          </button>
        )}
        {currentIndex < totalSlides - 1 && (
          <button
            onClick={() => { setCurrentIndex((i) => i + 1); setShowImageSelector(false); }}
            className="absolute right-[-48px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-600 hover:bg-gray-50"
          >
            →
          </button>
        )}

        {/* Slide number badge */}
        <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full font-medium">
          {currentIndex + 1} / {totalSlides}
        </div>

        {/* Image change button */}
        {hasImageTemplate && candidates.length > 0 && (
          <button
            onClick={() => setShowImageSelector(!showImageSelector)}
            className={`absolute bottom-3 left-3 text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
              showImageSelector
                ? 'bg-blue-500 text-white'
                : 'bg-black/60 text-white hover:bg-black/80'
            }`}
          >
            {showImageSelector ? '닫기' : '이미지 변경'}
          </button>
        )}
      </div>

      {/* Image selector panel */}
      {showImageSelector && hasImageTemplate && (
        <div className="w-full max-w-lg bg-gray-50 rounded-xl p-3">
          <ImageSelector
            candidates={candidates}
            currentImageUrl={currentSlide?.imageUrl}
            onSelect={(url) => updateSlideImage(safeIndex, url)}
          />
        </div>
      )}

      {/* Thumbnail strip */}
      <div className="flex gap-2 overflow-x-auto pb-2 max-w-full px-4">
        {plan.slides.map((slide, i) => (
          <button
            key={i}
            onClick={() => { setCurrentIndex(i); setShowImageSelector(false); }}
            className={`flex-shrink-0 rounded-lg overflow-hidden transition-all border-2 ${
              i === safeIndex
                ? 'border-blue-500 ring-2 ring-blue-500/30 opacity-100'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            style={{ width: 64, height: 80 }}
          >
            <div style={{ transform: `scale(${64 / 1080})`, transformOrigin: 'top left', width: 1080, height: 1350 }}>
              <CarouselCard
                ref={setCardRef(i)}
                slide={slide}
                slideIndex={i}
                totalSlides={totalSlides}
                templateId={plan.templateId}
                brandInfo={brandInfo}
              />
            </div>
          </button>
        ))}
      </div>

      {/* Caption preview */}
      <div className="w-full max-w-lg bg-gray-50 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">캡션</span>
          <button
            onClick={() => {
              const text = `${plan.caption}\n\n${plan.hashtags.map((h) => `#${h.replace(/^#/, '')}`).join(' ')}`;
              navigator.clipboard.writeText(text);
            }}
            className="text-xs text-blue-500 hover:text-blue-700 font-medium"
          >
            복사
          </button>
        </div>
        <p className="text-sm text-gray-600 whitespace-pre-wrap">{plan.caption}</p>
        <p className="text-sm text-blue-500 mt-2">{plan.hashtags.map((h) => `#${h.replace(/^#/, '')}`).join(' ')}</p>
      </div>
    </div>
  );
}
