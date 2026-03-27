import type { SlideData, BrandInfo } from '@/lib/types';
import { getImageSrc } from '@/lib/image-utils';

interface TemplateProps {
  slide: SlideData;
  slideIndex: number;
  totalSlides: number;
  brandInfo?: Partial<BrandInfo>;
}

export default function BoldTemplate({ slide, slideIndex, totalSlides, brandInfo }: TemplateProps) {
  const mainColor = brandInfo?.mainColor || '#6366f1';
  const accentColor = brandInfo?.accentColor || '#a78bfa';
  const imageUrl = getImageSrc(slide.imageUrl);

  const isFirst = slideIndex === 0;
  const isLast = slideIndex === totalSlides - 1;

  return (
    <div
      style={{
        width: 1080,
        height: 1350,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Pretendard Variable', Pretendard, -apple-system, sans-serif",
      }}
    >
      {/* Gradient mesh background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at 15% 25%, ${mainColor}50 0%, transparent 45%),
            radial-gradient(circle at 85% 30%, ${accentColor}40 0%, transparent 45%),
            radial-gradient(circle at 50% 85%, ${mainColor}30 0%, transparent 45%),
            linear-gradient(160deg, #0a0a0a 0%, #111827 50%, #0f172a 100%)
          `.trim(),
        }}
      />

      {/* Background image (subtle, behind glass) */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          crossOrigin="anonymous"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.15,
          }}
        />
      )}

      {/* Decorative large number */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          right: 56,
          fontSize: 220,
          fontWeight: 900,
          lineHeight: 1,
          color: 'transparent',
          WebkitTextStroke: `1.5px rgba(255,255,255,0.08)`,
        }}
      >
        {String(slideIndex + 1).padStart(2, '0')}
      </div>

      {/* Corner accents */}
      <div style={{ position: 'absolute', top: 48, left: 48, width: 40, height: 3, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2 }} />
      <div style={{ position: 'absolute', top: 48, left: 48, width: 3, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2 }} />
      <div style={{ position: 'absolute', bottom: 48, right: 48, width: 40, height: 3, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2 }} />
      <div style={{ position: 'absolute', bottom: 48, right: 48, width: 3, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2 }} />

      {/* Glass card */}
      <div
        style={{
          position: 'absolute',
          top: isFirst ? 280 : 240,
          left: 56,
          right: 56,
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 28,
          padding: '52px 48px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Card top gradient line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 48,
            right: 48,
            height: 3,
            borderRadius: '0 0 2px 2px',
            background: `linear-gradient(90deg, ${mainColor}, ${accentColor})`,
          }}
        />

        {/* Step label */}
        {!isFirst && !isLast && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: `${mainColor}25`,
              borderRadius: 100,
              padding: '6px 18px',
              marginBottom: 20,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: accentColor, letterSpacing: 2 }}>
              STEP {String(slideIndex).padStart(2, '0')}
            </span>
          </div>
        )}

        {/* Title */}
        <h2
          style={{
            color: '#ffffff',
            fontSize: isFirst ? 64 : 48,
            fontWeight: 800,
            lineHeight: 1.2,
            marginBottom: 20,
            letterSpacing: '-0.5px',
            textShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          {slide.title}
        </h2>

        {/* Gradient divider */}
        <div
          style={{
            width: 60,
            height: 3,
            borderRadius: 2,
            background: `linear-gradient(90deg, ${mainColor}, ${accentColor})`,
            marginBottom: 20,
          }}
        />

        {/* Body */}
        {slide.body && (
          <p
            style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: 28,
              lineHeight: 1.7,
              fontWeight: 400,
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
              background: `linear-gradient(135deg, ${mainColor}, ${accentColor})`,
              color: '#ffffff',
              fontSize: 24,
              fontWeight: 700,
              padding: '14px 36px',
              borderRadius: 100,
            }}
          >
            {slide.cta}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 56,
          left: 72,
          right: 72,
          display: 'flex',
          gap: 6,
        }}
      >
        {Array.from({ length: totalSlides }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              backgroundColor: i <= slideIndex ? accentColor : 'rgba(255,255,255,0.12)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
