import { z } from 'zod';

export const brandInfoSchema = z.object({
  tone: z.enum(['professional', 'friendly', 'emotional', 'humorous', 'serious']).optional(),
  styleKeywords: z.array(z.string().max(30)).max(5).optional(),
}).optional();

export const analyzeRequestSchema = z.object({
  url: z.string().url('유효한 URL을 입력하세요').max(2048),
  brandInfo: brandInfoSchema,
  slideCount: z.number().int().min(5).max(10).default(8),
});

export const searchImagesRequestSchema = z.object({
  queries: z.array(z.string().max(100)).min(1).max(20),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
export type SearchImagesRequest = z.infer<typeof searchImagesRequestSchema>;
