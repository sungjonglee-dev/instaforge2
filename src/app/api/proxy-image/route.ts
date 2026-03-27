import { NextRequest, NextResponse } from 'next/server';
import { validateUrl, ALLOWED_IMAGE_TYPES } from '@/lib/url-validator';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'url parameter required' }, { status: 400 });
  }

  // SSRF validation (block internal IPs, require http(s))
  const check = validateUrl(url);
  if (!check.valid) {
    return NextResponse.json({ error: check.error }, { status: 403 });
  }

  try {
    const upstream = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: 'Image fetch failed' }, { status: upstream.status });
    }

    const contentType = upstream.headers.get('content-type') || '';
    if (!ALLOWED_IMAGE_TYPES.some((t) => contentType.startsWith(t))) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    const contentLength = parseInt(upstream.headers.get('content-length') || '0', 10);
    if (contentLength > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: 'Image too large' }, { status: 413 });
    }

    // Streaming passthrough
    return new Response(upstream.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('[proxy-image] Error:', error);
    return NextResponse.json({ error: 'Image proxy failed' }, { status: 502 });
  }
}
