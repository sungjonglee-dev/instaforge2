"use client";

import { useState, useEffect } from "react";
import type { PipelineStep } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";

const STEPS: { key: PipelineStep; label: string; description: string }[] = [
  {
    key: "sourcing",
    label: "수집",
    description: "실시간 트렌드 분석 및 뉴스 수집 중...",
  },
  {
    key: "analyzing",
    label: "분석",
    description: "핵심 메시지와 타겟 오디언스 파악 중...",
  },
  {
    key: "structuring",
    label: "구조",
    description: "AIDA 프레임워크로 슬라이드 구조 설계 중...",
  },
  {
    key: "writing",
    label: "작성",
    description: "Opus AI가 각 슬라이드의 카피를 작성 중...",
  },
  {
    key: "querying",
    label: "기획",
    description: "슬라이드에 맞는 비주얼 키워드 생성 중...",
  },
  {
    key: "searching",
    label: "검색",
    description: "Unsplash + Pexels에서 최적 이미지 수집 중...",
  },
  { key: "rendering", label: "완성", description: "디자인 렌더링 중..." },
];

const TIPS = [
  "인스타그램 캐러셀은 평균 1.4배 더 많은 도달을 만들어요",
  "첫 슬라이드의 Hook이 전체 참여율의 80%를 결정해요",
  "AIDA 구조: Attention → Interest → Desire → Action",
  "해시태그는 3-5개가 최적, 너무 많으면 오히려 역효과",
  '캡션의 첫 125자가 "더 보기" 전에 보이는 전부예요',
  "캐러셀은 단일 이미지 대비 저장률이 2배 이상 높아요",
  "매 슬라이드마다 하나의 핵심 포인트만 전달하세요",
  "마지막 슬라이드의 CTA가 저장/공유를 유도하는 핵심이에요",
];

function getStepIndex(step: PipelineStep): number {
  const idx = STEPS.findIndex((s) => s.key === step);
  return idx >= 0 ? idx : -1;
}

export default function ProgressIndicator({ step }: { step: PipelineStep }) {
  const currentIdx = getStepIndex(step);
  const [tipIdx, setTipIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIdx((prev) => (prev + 1) % TIPS.length);
    }, 4000);
    const timeInterval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => {
      clearInterval(tipInterval);
      clearInterval(timeInterval);
    };
  }, []);

  if (step === "idle" || step === "complete" || step === "error") return null;

  const progress = ((currentIdx + 1) / STEPS.length) * 100;

  return (
    <div className="w-full max-w-md mx-auto py-8">
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="p-0 space-y-6 px-4">
          {/* Current step highlight */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {STEPS[currentIdx]?.label} 단계
            </div>
            <p className="text-sm text-muted-foreground">
              {STEPS[currentIdx]?.description}
            </p>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {currentIdx + 1} / {STEPS.length}
              </span>
              <span>{elapsed}초 경과</span>
            </div>
          </div>

          {/* Step dots */}
          <div className="flex justify-center gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i < currentIdx
                    ? "w-6 bg-primary"
                    : i === currentIdx
                      ? "w-6 bg-primary animate-pulse"
                      : "w-1.5 bg-muted-foreground/20"
                }`}
              />
            ))}
          </div>

          {/* Tip carousel */}
          <div className="py-4 border-t">
            <div className="flex items-start gap-2 min-h-[2.5rem]">
              <span className="text-xs text-muted-foreground/60 font-medium shrink-0 mt-0.5">
                TIP
              </span>
              <p
                key={tipIdx}
                className="text-xs text-muted-foreground leading-relaxed animate-in fade-in duration-500"
              >
                {TIPS[tipIdx]}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
