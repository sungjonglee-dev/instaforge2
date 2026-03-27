import { NextRequest, NextResponse } from 'next/server';
import { fetchTrendingTopics } from '@/lib/sources';
import { z } from 'zod';

export const maxDuration = 15;

const querySchema = z.object({
  geo: z.string().max(5).default('KR'),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = request.nextUrl;
    const parsed = querySchema.safeParse({
      geo: searchParams.get('geo') || 'KR',
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: '잘못된 파라미터입니다' },
        { status: 400 },
      );
    }

    const trends = await fetchTrendingTopics(parsed.data.geo);

    return NextResponse.json(
      { success: true, data: trends },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
        },
      },
    );
  } catch (error) {
    console.error('[trends] Error:', error);
    return NextResponse.json(
      { success: false, error: '트렌드 데이터를 가져오는데 실패했습니다' },
      { status: 500 },
    );
  }
}
