'use client';

import { BRAND_TONES, TONE_LABELS } from '@/lib/types';
import type { BrandTone } from '@/lib/types';

const COLOR_PALETTES = [
  { name: '블루', main: '#2563eb', accent: '#3b82f6' },
  { name: '퍼플', main: '#7c3aed', accent: '#a78bfa' },
  { name: '그린', main: '#059669', accent: '#34d399' },
  { name: '오렌지', main: '#ea580c', accent: '#fb923c' },
  { name: '핑크', main: '#db2777', accent: '#f472b6' },
  { name: '다크', main: '#1e293b', accent: '#475569' },
] as const;

interface BrandSettingsProps {
  tone: BrandTone;
  mainColor: string;
  accentColor: string;
  slideCount: number;
  onToneChange: (tone: BrandTone) => void;
  onMainColorChange: (color: string) => void;
  onAccentColorChange: (color: string) => void;
  onSlideCountChange: (count: number) => void;
}

export default function BrandSettings({
  tone, mainColor, accentColor, slideCount,
  onToneChange, onMainColorChange, onAccentColorChange, onSlideCountChange,
}: BrandSettingsProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">브랜드 톤</label>
        <div className="flex flex-wrap gap-2">
          {BRAND_TONES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onToneChange(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                tone === t
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {TONE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">컬러 팔레트</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_PALETTES.map((palette) => {
            const isSelected = mainColor === palette.main && accentColor === palette.accent;
            return (
              <button
                key={palette.name}
                type="button"
                onClick={() => {
                  onMainColorChange(palette.main);
                  onAccentColorChange(palette.accent);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isSelected
                    ? 'ring-2 ring-offset-1 ring-blue-500 bg-gray-50'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex gap-0.5">
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: palette.main }} />
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: palette.accent }} />
                </div>
                <span className="text-gray-700">{palette.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">슬라이드 수: {slideCount}장</label>
        <input type="range" min={5} max={10} value={slideCount} onChange={(e) => onSlideCountChange(Number(e.target.value))} className="w-full" />
      </div>
    </div>
  );
}
