'use client';

import { BRAND_TONES, TONE_LABELS } from '@/lib/types';
import type { BrandTone } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

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
        <label className="block text-sm font-medium mb-1.5">브랜드 톤</label>
        <div className="flex flex-wrap gap-1.5">
          {BRAND_TONES.map((t) => (
            <Badge
              key={t}
              variant={tone === t ? 'default' : 'secondary'}
              className="cursor-pointer text-xs py-1 px-3 hover:bg-primary/80 hover:text-primary-foreground transition-colors"
              onClick={() => onToneChange(t)}
            >
              {TONE_LABELS[t]}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">컬러 팔레트</label>
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
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                  isSelected
                    ? 'ring-2 ring-offset-1 ring-primary border-primary bg-accent'
                    : 'border-border bg-card hover:bg-accent'
                }`}
              >
                <div className="flex gap-0.5">
                  <div className="w-4 h-4 rounded-full border border-border/50" style={{ backgroundColor: palette.main }} />
                  <div className="w-4 h-4 rounded-full border border-border/50" style={{ backgroundColor: palette.accent }} />
                </div>
                <span className="text-sm">{palette.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">슬라이드 수: {slideCount}장</label>
        <Slider
          value={[slideCount]}
          onValueChange={(v) => onSlideCountChange(Array.isArray(v) ? v[0] : v)}
          min={5}
          max={10}
          step={1}
        />
      </div>
    </div>
  );
}
