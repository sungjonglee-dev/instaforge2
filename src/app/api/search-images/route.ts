import { NextRequest, NextResponse } from 'next/server';
import { searchUnsplash, searchPexels, searchPixabay, searchImages } from '@/lib/serpapi';
import type { ImageResult } from '@/lib/serpapi';
import { z } from 'zod';

export const maxDuration = 30;

const requestSchema = z.object({
  queries: z.array(z.string().max(200)).min(1).max(20),
  fallbackQueries: z.array(z.string().max(200)).optional(),
});

interface SearchResultItem {
  url: string;
  thumbnail: string;
  source: string;
}

interface SearchResult {
  [query: string]: SearchResultItem[];
}

function simplifyQuery(query: string): string[] {
  const words = query.trim().split(/\s+/);
  const variants: string[] = [query];
  if (words.length > 3) variants.push(words.slice(0, 3).join(' '));
  if (words.length > 2) variants.push(words.slice(0, 2).join(' '));
  return variants;
}

function toSearchResultItems(results: ImageResult[]): SearchResultItem[] {
  return results.map((img) => ({
    url: img.url,
    thumbnail: img.thumbnail,
    source: img.source,
  }));
}

async function searchMultiSource(query: string): Promise<SearchResultItem[]> {
  // Search all 3 sources in parallel with error isolation
  const [unsplash, pexels, pixabay] = await Promise.allSettled([
    searchUnsplash(query, 5),
    searchPexels(query, 5),
    searchPixabay(query, 5),
  ]);

  const results: SearchResultItem[] = [];

  // Priority: Unsplash > Pexels > Pixabay
  for (const result of [unsplash, pexels, pixabay]) {
    if (result.status === 'fulfilled' && result.value.length > 0) {
      results.push(...toSearchResultItems(result.value));
    }
  }

  if (results.length > 0) return results;

  // Fallback: simplify query and retry with Unsplash only
  const variants = simplifyQuery(query);
  for (const variant of variants.slice(1)) {
    const images = await searchUnsplash(variant, 5);
    if (images.length > 0) {
      return toSearchResultItems(images);
    }
  }

  // Last resort: SerpAPI
  const serpResults = await searchImages(query);
  if (serpResults.length > 0) {
    return toSearchResultItems(serpResults.slice(0, 3));
  }

  return [];
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: '검색 키워드가 필요합니다', code: 'INVALID_INPUT' },
        { status: 400 },
      );
    }

    const allQueries = [
      ...parsed.data.queries,
      ...(parsed.data.fallbackQueries || []),
    ];

    // Deduplicate queries
    const uniqueQueries = [...new Set(allQueries)];

    const result: SearchResult = {};

    const searchPromises = uniqueQueries.map(async (query) => {
      const images = await searchMultiSource(query);
      return { query, images };
    });

    const results = await Promise.all(searchPromises);
    for (const r of results) {
      result[r.query] = r.images;
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('[search-images] Error:', error);
    return NextResponse.json(
      { success: false, error: '이미지 검색에 실패했습니다', code: 'IMAGE_SEARCH_FAILED' },
      { status: 500 },
    );
  }
}
