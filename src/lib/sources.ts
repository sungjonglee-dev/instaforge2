import 'server-only';
import * as cheerio from 'cheerio';

// ─── Types ───
export interface TrendItem {
  query: string;
  searchVolume: number;
  increasePercentage: number;
  categories: { id: number; name: string }[];
  trendBreakdown: string[];
}

export interface NewsItem {
  title: string;
  description: string;
  link: string;
  originalLink: string;
  pubDate: string;
}

function stripHtml(html: string): string {
  if (!html) return '';
  return cheerio.load(html).text().trim();
}

// ─── SerpAPI Google Trends ───
export async function fetchTrendingTopics(
  geo: string = 'KR',
): Promise<TrendItem[]> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) return [];

  const params = new URLSearchParams({
    engine: 'google_trends_trending_now',
    geo,
    hl: 'ko',
    api_key: apiKey,
  });

  try {
    const response = await fetch(`https://serpapi.com/search.json?${params}`, {
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 3600 },
    } as RequestInit);

    if (!response.ok) return [];

    const data = await response.json();
    const searches = data.trending_searches || [];

    return searches.map((item: Record<string, unknown>) => ({
      query: (item.query as string) || '',
      searchVolume: (item.search_volume as number) || 0,
      increasePercentage: (item.increase_percentage as number) || 0,
      categories: (item.categories as { id: number; name: string }[]) || [],
      trendBreakdown: (item.trend_breakdown as string[]) || [],
    }));
  } catch {
    return [];
  }
}

// ─── SerpAPI Google News (primary) ───
async function searchGoogleNews(
  query: string,
  count: number = 10,
): Promise<NewsItem[]> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) return [];

  const params = new URLSearchParams({
    engine: 'google_news',
    q: query,
    gl: 'kr',
    hl: 'ko',
    api_key: apiKey,
  });

  try {
    const response = await fetch(`https://serpapi.com/search.json?${params}`, {
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return [];

    const data = await response.json();
    return (data.news_results || []).slice(0, count).map((item: Record<string, string>) => ({
      title: item.title || '',
      description: item.snippet || item.title || '',
      link: item.link || '',
      originalLink: item.link || '',
      pubDate: item.date || '',
    }));
  } catch {
    return [];
  }
}

// ─── Naver News Search (fallback) ───
async function searchNaverNews(
  query: string,
  count: number = 10,
): Promise<NewsItem[]> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) return [];

  const params = new URLSearchParams({
    query,
    display: String(Math.min(count, 100)),
    sort: 'date',
  });

  try {
    const response = await fetch(
      `https://openapi.naver.com/v1/search/news.json?${params}`,
      {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
        },
        signal: AbortSignal.timeout(5000),
      },
    );

    if (!response.ok) return [];

    const data = await response.json();
    return (data.items || []).map((item: Record<string, string>) => ({
      title: stripHtml(item.title || ''),
      description: stripHtml(item.description || ''),
      link: item.link || '',
      originalLink: item.originallink || item.link || '',
      pubDate: item.pubDate || '',
    }));
  } catch {
    return [];
  }
}

// ─── News Search (Google News → Naver fallback) ───
export async function searchNews(
  query: string,
  count: number = 10,
): Promise<NewsItem[]> {
  // Try Google News first (works with existing SERPAPI_API_KEY)
  const googleResults = await searchGoogleNews(query, count);
  if (googleResults.length > 0) return googleResults;

  // Fallback to Naver News (requires separate API keys)
  return searchNaverNews(query, count);
}
