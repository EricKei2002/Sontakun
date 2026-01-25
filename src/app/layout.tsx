import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Sontakun (ソンタくん) | AI日程調整",
  description: "空気を読むAI日程調整ツール。ランチタイムや前後の余裕を考慮した、思いやりのあるスケジュール提案。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSansJP.variable} font-sans antialiased min-h-screen flex flex-col`}
      >
        <Header />
        <div className="flex-1 pt-16">
           {children}
        </div>
        <div className="fixed inset-0 -z-10 bg-[url('/grid.svg')] bg-center mask-[linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </body>
    </html>
  );
}
