
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();


  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="space-y-6 max-w-3xl relative z-10">
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto mb-8 animate-float">
          <Image
            src="/sontakun-icon.jpg"
            alt="Sontaくん"
            fill
            className="object-contain drop-shadow-2xl "
            priority
          />
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight bg-linear-to-r from-indigo-400 via-primary to-purple-400 bg-clip-text text-transparent pb-2">
          空気を読む、AI日程調整
        </h1>
        
        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          「12時から13時はランチだから避けたいな...」<br/>
          そんな<span className="text-foreground font-bold">&quot;暗黙の希望&quot;</span>も、Sontaくんが汲み取ります。<br/>
          相手に気を使わせない、新しい日程調整体験を。
        </p>
        {!user && (
          <div className="pt-6">
            <Link href="/login">
              <Button size="lg" className="rounded-full px-8 py-6 text-lg font-bold bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-indigo-500/25 transition-all duration-300">
                Sontaくんを始める
                 <span className="ml-2">→</span>
              </Button>
            </Link>
          </div>
        )}


        <div className="mt-16 grid gap-6 sm:grid-cols-2 text-left">
           <div className="p-6 rounded-2xl bg-secondary/30 backdrop-blur-md border border-white/5 hover:bg-secondary/50 transition-colors">
              <div className="text-3xl mb-3">🍱</div>
              <h3 className="text-lg font-bold mb-2 text-foreground">ランチタイム考慮</h3>
              <p className="text-sm text-muted-foreground">お昼休み（12:00-13:00）を避けて提案します。お腹が空いていては良い面談はできません。</p>
           </div>
           <div className="p-6 rounded-2xl bg-secondary/30 backdrop-blur-md border border-white/5 hover:bg-secondary/50 transition-colors">
              <div className="text-3xl mb-3">🚃</div>
              <h3 className="text-lg font-bold mb-2 text-foreground">移動時間確保</h3>
              <p className="text-sm text-muted-foreground">前後の予定との間に十分な移動時間を確保。焦らず余裕を持って参加できます。</p>
           </div>
        </div>
      </div>

    </main>
  );
}
