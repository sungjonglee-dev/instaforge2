import { NextRequest } from 'next/server';
import { analyzeRequestSchema } from '@/lib/validation';
import { validateUrl } from '@/lib/url-validator';
import { parseUrl } from '@/lib/url-parser';
import { generateCarouselMultiStep } from '@/lib/claude';

export const maxDuration = 120;

export async function POST(request: NextRequest): Promise<Response> {
  const encoder = new TextEncoder();

  try {
    const body = await request.json();
    const parsed = analyzeRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { success: false, error: '입력값이 올바르지 않습니다', code: 'INVALID_INPUT' },
        { status: 400 },
      );
    }

    const { url, brandInfo, slideCount } = parsed.data;

    const urlCheck = validateUrl(url);
    if (!urlCheck.valid) {
      return Response.json(
        { success: false, error: urlCheck.error!, code: 'INVALID_URL' },
        { status: 422 },
      );
    }

    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data?: unknown) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event, data })}\n\n`));
        };

        try {
          const content = await parseUrl(url);
          const carousel = await generateCarouselMultiStep(
            content,
            brandInfo,
            slideCount,
            (step) => send('step', { step }),
          );

          send('complete', {
            ...carousel,
            articleImages: content.articleImages,
            slides: carousel.slides.map((s) => ({
              ...s,
              imageUrl: undefined,
            })),
          });
        } catch (error) {
          console.error('[analyze-stream] Error:', error);
          const message = error instanceof Error ? error.message : '알 수 없는 오류';
          if (message.includes('URL 접근 실패') || message.includes('접근할 수 없')) {
            send('error', { error: '이 URL은 접근할 수 없습니다. 다른 URL을 시도해 주세요.', code: 'URL_UNREACHABLE' });
          } else {
            send('error', { error: '콘텐츠 생성 중 오류가 발생했습니다. 다시 시도해 주세요.', code: 'AI_GENERATION_FAILED' });
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[analyze] Error:', error);
    return Response.json(
      { success: false, error: '콘텐츠 생성 중 오류가 발생했습니다.', code: 'AI_GENERATION_FAILED' },
      { status: 500 },
    );
  }
}
