import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-dvh flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold">404</h2>
        <p className="text-muted-foreground">페이지를 찾을 수 없습니다</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
