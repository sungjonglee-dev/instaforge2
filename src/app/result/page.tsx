"use client";

import { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCarouselStore } from "@/hooks/useCarouselStore";
import CarouselPreview from "@/components/CarouselPreview";
import DownloadButton from "@/components/DownloadButton";
import { Button } from "@/components/ui/button";

export default function ResultPage() {
  const router = useRouter();
  const { plan, step, brandInfo, reset } = useCarouselStore();
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Redirect to home if no plan (e.g., page refresh)
  useEffect(() => {
    if (step !== "complete" || !plan) {
      router.replace("/");
    }
  }, [step, plan, router]);

  if (!plan || step !== "complete") {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">캐러셀 데이터가 없습니다</p>
          <Button variant="outline" onClick={() => router.replace("/")}>
            홈으로 돌아가기
          </Button>
        </div>
      </main>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const registry = require("@/templates").TEMPLATE_REGISTRY;
  const TemplateComponent = registry[plan.templateId];

  function handleNewCarousel() {
    cardRefs.current.clear();
    reset();
    router.push("/");
  }

  return (
    <main className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight">InstaForge</h1>
          <Button variant="ghost" size="sm" onClick={handleNewCarousel}>
            새로 만들기
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Hidden full-size cards for capture */}
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

          <div className="mt-8 flex flex-col items-center gap-3">
            <DownloadButton plan={plan} cardRefs={cardRefs} />
            <Button variant="ghost" size="sm" onClick={handleNewCarousel}>
              다른 캐러셀 만들기
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
