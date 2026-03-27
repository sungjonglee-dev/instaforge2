"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCarouselStore } from "@/hooks/useCarouselStore";
import { useCarouselPipeline } from "@/hooks/useCarouselPipeline";
import ProgressIndicator from "@/components/ProgressIndicator";
import BrandSettings from "@/components/BrandSettings";
import DiscoverPanel from "@/components/DiscoverPanel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { BrandTone } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const { step, errorMessage, setBrandInfo, reset } = useCarouselStore();
  const { generate } = useCarouselPipeline();

  const [selectedNewsUrl, setSelectedNewsUrl] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [tone, setTone] = useState<BrandTone>("friendly");
  const [mainColor, setMainColor] = useState("#2563eb");
  const [accentColor, setAccentColor] = useState("#3b82f6");
  const [slideCount, setSlideCount] = useState(8);
  const [activeTab, setActiveTab] = useState("discover");

  const isGenerating = !["idle", "complete", "error"].includes(step);
  const canGenerate =
    activeTab === "discover" ? !!selectedNewsUrl : !!url.trim();

  // Navigate to result page when complete
  useEffect(() => {
    if (step === "complete") {
      router.push("/result");
    }
  }, [step, router]);

  async function handleGenerate(targetUrl: string) {
    if (isGenerating || !targetUrl.trim()) return;
    const info = {
      tone,
      mainColor,
      accentColor,
      styleKeywords: [] as string[],
    };
    setBrandInfo(info);
    await generate(targetUrl, info, slideCount);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (activeTab === "discover" && selectedNewsUrl) {
      await handleGenerate(selectedNewsUrl);
    } else if (activeTab === "url" && url.trim()) {
      await handleGenerate(url);
    }
  }

  function handleReset() {
    reset();
    setUrl("");
    setSelectedNewsUrl(null);
  }

  return (
    <main className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight">InstaForge</h1>
          <span className="text-xs text-muted-foreground">AI Carousel Studio</span>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Hero */}
          {!isGenerating && step !== "error" && (
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold tracking-tight mb-2">
                트렌드로 만드는 캐러셀
              </h2>
              <p className="text-muted-foreground">
                실시간 트렌드를 선택하면 전문가급 인스타 캐러셀을 자동으로 생성해요
              </p>
            </div>
          )}

          {/* Generating state */}
          {isGenerating && <ProgressIndicator step={step} />}

          {/* Error state */}
          {step === "error" && errorMessage && (
            <Card className="mb-6 border-destructive/50 bg-destructive/5">
              <CardContent className="pt-4 pb-3">
                <p className="text-sm text-destructive font-medium mb-1">생성에 실패했습니다</p>
                <p className="text-sm text-destructive/80">{errorMessage}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={handleReset}
                >
                  다시 시도
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Input form */}
          {!isGenerating && step !== "error" && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Tabs
                value={activeTab}
                onValueChange={(v) => {
                  setActiveTab(v);
                  setSelectedNewsUrl(null);
                }}
              >
                <TabsList className="w-full">
                  <TabsTrigger value="discover" className="flex-1">
                    트렌드 탐색
                  </TabsTrigger>
                  <TabsTrigger value="url" className="flex-1">
                    URL 입력
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="discover" className="mt-4">
                  {/* Fixed height container to prevent layout shift */}
                  <div className="min-h-[280px]">
                    <DiscoverPanel
                      onSelectUrl={(selectedUrl) => {
                        setSelectedNewsUrl(selectedUrl);
                        setUrl(selectedUrl);
                      }}
                      selectedUrl={selectedNewsUrl}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="url" className="mt-4">
                  <div className="min-h-[280px]">
                    <label className="block text-sm font-medium mb-1.5">
                      참고 콘텐츠 URL
                    </label>
                    <Input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://blog.example.com/article"
                      required={activeTab === "url"}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      블로그, 뉴스 기사, 기술 문서 등의 URL을 입력하면 해당 콘텐츠를 분석하여 캐러셀을 생성합니다.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <BrandSettings
                tone={tone}
                mainColor={mainColor}
                accentColor={accentColor}
                slideCount={slideCount}
                onToneChange={setTone}
                onMainColorChange={setMainColor}
                onAccentColorChange={setAccentColor}
                onSlideCountChange={setSlideCount}
              />

              <Button
                type="submit"
                size="lg"
                className="w-full text-base"
                disabled={!canGenerate}
              >
                {activeTab === "discover" && !selectedNewsUrl
                  ? "뉴스를 선택해주세요"
                  : "캐러셀 생성하기"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
