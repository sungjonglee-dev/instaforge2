'use client';

import { useState, useEffect } from 'react';
import type { TrendItem, NewsItem } from '@/lib/sources';

interface DiscoverPanelProps {
  onSelectUrl: (url: string) => void;
}

export default function DiscoverPanel({ onSelectUrl }: DiscoverPanelProps) {
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedTrend, setSelectedTrend] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingNews, setLoadingNews] = useState(false);

  // Fetch trends on mount
  useEffect(() => {
    setLoading(true);
    fetch('/api/sources/trends?geo=KR')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTrends(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Fetch news when trend is selected
  useEffect(() => {
    if (!selectedTrend) {
      setNews([]);
      return;
    }
    setLoadingNews(true);
    fetch(`/api/sources/news?query=${encodeURIComponent(selectedTrend)}&count=5`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setNews(data.data);
      })
      .catch(() => {})
      .finally(() => setLoadingNews(false));
  }, [selectedTrend]);

  return (
    <div className="space-y-4">
      {/* Trending Topics */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          오늘의 트렌드
        </label>
        {loading ? (
          <div className="text-sm text-gray-400 py-4 text-center">트렌드 로딩 중...</div>
        ) : trends.length === 0 ? (
          <div className="text-sm text-gray-400 py-4 text-center">
            트렌드를 가져올 수 없습니다. SerpAPI 키를 확인해주세요.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {trends.slice(0, 15).map((trend) => (
              <button
                key={trend.query}
                type="button"
                onClick={() => setSelectedTrend(trend.query)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedTrend === trend.query
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {trend.query}
                {trend.searchVolume > 0 && (
                  <span className="ml-1 text-xs opacity-60">
                    {trend.searchVolume > 1000
                      ? `${Math.round(trend.searchVolume / 1000)}K`
                      : trend.searchVolume}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* News articles for selected trend */}
      {selectedTrend && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            &quot;{selectedTrend}&quot; 관련 뉴스
          </label>
          {loadingNews ? (
            <div className="text-sm text-gray-400 py-4 text-center">뉴스 검색 중...</div>
          ) : news.length === 0 ? (
            <div className="text-sm text-gray-400 py-4 text-center">
              관련 뉴스를 찾을 수 없습니다.
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {news.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelectUrl(item.originalLink || item.link)}
                  className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="text-sm font-medium text-gray-900 line-clamp-1">
                    {item.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {item.description}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(item.pubDate).toLocaleDateString('ko-KR')}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
