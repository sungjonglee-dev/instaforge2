'use client';

import type { PipelineStep } from '@/lib/types';

const STEPS: { key: PipelineStep; label: string; description: string }[] = [
  { key: 'sourcing', label: '콘텐츠 수집', description: '실시간 트렌드 분석 및 뉴스 수집 중...' },
  { key: 'analyzing', label: '콘텐츠 분석', description: '핵심 메시지와 타겟 오디언스 파악 중...' },
  { key: 'structuring', label: '구조 설계', description: 'AIDA 프레임워크로 슬라이드 구조 설계 중...' },
  { key: 'writing', label: '카피 작성', description: '각 슬라이드의 제목과 본문 작성 중...' },
  { key: 'querying', label: '이미지 기획', description: '슬라이드에 맞는 비주얼 키워드 생성 중...' },
  { key: 'searching', label: '이미지 검색', description: '3개 소스에서 최적 이미지 수집 중...' },
  { key: 'rendering', label: '캐러셀 완성', description: '디자인 렌더링 중...' },
];

function getStepIndex(step: PipelineStep): number {
  const idx = STEPS.findIndex((s) => s.key === step);
  return idx >= 0 ? idx : -1;
}

export default function ProgressIndicator({ step }: { step: PipelineStep }) {
  const currentIdx = getStepIndex(step);

  if (step === 'idle' || step === 'complete' || step === 'error') return null;

  return (
    <div className="w-full max-w-2xl mx-auto py-12">
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < currentIdx
                    ? 'bg-green-500 text-white'
                    : i === currentIdx
                      ? 'bg-blue-500 text-white animate-pulse'
                      : 'bg-gray-200 text-gray-400'
                }`}
              >
                {i < currentIdx ? '\u2713' : i + 1}
              </div>
              <span
                className={`mt-2 text-[10px] font-medium text-center leading-tight ${
                  i <= currentIdx ? 'text-gray-800' : 'text-gray-400'
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 ${
                  i < currentIdx ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-gray-600 text-sm">{STEPS[currentIdx]?.description}</p>
        <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-1000"
            style={{ width: `${((currentIdx + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
