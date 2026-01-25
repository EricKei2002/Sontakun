export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
      <div className="mb-8 relative w-40 h-40 rounded-full overflow-hidden border-4 border-primary shadow-2xl shadow-primary/50 animate-bounce">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/sontakun.jpg" alt="Sontakun" className="object-cover w-full h-full" />
      </div>
      <h1 className="text-6xl font-bold bg-linear-to-r from-indigo-400 to-purple-600 bg-clip-text text-transparent mb-4">
        Sontakun
      </h1>
      <p className="text-xl text-muted-foreground max-w-lg mb-8">
        空気を読むAI日程調整ツール。<br />
        相手の都合、ランチタイム、移動時間を考慮した、<br />
        世界で一番思いやりのあるスケジュールを提案します。
      </p>
      
      <div className="mt-12 p-6 rounded-xl border bg-secondary/30 backdrop-blur-sm">
        <p className="text-sm font-mono text-muted-foreground">System Status: Initialization Complete</p>
      </div>
    </main>
  );
}
