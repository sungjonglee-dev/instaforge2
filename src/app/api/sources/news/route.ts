import { NextRequest, NextResponse } from 'next/server';
import { searchNews } from '@/lib/sources';
import { z } from 'zod';

export const maxDuration = 10;

const querySchema = z.object({
  query: z.string().min(1).max(200),
  count: z.coerce.number().min(1).max(20).default(10),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = request.nextUrl;
    const parsed = querySchema.safeParse({
      query: searchParams.get('query') || '',
      count: searchParams.get('count') || 10,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: '검색어가 필요합니다' },
        { status: 400 },
      );
    }

    const news = await searchNews(parsed.data.query, parsed.data.count);

    return NextResponse.json(
      { success: true, data: news },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=300',
        },
      },
    );
  } catch (error) {
    console.error('[news] Error:', error);
    return NextResponse.json(
      { success: false, error: '뉴스 검색에 실패했습니다' },
      { status: 500 },
    );
  }
}
