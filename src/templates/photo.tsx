import type { SlideData, BrandInfo } from '@/lib/types';
import { getImageSrc } from '@/lib/image-utils';

interface TemplateProps {
  slide: SlideData;
  slideIndex: number;
  totalSlides: number;
  brandInfo?: Partial<BrandInfo>;
}

export default function PhotoTemplate({ slide, slideIndex, totalSlides, brandInfo }: TemplateProps) {
  const accentColor = brandInfo?.accentColor || '#3182F6';
  if (!slide) return <div style={{ width: 1080, height: 1350, backgroundColor: '#000' }} />;
  const imageUrl = getImageSrc(slide.imageUrl);

  const mainColor = brandInfo?.mainColor || '#3182F6';
  const isFirst = slideIndex === 0;
  const isLast = slideIndex === totalSlides - 1;
  const hasImage = !!imageUrl;

  // No image → typo-style fallback (dark or light based on slide position)
  if (!hasImage) {
    const isDark = isFirst || isLast;
    return (
      <div
        style={{
          width: 1080,
          height: 1350,
          position: 'relative',
          overflow: 'hidden',
          fontFamily: "'Pretendard Variable', Pretendard, -apple-system, sans-serif",
          backgroundColor: isDark ? '#000' : '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '120px 80px',
        }}
      >
        <div style={{ width: 48, height: 2, backgroundColor: accentColor, marginBottom: 40, borderRadius: 1 }} />
        <h2 style={{ color: isDark ? '#fff' : '#111', fontSize: isFirst ? 88 : 72, fontWeight: 900, lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 28 }}>
          {slide.title}
        </h2>
        {slide.body && (
          <p style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)', fontSize: 28, lineHeight: 1.7, maxWidth: 720 }}>
            {slide.body}
          </p>
        )}
        {slide.cta && (
          <div style={{ marginTop: 40, color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)', fontSize: 20, fontWeight: 500 }}>
            {slide.cta}
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 80, left: 80, fontSize: 14, fontWeight: 500, letterSpacing: 4, color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)' }}>
          {String(slideIndex + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: 1080,
        height: 1350,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Pretendard Variable', Pretendard, -apple-system, sans-serif",
        backgroundColor: '#111',
      }}
    >
      {/* Full-bleed background image */}
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

      {/* Bottom gradient overlay — strong */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.5) 35%, rgba(0,0,0,0.05) 65%, transparent 100%)',
        }}
      />

      {/* Top pill badge */}
      {!isLast && (
        <div
          style={{
            position: 'absolute',
            top: 56,
            left: 72,
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: 100,
            padding: '8px 20px',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: 1 }}>
            {isFirst ? 'INSIGHT' : `STEP ${String(slideIndex).padStart(2, '0')}`}
          </span>
        </div>
      )}

      {/* Content at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: isLast ? 120 : 100,
          left: 72,
          right: 72,
        }}
      >
        {/* Title */}
        <h2
          style={{
            color: '#FFFFFF',
            fontSize: isFirst ? 76 : 60,
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-1px',
            marginBottom: 16,
            textShadow: '0 2px 12px rgba(0,0,0,0.4)',
          }}
        >
          {slide.title}
        </h2>

        {/* Body */}
        {slide.body && (
          <p
            style={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: 26,
              lineHeight: 1.65,
              fontWeight: 400,
              maxWidth: 800,
            }}
          >
            {slide.body}
          </p>
        )}

        {/* CTA — subtle, blends with photo overlay */}
        {slide.cta && (
          <div
            style={{
              marginTop: 24,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: 'rgba(255,255,255,0.7)',
              fontSize: 20,
              fontWeight: 500,
              letterSpacing: 0.5,
            }}
          >
            {slide.cta}
            {!isLast && <span style={{ fontSize: 16, opacity: 0.6 }}>→</span>}
          </div>
        )}
      </div>

      {/* Page indicator — subtle bottom right */}
      <div
        style={{
          position: 'absolute',
          bottom: 48,
          right: 72,
          fontSize: 14,
          fontWeight: 500,
          letterSpacing: 3,
          color: 'rgba(255,255,255,0.35)',
        }}
      >
        {String(slideIndex + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
      </div>
    </div>
  );
}
