import 'server-only';

export interface ImageResult {
  url: string;
  thumbnail: string;
  title: string;
  source: string;
}

// ─── Unsplash ───
export async function searchUnsplash(query: string, count: number = 5): Promise<ImageResult[]> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return [];

  const params = new URLSearchParams({
    query,
    per_page: String(count),
    orientation: 'squarish',
    content_filter: 'high',
    order_by: 'relevant',
  });

  const response = await fetch(`https://api.unsplash.com/search/photos?${params}`, {
    headers: { Authorization: `Client-ID ${accessKey}` },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) return [];

  const data = await response.json();
  return (data.results || []).map((r: Record<string, unknown>) => ({
    url: (r.urls as Record<string, string>)?.regular || '',
    thumbnail: (r.urls as Record<string, string>)?.thumb || '',
    title: (r.alt_description as string) || '',
    source: 'unsplash',
  }));
}

// ─── Pexels ───
export async function searchPexels(query: string, count: number = 5): Promise<ImageResult[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return [];

  const params = new URLSearchParams({
    query,
    per_page: String(count),
    orientation: 'portrait',
  });

  try {
    const response = await fetch(`https://api.pexels.com/v1/search?${params}`, {
      headers: { Authorization: apiKey },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return [];

    const data = await response.json();
    return (data.photos || []).map((p: Record<string, unknown>) => {
      const src = p.src as Record<string, string>;
      return {
        url: src?.large2x || src?.large || '',
        thumbnail: src?.medium || '',
        title: (p.alt as string) || '',
        source: 'pexels',
      };
    });
  } catch {
    return [];
  }
}

// ─── Pixabay ───
export async function searchPixabay(query: string, count: number = 5): Promise<ImageResult[]> {
  const apiKey = process.env.PIXABAY_API_KEY;
  if (!apiKey) return [];

  const params = new URLSearchParams({
    key: apiKey,
    q: query,
    per_page: String(count),
    image_type: 'photo',
    orientation: 'vertical',
    safesearch: 'true',
    min_width: '1080',
  });

  try {
    const response = await fetch(`https://pixabay.com/api/?${params}`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return [];

    const data = await response.json();
    return (data.hits || []).map((h: Record<string, unknown>) => ({
      url: (h.largeImageURL as string) || '',
      thumbnail: (h.webformatURL as string) || '',
      title: (h.tags as string) || '',
      source: 'pixabay',
    }));
  } catch {
    return [];
  }
}

// ─── SerpAPI (Google Images fallback) ───
export async function searchImages(query: string, count: number = 20): Promise<ImageResult[]> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) return [];

  const params = new URLSearchParams({
    engine: 'google_images',
    q: `${query} site:pinterest.com`,
    api_key: apiKey,
    num: String(count),
    hl: 'ko',
  });

  try {
    const response = await fetch(`https://serpapi.com/search?${params}`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return [];

    const data = await response.json();
    return (data.images_results || []).map((r: Record<string, string>) => ({
      url: r.original || r.link,
      thumbnail: r.thumbnail,
      title: r.title || '',
      source: 'serpapi',
    }));
  } catch {
    return [];
  }
}
