import type { SlideData, BrandInfo } from '@/lib/types';
import { getImageSrc } from '@/lib/image-utils';

interface TemplateProps {
  slide: SlideData;
  slideIndex: number;
  totalSlides: number;
  brandInfo?: Partial<BrandInfo>;
}

export default function MinimalTemplate({ slide, slideIndex, totalSlides, brandInfo }: TemplateProps) {
  const mainColor = brandInfo?.mainColor || '#6366f1';
  const accentColor = brandInfo?.accentColor || '#a78bfa';
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
        backgroundColor: '#FAFAF9',
      }}
    >
      {/* Subtle gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(160deg, ${mainColor}06, ${accentColor}08, transparent)`,
        }}
      />

      {/* Editorial grid lines */}
      <div style={{ position: 'absolute', top: 0, left: 72, bottom: 0, width: 1, backgroundColor: 'rgba(0,0,0,0.04)' }} />
      <div style={{ position: 'absolute', top: 200, left: 0, right: 0, height: 1, backgroundColor: 'rgba(0,0,0,0.04)' }} />

      {/* Large decorative number */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          right: 56,
          fontSize: 200,
          fontWeight: 900,
          lineHeight: 1,
          color: `${mainColor}08`,
        }}
      >
        {String(slideIndex + 1).padStart(2, '0')}
      </div>

      {/* Category label */}
      <div style={{ position: 'absolute', top: 100, left: 72, zIndex: 1 }}>
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: 'uppercase' as const,
            color: mainColor,
          }}
        >
          {isFirst ? 'INSIGHT' : `STEP ${String(slideIndex).padStart(2, '0')}`}
        </span>
        <div style={{ width: 32, height: 2, backgroundColor: mainColor, marginTop: 8, borderRadius: 1 }} />
      </div>

      {/* Content area */}
      <div
        style={{
          position: 'absolute',
          top: isFirst ? 260 : 240,
          left: 72,
          right: imageUrl ? 520 : 72,
          zIndex: 1,
        }}
      >
        {/* Title */}
        <h2
          style={{
            color: '#0f172a',
            fontSize: isFirst ? 60 : 46,
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: '-0.5px',
            marginBottom: 24,
          }}
        >
          {slide.title}
        </h2>

        {/* Gradient accent line */}
        <div
          style={{
            width: 48,
            height: 3,
            borderRadius: 2,
            background: `linear-gradient(90deg, ${mainColor}, ${accentColor})`,
            marginBottom: 24,
          }}
        />

        {/* Body */}
        {slide.body && (
          <p
            style={{
              color: '#475569',
              fontSize: 26,
              lineHeight: 1.75,
              fontWeight: 400,
              maxWidth: 560,
            }}
          >
            {slide.body}
          </p>
        )}

        {/* CTA */}
        {slide.cta && (
          <div
            style={{
              marginTop: 36,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              color: mainColor,
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            {slide.cta}
            <span style={{ fontSize: 20 }}>→</span>
          </div>
        )}
      </div>

      {/* Image (editorial crop - right side) */}
      {imageUrl && (
        <div
          style={{
            position: 'absolute',
            top: 200,
            right: 0,
            width: 440,
            height: 700,
            borderRadius: '28px 0 0 28px',
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

      {/* Page indicator (editorial style) */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: 72,
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: 3,
          color: '#94a3b8',
        }}
      >
        {String(slideIndex + 1).padStart(2, '0')} — {String(totalSlides).padStart(2, '0')}
      </div>
    </div>
  );
}
