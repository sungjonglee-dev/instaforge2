'use client';

import { useCarouselStore } from './useCarouselStore';
import type { BrandInfo, CarouselPlan, PipelineStep } from '@/lib/types';

interface SSEEvent {
  event: string;
  data: unknown;
}

function parseSSELine(line: string): SSEEvent | null {
  if (!line.startsWith('data: ')) return null;
  try {
    return JSON.parse(line.slice(6)) as SSEEvent;
  } catch {
    return null;
  }
}

export function useCarouselPipeline() {
  const { setPlan, setStep, setError, setImageMap, updateSlideImage } = useCarouselStore();

  async function generate(url: string, brandInfo?: Partial<BrandInfo>, slideCount: number = 8) {
    const controller = new AbortController();

    try {
      // Step 1-4: Analyze + Generate via SSE
      setStep('analyzing');
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, brandInfo, slideCount }),
        signal: controller.signal,
      });

      if (!analyzeRes.ok) {
        const errorData = await analyzeRes.json().catch(() => null);
        setError(errorData?.error || '콘텐츠 생성에 실패했습니다');
        return;
      }

      // Parse SSE stream
      const reader = analyzeRes.body?.getReader();
      if (!reader) {
        setError('스트리밍 응답을 읽을 수 없습니다');
        return;
      }

      const decoder = new TextDecoder();
      const state: { plan: CarouselPlan | null; articleImages: string[]; hasError: boolean } = { plan: null, articleImages: [], hasError: false };
      let buffer = '';

      const processLines = (text: string) => {
        const lines = text.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          const event = parseSSELine(trimmed);
          if (!event) continue;

          if (event.event === 'step') {
            const { step } = event.data as { step: PipelineStep };
            setStep(step);
          } else if (event.event === 'complete') {
            const completeData = event.data as CarouselPlan & { articleImages?: string[] };
            state.articleImages = completeData.articleImages || [];
            state.plan = completeData;
            setPlan(state.plan);
          } else if (event.event === 'error') {
            const { error } = event.data as { error: string };
            setError(error);
            state.hasError = true;
          }
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (buffer.trim()) processLines(buffer);
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        processLines(lines.join('\n'));
      }

      if (state.hasError) return;

      const plan = state.plan;
      if (!plan) {
        setError('콘텐츠 생성 결과를 받지 못했습니다');
        return;
      }

      // Step 5: Search images
      setStep('searching');
      const perSlideQueries = plan.slides.map((s) => s.imageQuery);
      const fallbackQueries = plan.slides
        .map((s) => s.fallbackQuery)
        .filter((q): q is string => !!q);

      const searchRes = await fetch('/api/search-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          queries: perSlideQueries,
          fallbackQueries,
        }),
        signal: controller.signal,
      });

      const searchData = await searchRes.json();

      // Build article image candidates (from the source URL)
      const articleCandidates: { url: string; thumbnail: string; source: string }[] =
        state.articleImages.map((imgUrl) => ({
          url: imgUrl,
          thumbnail: imgUrl,
          source: 'article',
        }));

      if (searchData.success) {
        const imageMap: Record<number, { url: string; thumbnail: string; source: string }[]> = {};

        plan.slides.forEach((slide, i) => {
          const primaryResults = searchData.data[slide.imageQuery] || [];
          const fallbackResults = slide.fallbackQuery
            ? searchData.data[slide.fallbackQuery] || []
            : [];

          const seen = new Set<string>();
          const merged: { url: string; thumbnail: string; source: string }[] = [];

          const isFirstSlide = i === 0;

          if (isFirstSlide && articleCandidates.length > 0) {
            // Hook slide: article image first (thumbnail of the source)
            const articleImg = articleCandidates[0];
            seen.add(articleImg.url);
            merged.push(articleImg);
          }

          // Search results: primary + fallback
          for (const img of [...primaryResults, ...fallbackResults]) {
            if (!seen.has(img.url)) {
              seen.add(img.url);
              merged.push(img);
            }
          }

          // Article images as extra candidates (not auto-selected for non-first slides)
          for (const img of articleCandidates) {
            if (!seen.has(img.url)) {
              seen.add(img.url);
              merged.push(img);
            }
          }

          imageMap[i] = merged;

          // Auto-assign: first slide gets article image, rest get search results
          if (merged.length > 0) {
            updateSlideImage(i, merged[0].url);
          }
        });

        setImageMap(imageMap);
      } else if (articleCandidates.length > 0) {
        // Fallback: only first slide gets article image
        const imageMap: Record<number, { url: string; thumbnail: string; source: string }[]> = {};
        plan.slides.forEach((_, i) => {
          imageMap[i] = articleCandidates;
          if (i === 0) {
            updateSlideImage(i, articleCandidates[0].url);
          }
        });
        setImageMap(imageMap);
      }

      // Step 6: Rendering
      setStep('rendering');
      await new Promise((r) => setTimeout(r, 500));
      setStep('complete');
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다');
    }

    return controller;
  }

  return { generate };
}
