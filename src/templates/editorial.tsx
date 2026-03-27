import type { SlideData, BrandInfo } from '@/lib/types';
import { getImageSrc } from '@/lib/image-utils';

interface TemplateProps {
  slide: SlideData;
  slideIndex: number;
  totalSlides: number;
  brandInfo?: Partial<BrandInfo>;
}

export default function EditorialTemplate({ slide, slideIndex, totalSlides, brandInfo }: TemplateProps) {
  const accentColor = brandInfo?.accentColor || '#FF6B35';
  const imageUrl = getImageSrc(slide.imageUrl);

  const isFirst = slideIndex === 0;

  return (
    <div
      style={{
        width: 1080,
        height: 1350,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Pretendard Variable', Pretendard, -apple-system, sans-serif",
        backgroundColor: '#F8F7F4',
      }}
    >
      {/* Subtle vertical grid line */}
      <div style={{ position: 'absolute', top: 0, left: 72, bottom: 0, width: 1, backgroundColor: 'rgba(0,0,0,0.04)' }} />

      {/* Category label */}
      <div style={{ position: 'absolute', top: 96, left: 72, zIndex: 2 }}>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: 'uppercase' as const,
            color: accentColor,
          }}
        >
          {isFirst ? 'INSIGHT' : `STEP ${String(slideIndex).padStart(2, '0')}`}
        </span>
        <div style={{ width: 28, height: 2, backgroundColor: accentColor, marginTop: 8, borderRadius: 1 }} />
      </div>

      {/* Content — left side */}
      <div
        style={{
          position: 'absolute',
          top: isFirst ? 220 : 200,
          left: 72,
          right: imageUrl ? 500 : 72,
          zIndex: 2,
        }}
      >
        {/* Title */}
        <h2
          style={{
            color: '#1A1A2E',
            fontSize: isFirst ? 56 : 44,
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: '-0.5px',
            marginBottom: 24,
          }}
        >
          {slide.title}
        </h2>

        {/* Accent divider */}
        <div
          style={{
            width: 40,
            height: 3,
            backgroundColor: accentColor,
            borderRadius: 2,
            marginBottom: 24,
          }}
        />

        {/* Body */}
        {slide.body && (
          <p
            style={{
              color: '#4A4A68',
              fontSize: 26,
              lineHeight: 1.75,
              fontWeight: 400,
            }}
          >
            {slide.body}
          </p>
        )}

        {/* CTA — subtle accent text */}
        {slide.cta && (
          <div
            style={{
              marginTop: 32,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: '#4A4A68',
              fontSize: 21,
              fontWeight: 500,
              letterSpacing: 0.3,
            }}
          >
            {slide.cta} <span style={{ color: accentColor, fontSize: 18 }}>→</span>
          </div>
        )}
      </div>

      {/* Image — right side, editorial crop */}
      {imageUrl && (
        <div
          style={{
            position: 'absolute',
            top: 160,
            right: 0,
            width: 420,
            height: 720,
            borderRadius: '24px 0 0 24px',
            overflow: 'hidden',
            boxShadow: '-8px 0 32px rgba(0,0,0,0.06)',
          }}
        >
          <img
            src={imageUrl}
            alt=""
            crossOrigin="anonymous"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* Bottom rule line */}
      <div style={{ position: 'absolute', bottom: 72, left: 72, right: 72, height: 1, backgroundColor: 'rgba(0,0,0,0.08)' }} />

      {/* Page indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: 72,
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: 3,
          color: '#94A3B8',
        }}
      >
        {String(slideIndex + 1).padStart(2, '0')} — {String(totalSlides).padStart(2, '0')}
      </div>
    </div>
  );
}
