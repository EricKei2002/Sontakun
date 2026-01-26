import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-8 w-48 h-48 sm:w-64 sm:h-64 p-2 bg-linear-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 backdrop-blur-sm animate-float">
        <div className="w-full h-full  overflow-hidden ring-4 ring-primary/50 shadow-2xl shadow-primary/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/sontakun.jpg" alt="Sontakun" className="object-cover w-full h-full transform transition-transform hover:scale-110 duration-700" />
        </div>
      </div>
      
      <div className="space-y-4 max-w-2xl mx-auto">
        <h1 className="text-5xl sm:text-7xl font-bold bg-linear-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent tracking-tight">
          Sontaくん
        </h1>
        <p className="text-xl sm:text-2xl text-muted-foreground leading-relaxed font-medium">
          空気を読むAI日程調整ツール
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 max-w-4xl w-full">
         <div className="p-6 rounded-2xl bg-secondary/30 backdrop-blur-md border border-white/5 hover:bg-secondary/50 transition-colors text-left">
            <div className="text-3xl mb-3">🍱</div>
            <h3 className="text-lg font-bold mb-2 text-foreground">ランチタイム考慮</h3>
            <p className="text-sm text-muted-foreground">お昼休み（12:00-13:00）を避けて提案します。お腹が空いていては良い面談はできません。</p>
         </div>
         <div className="p-6 rounded-2xl bg-secondary/30 backdrop-blur-md border border-white/5 hover:bg-secondary/50 transition-colors text-left">
            <div className="text-3xl mb-3">🚃</div>
            <h3 className="text-lg font-bold mb-2 text-foreground">移動時間確保</h3>
            <p className="text-sm text-muted-foreground">前後の予定との間に十分な移動時間を確保。焦らず余裕を持って参加できます。</p>
         </div>
      </div>
      
      <div className="mt-12 w-full max-w-sm">
          <Link href="/interviews/new" className="w-full">
            <Button size="lg" className="w-full h-14 text-lg font-bold rounded-full bg-linear-to-r from-primary to-indigo-600 hover:scale-105 transition-all shadow-xl shadow-primary/20">
              新しい面談を作成する ✨
            </Button>
          </Link>
      </div>
      
      <div className="mt-16">
        <Link 
          href="https://www.burst.style/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-block p-4 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm hover:bg-primary/10 transition-colors"
        >
          <p className="text-xs sm:text-sm font-mono text-primary/80">
            Powered by Burst Style
          </p>
        </Link>
      </div>
    </main>
  );
}
