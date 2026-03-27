'use client';

import { useState, useEffect } from 'react';
import type { TrendItem, NewsItem } from '@/lib/sources';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface DiscoverPanelProps {
  onSelectUrl: (url: string) => void;
  selectedUrl?: string | null;
}

function TrendSkeleton() {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-7 rounded-full bg-muted animate-pulse"
          style={{ width: `${60 + Math.random() * 40}px` }}
        />
      ))}
    </div>
  );
}

function NewsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-3 space-y-2 animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-1/4" />
        </div>
      ))}
    </div>
  );
}

export default function DiscoverPanel({ onSelectUrl, selectedUrl }: DiscoverPanelProps) {
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedTrend, setSelectedTrend] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingNews, setLoadingNews] = useState(false);

  useEffect(() => {
    fetch('/api/sources/trends?geo=KR')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTrends(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
        <label className="block text-sm font-medium mb-2">오늘의 트렌드</label>
        {loading ? (
          <TrendSkeleton />
        ) : trends.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">
            트렌드를 가져올 수 없습니다.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {trends.slice(0, 15).map((trend) => (
              <Badge
                key={trend.query}
                variant={selectedTrend === trend.query ? 'default' : 'secondary'}
                className="cursor-pointer text-xs py-1 px-2.5 hover:bg-primary/80 hover:text-primary-foreground transition-colors"
                onClick={() => setSelectedTrend(trend.query)}
              >
                {trend.query}
                {trend.searchVolume > 0 && (
                  <span className="ml-1 opacity-60">
                    {trend.searchVolume >= 1000
                      ? `${Math.round(trend.searchVolume / 1000)}K`
                      : trend.searchVolume}
                  </span>
                )}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* News articles — always reserve space */}
      <div className="min-h-[180px]">
        {!selectedTrend ? (
          <div className="flex items-center justify-center h-[180px] border border-dashed rounded-lg">
            <p className="text-sm text-muted-foreground">
              트렌드를 선택하면 관련 뉴스가 표시됩니다
            </p>
          </div>
        ) : loadingNews ? (
          <>
            <label className="block text-sm font-medium mb-2">
              &quot;{selectedTrend}&quot; 관련 뉴스
            </label>
            <NewsSkeleton />
          </>
        ) : news.length === 0 ? (
          <>
            <label className="block text-sm font-medium mb-2">
              &quot;{selectedTrend}&quot; 관련 뉴스
            </label>
            <p className="text-sm text-muted-foreground py-4 text-center">
              관련 뉴스를 찾을 수 없습니다.
            </p>
          </>
        ) : (
          <>
            <label className="block text-sm font-medium mb-2">
              &quot;{selectedTrend}&quot; 관련 뉴스
            </label>
            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {news.map((item, i) => {
                const itemUrl = item.originalLink || item.link;
                const isSelected = selectedUrl === itemUrl;
                return (
                  <Card
                    key={i}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/50'
                    }`}
                    onClick={() => onSelectUrl(itemUrl)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-snug line-clamp-1">{item.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.description}</p>
                        </div>
                        {isSelected && (
                          <Badge variant="default" className="shrink-0 text-[10px]">선택됨</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
