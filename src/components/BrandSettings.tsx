"use client";

import { BRAND_TONES, TONE_LABELS } from "@/lib/types";
import type { BrandTone } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

interface BrandSettingsProps {
  tone: BrandTone;
  slideCount: number;
  onToneChange: (tone: BrandTone) => void;
  onSlideCountChange: (count: number) => void;
}

export default function BrandSettings({
  tone,
  slideCount,
  onToneChange,
  onSlideCountChange,
}: BrandSettingsProps) {
  return (
    <div className="space-y-5 pt-4 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1.5">브랜드 톤</label>
        <div className="flex flex-wrap gap-1.5">
          {BRAND_TONES.map((t) => (
            <Badge
              key={t}
              variant={tone === t ? "default" : "secondary"}
              className="cursor-pointer text-xs py-1 px-3 hover:bg-primary/80 hover:text-primary-foreground transition-colors"
              onClick={() => onToneChange(t)}
            >
              {TONE_LABELS[t]}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          슬라이드 수: {slideCount}장
        </label>
        <Slider
          value={[slideCount]}
          onValueChange={(v) => onSlideCountChange(Array.isArray(v) ? v[0] : v)}
          min={1}
          max={10}
          step={1}
        />
      </div>
    </div>
  );
}
