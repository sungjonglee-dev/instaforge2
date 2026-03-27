import type { SlideData, BrandInfo } from '@/lib/types';

interface TemplateProps {
  slide: SlideData;
  slideIndex: number;
  totalSlides: number;
  brandInfo?: Partial<BrandInfo>;
}

export default function TypoTemplate({ slide, slideIndex, totalSlides, brandInfo }: TemplateProps) {
  const accentColor = brandInfo?.accentColor || '#3182F6';
  const isFirst = slideIndex === 0;
  const isLast = slideIndex === totalSlides - 1;

  // Dark or light variant based on slide position
  const isDark = isFirst || isLast;
  const bg = isDark ? '#000000' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111111';
  const subColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)';

  return (
    <div
      style={{
        width: 1080,
        height: 1350,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Pretendard Variable', Pretendard, -apple-system, sans-serif",
        backgroundColor: bg,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '120px 80px',
      }}
    >
      {/* Accent line */}
      <div
        style={{
          width: 48,
          height: 2,
          backgroundColor: accentColor,
          marginBottom: 40,
          borderRadius: 1,
        }}
      />

      {/* Title — the hero */}
      <h2
        style={{
          color: textColor,
          fontSize: isFirst ? 88 : 72,
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: '-1.5px',
          marginBottom: 32,
          maxWidth: 900,
        }}
      >
        {slide.title}
      </h2>

      {/* Body */}
      {slide.body && (
        <p
          style={{
            color: subColor,
            fontSize: 28,
            lineHeight: 1.7,
            fontWeight: 400,
            maxWidth: 720,
          }}
        >
          {slide.body}
        </p>
      )}

      {/* CTA — understated text link style */}
      {slide.cta && (
        <div
          style={{
            marginTop: 48,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
            fontSize: 22,
            fontWeight: 500,
            letterSpacing: 0.5,
          }}
        >
          {slide.cta} <span style={{ opacity: 0.6 }}>→</span>
        </div>
      )}

      {/* Page indicator — bottom left, ultra subtle */}
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          left: 80,
          fontSize: 14,
          fontWeight: 500,
          letterSpacing: 4,
          color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
        }}
      >
        {String(slideIndex + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
      </div>
    </div>
  );
}
