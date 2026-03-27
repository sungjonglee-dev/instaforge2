import type { SlideData, BrandInfo } from '@/lib/types';
import { getImageSrc } from '@/lib/image-utils';

interface TemplateProps {
  slide: SlideData;
  slideIndex: number;
  totalSlides: number;
  brandInfo?: Partial<BrandInfo>;
}

export default function ElegantTemplate({ slide, slideIndex, totalSlides, brandInfo }: TemplateProps) {
  const mainColor = brandInfo?.mainColor || '#6366f1';
  const accentColor = brandInfo?.accentColor || '#a78bfa';
  const imageUrl = getImageSrc(slide.imageUrl);

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
      {/* Full bleed image */}
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
          }}
        />
      )}

      {/* Gradient overlay (duotone feel) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: imageUrl
            ? `linear-gradient(to bottom, ${mainColor}20 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.75) 100%)`
            : `linear-gradient(160deg, ${mainColor}15, ${accentColor}20, #ffffff)`,
        }}
      />

      {/* Decorative circle */}
      <div
        style={{
          position: 'absolute',
          top: -80,
          right: -80,
          width: 300,
          height: 300,
          borderRadius: '50%',
          border: `2px solid rgba(255,255,255,0.08)`,
        }}
      />

      {/* Floating card */}
      <div
        style={{
          position: 'absolute',
          bottom: isLast ? 140 : 100,
          left: 56,
          right: 56,
          backgroundColor: '#ffffff',
          borderRadius: 28,
          padding: '48px 44px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.06)',
        }}
      >
        {/* Card top color bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 44,
            right: 44,
            height: 3,
            borderRadius: '0 0 2px 2px',
            background: `linear-gradient(90deg, ${mainColor}, ${accentColor}, #ec4899)`,
          }}
        />

        {/* Step number */}
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: 'uppercase' as const,
            color: mainColor,
            marginBottom: 12,
            display: 'block',
          }}
        >
          {slideIndex === 0 ? 'HIGHLIGHT' : `STEP ${String(slideIndex).padStart(2, '0')}`}
        </span>

        {/* Title */}
        <h2
          style={{
            color: '#111827',
            fontSize: slideIndex === 0 ? 46 : 40,
            fontWeight: 800,
            lineHeight: 1.25,
            marginBottom: 16,
            letterSpacing: '-0.3px',
          }}
        >
          {slide.title}
        </h2>

        {/* Decorative divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 32, height: 2, backgroundColor: accentColor, borderRadius: 1 }} />
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: mainColor }} />
          <div style={{ width: 32, height: 2, backgroundColor: accentColor, borderRadius: 1 }} />
        </div>

        {/* Body */}
        {slide.body && (
          <p
            style={{
              color: '#6b7280',
              fontSize: 24,
              lineHeight: 1.7,
            }}
          >
            {slide.body}
          </p>
        )}

        {/* CTA */}
        {slide.cta && (
          <div
            style={{
              marginTop: 28,
              display: 'inline-flex',
              background: `linear-gradient(135deg, ${mainColor}, ${accentColor})`,
              color: '#ffffff',
              fontSize: 22,
              fontWeight: 600,
              padding: '12px 36px',
              borderRadius: 100,
            }}
          >
            {slide.cta}
          </div>
        )}
      </div>

      {/* Bottom brand bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 40,
          left: 56,
          right: 56,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: imageUrl ? 'rgba(255,255,255,0.5)' : '#94a3b8', letterSpacing: 2 }}>
          INSTAFORGE
        </span>
        <span style={{ fontSize: 13, fontWeight: 500, color: imageUrl ? 'rgba(255,255,255,0.4)' : '#cbd5e1', letterSpacing: 1 }}>
          {String(slideIndex + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}
