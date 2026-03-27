"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-dvh flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-md">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <span className="text-destructive text-xl">!</span>
        </div>
        <h2 className="text-lg font-semibold">오류가 발생했습니다</h2>
        <p className="text-sm text-muted-foreground">
          {error.message || "알 수 없는 오류가 발생했습니다. 다시 시도해주세요."}
        </p>
        <Button onClick={reset} variant="outline">
          다시 시도
        </Button>
      </div>
    </main>
  );
}
