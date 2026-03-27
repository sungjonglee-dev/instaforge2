'use client';

import { forwardRef } from 'react';
import { TEMPLATE_REGISTRY } from '@/templates';
import type { SlideData, TemplateId, BrandInfo } from '@/lib/types';

interface CarouselCardProps {
  slide: SlideData;
  slideIndex: number;
  totalSlides: number;
  templateId: TemplateId;
  brandInfo?: Partial<BrandInfo>;
  scale?: number;
}

const CarouselCard = forwardRef<HTMLDivElement, CarouselCardProps>(
  ({ slide, slideIndex, totalSlides, templateId, brandInfo, scale }, ref) => {
    const Template = TEMPLATE_REGISTRY[templateId];

    return (
      <div
        ref={ref}
        style={{
          width: 1080,
          height: 1350,
          transform: scale ? `scale(${scale})` : undefined,
          transformOrigin: 'top left',
          flexShrink: 0,
        }}
      >
        <Template
          slide={slide}
          slideIndex={slideIndex}
          totalSlides={totalSlides}
          brandInfo={brandInfo}
        />
      </div>
    );
  },
);

CarouselCard.displayName = 'CarouselCard';
export default CarouselCard;
