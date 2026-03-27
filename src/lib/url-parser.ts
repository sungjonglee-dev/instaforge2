import 'server-only';
import * as cheerio from 'cheerio';

export interface ParsedContent {
  title: string;
  description: string;
  text: string;
  ogImage?: string;
  articleImages: string[];
}

function resolveUrl(src: string, baseUrl: string): string | null {
  try {
    if (src.startsWith('data:') || src.endsWith('.svg')) return null;
    const resolved = new URL(src, baseUrl).href;
    if (!resolved.startsWith('http')) return null;
    return resolved;
  } catch {
    return null;
  }
}

export async function parseUrl(url: string): Promise<ParsedContent> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`URL 접근 실패: ${response.status}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
    throw new Error('HTML 콘텐츠만 분석 가능합니다');
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove unwanted elements
  $('script, style, nav, footer, header, aside, iframe, noscript').remove();

  // Extract metadata
  const title = $('meta[property="og:title"]').attr('content')
    || $('title').text()
    || '';

  const description = $('meta[property="og:description"]').attr('content')
    || $('meta[name="description"]').attr('content')
    || '';

  const ogImage = $('meta[property="og:image"]').attr('content') || undefined;

  // Extract article images (og:image + body images)
  const articleImages: string[] = [];
  const seen = new Set<string>();

  if (ogImage) {
    const resolved = resolveUrl(ogImage, url);
    if (resolved) {
      seen.add(resolved);
      articleImages.push(resolved);
    }
  }

  // Find images from content area
  const contentSelectors = [
    'article', 'main', '[role="main"]',
    '.post-content', '.entry-content', '.article-body',
    '.article-content', '.story-body', '[itemprop="articleBody"]', '.post-body',
  ];
  let imgScope = 'body';
  for (const selector of contentSelectors) {
    if ($(selector).length) {
      imgScope = selector;
      break;
    }
  }

  $(imgScope).find('img').each((_, el) => {
    // Try srcset first for highest resolution, then src/data-src
    let src = '';
    const srcset = $(el).attr('srcset') || $(el).attr('data-srcset') || '';
    if (srcset) {
      // Parse srcset and pick the largest image
      const candidates = srcset.split(',').map((entry) => {
        const parts = entry.trim().split(/\s+/);
        const candidateUrl = parts[0];
        const descriptor = parts[1] || '0w';
        const size = parseInt(descriptor) || 0;
        return { url: candidateUrl, size };
      });
      candidates.sort((a, b) => b.size - a.size);
      if (candidates.length > 0) src = candidates[0].url;
    }
    if (!src) {
      src = $(el).attr('src') || $(el).attr('data-src') || '';
    }
    if (!src) return;
    const resolved = resolveUrl(src, url);
    if (!resolved || seen.has(resolved)) return;

    // Skip tiny images (icons, spacers, tracking pixels)
    const width = parseInt($(el).attr('width') || '0', 10);
    const height = parseInt($(el).attr('height') || '0', 10);
    if ((width > 0 && width < 200) || (height > 0 && height < 200)) return;

    // Skip non-content patterns
    if (/logo|icon|avatar|badge|button|spinner|loading|pixel|tracker/i.test(src)) return;

    seen.add(resolved);
    articleImages.push(resolved);
  });

  // Extract main content text
  let text = '';
  const selectors = ['article', 'main', '[role="main"]', '.post-content', '.entry-content', '.article-body'];

  for (const selector of selectors) {
    const el = $(selector);
    if (el.length) {
      text = el.text();
      break;
    }
  }

  // Fallback to body
  if (!text) {
    text = $('body').text();
  }

  // Clean up whitespace and limit length
  text = text.replace(/\s+/g, ' ').trim().slice(0, 8000);

  return { title, description, text, ogImage, articleImages: articleImages.slice(0, 10) };
}
