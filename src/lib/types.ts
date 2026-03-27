export const BRAND_TONES = ['professional', 'friendly', 'emotional', 'humorous', 'serious'] as const;
export type BrandTone = typeof BRAND_TONES[number];

export const TEMPLATE_IDS = ['photo', 'typo', 'editorial'] as const;
export type TemplateId = typeof TEMPLATE_IDS[number];

export interface DiscoverItem {
  title: string;
  url: string;
  snippet: string;
  pubDate: string;
  source?: string;
}

export type ContentSourceMode = 'url' | 'discover';

export type PipelineStep =
  | 'idle'
  | 'sourcing'
  | 'analyzing'
  | 'structuring'
  | 'writing'
  | 'querying'
  | 'searching'
  | 'rendering'
  | 'complete'
  | 'error';

export interface BrandInfo {
  tone: BrandTone;
  mainColor: string;
  accentColor: string;
  styleKeywords: string[];
}

export interface SlideData {
  title: string;
  body: string;
  imageQuery: string;
  fallbackQuery?: string;
  imageUrl?: string;
  cta?: string;
}

export interface CarouselPlan {
  topic: string;
  caption: string;
  hashtags: string[];
  slides: SlideData[];
  templateId: TemplateId;
  imageQueries: string[];
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

export const TONE_LABELS: Record<BrandTone, string> = {
  professional: '전문적',
  friendly: '친근한',
  emotional: '감성적',
  humorous: '유머러스',
  serious: '진지한',
};
