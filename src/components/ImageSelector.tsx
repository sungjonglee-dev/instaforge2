'use client';

import { useState } from 'react';
import type { ImageCandidate } from '@/hooks/useCarouselStore';

interface ImageSelectorProps {
  candidates: ImageCandidate[];
  currentImageUrl?: string;
  onSelect: (url: string) => void;
}

export default function ImageSelector({ candidates, currentImageUrl, onSelect }: ImageSelectorProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (candidates.length === 0) {
    return (
      <div className="text-center py-4 text-gray-400 text-sm">
        이미지 후보가 없습니다
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500">
          이미지 선택 ({candidates.length}개)
        </span>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {candidates.map((img, i) => {
          const isSelected = img.url === currentImageUrl;
          return (
            <button
              key={`${img.source}-${i}`}
              onClick={() => onSelect(img.url)}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`relative aspect-[4/5] rounded-lg overflow-hidden transition-all ${
                isSelected
                  ? 'ring-2 ring-blue-500 ring-offset-1'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img.thumbnail}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Source badge */}
              <span className="absolute bottom-0.5 right-0.5 text-[8px] font-bold uppercase px-1 py-0.5 rounded bg-black/50 text-white leading-none">
                {img.source === 'article' ? 'A' : img.source === 'unsplash' ? 'U' : img.source === 'pexels' ? 'P' : img.source === 'pixabay' ? 'X' : 'S'}
              </span>
              {isSelected && (
                <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                  <span className="text-white text-lg font-bold drop-shadow">✓</span>
                </div>
              )}
              {hoveredIdx === i && !isSelected && (
                <div className="absolute inset-0 bg-black/10" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
