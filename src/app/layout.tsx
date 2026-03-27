import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InstaForge — AI Instagram Carousel Studio",
  description:
    "실시간 트렌드를 기반으로 전문가급 인스타그램 캐러셀을 자동 생성합니다",
  openGraph: {
    title: "InstaForge — AI Instagram Carousel Studio",
    description: "실시간 트렌드를 기반으로 전문가급 인스타그램 캐러셀을 자동 생성합니다",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geist.variable} antialiased`}>
      <body className="min-h-dvh bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
