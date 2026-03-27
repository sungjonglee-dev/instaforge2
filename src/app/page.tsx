"use client";

import { useRef, useState } from "react";
import { useCarouselStore } from "@/hooks/useCarouselStore";
import { useCarouselPipeline } from "@/hooks/useCarouselPipeline";
import ProgressIndicator from "@/components/ProgressIndicator";
import CarouselPreview from "@/components/CarouselPreview";
import DownloadButton from "@/components/DownloadButton";
import BrandSettings from "@/components/BrandSettings";
import DiscoverPanel from "@/components/DiscoverPanel";
import type { BrandTone, ContentSourceMode } from "@/lib/types";

export default function Home() {
  const { plan, step, errorMessage, brandInfo, setBrandInfo, reset } =
    useCarouselStore();
  const { generate } = useCarouselPipeline();
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const [sourceMode, setSourceMode] = useState<ContentSourceMode>("discover");
  const [url, setUrl] = useState("");
  const [tone, setTone] = useState<BrandTone>("friendly");
  const [mainColor, setMainColor] = useState("#2563eb");
  const [accentColor, setAccentColor] = useState("#3b82f6");
  const [slideCount, setSlideCount] = useState(8);

  const isGenerating = !["idle", "complete", "error"].includes(step);

  async function handleGenerate(targetUrl: string) {
    if (isGenerating || !targetUrl.trim()) return;
    const info = {
      tone,
      mainColor,
      accentColor,
      styleKeywords: [] as string[],
    };
    setBrandInfo(info);
    cardRefs.current.clear();
    await generate(targetUrl, info, slideCount);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await handleGenerate(url);
  }

  function handleReset() {
    reset();
    cardRefs.current.clear();
    setUrl("");
  }

  // ===== Result view =====
  if (step === "complete" && plan) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const registry = require("@/templates").TEMPLATE_REGISTRY;
    const TemplateComponent = registry[plan.templateId];

    return (
      <main className="min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">InstaForge</h1>
            <button
              onClick={handleReset}
              className="text-sm text-gray-500 hover:text-gray-800 font-medium"
            >
              새로 만들기
            </button>
          </div>

          <div
            style={{ position: "absolute", left: -9999, top: 0 }}
            aria-hidden="true"
          >
            {plan.slides.map((slide, i) => (
              <div
                key={i}
                ref={(el) => {
                  if (el) cardRefs.current.set(i, el);
                }}
              >
                <TemplateComponent
                  slide={slide}
                  slideIndex={i}
                  totalSlides={plan.slides.length}
                  brandInfo={brandInfo}
                />
              </div>
            ))}
          </div>

          <CarouselPreview
            plan={plan}
            brandInfo={brandInfo ?? undefined}
            cardRefs={cardRefs}
          />

          <div className="mt-8 flex flex-col items-center gap-4">
            <DownloadButton plan={plan} cardRefs={cardRefs} />
            <button
              onClick={() => {
                cardRefs.current.clear();
                reset();
                handleGenerate(url);
              }}
              className="text-sm text-gray-500 hover:text-blue-600 font-medium"
            >
              다시 생성
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ===== Input view =====
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">InstaForge</h1>
          <p className="text-gray-500 text-lg">
            URL 하나로 전문가급 인스타 캐러셀을 만드세요
          </p>
        </div>

        {isGenerating && <ProgressIndicator step={step} />}

        {step === "error" && errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {errorMessage}
            <button
              onClick={handleReset}
              className="block mt-2 text-red-500 underline text-xs"
            >
              다시 시도
            </button>
          </div>
        )}

        {!isGenerating && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Source Mode Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setSourceMode("discover")}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  sourceMode === "discover"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                트렌드 탐색
              </button>
              <button
                type="button"
                onClick={() => setSourceMode("url")}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  sourceMode === "url"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                URL 입력
              </button>
            </div>

            {/* URL Mode */}
            {sourceMode === "url" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  참고 콘텐츠 URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://blog.example.com/article"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base"
                />
              </div>
            )}

            {/* Discover Mode */}
            {sourceMode === "discover" && (
              <DiscoverPanel
                onSelectUrl={(selectedUrl) => {
                  setUrl(selectedUrl);
                  handleGenerate(selectedUrl);
                }}
              />
            )}

            {/* Brand Settings (common) */}
            <BrandSettings
              tone={tone}
              mainColor={mainColor}
              accentColor={accentColor}
              slideCount={slideCount}
              onToneChange={setTone}
              onMainColorChange={setMainColor}
              onAccentColorChange={setAccentColor}
              onSlideCountChange={setSlideCount}
            />

            {/* Submit button - only for URL mode */}
            {sourceMode === "url" && (
              <button
                type="submit"
                disabled={!url.trim()}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                캐러셀 생성하기
              </button>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
