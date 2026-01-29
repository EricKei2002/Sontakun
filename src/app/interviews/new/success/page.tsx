
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Home, Plus } from "lucide-react";

export default function InterviewSentPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl text-center space-y-6">
        
        <div className="w-24 h-24 mx-auto bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/40 animate-bounce-subtle">
            <Check className="w-8 h-8 text-black stroke-[3]" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-linear-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            招待を送信しました！
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            候補者に日程調整の依頼を送りました。<br/>
            回答があるまでしばらくお待ちください。
          </p>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <Link href="/dashboard" className="w-full">
            <Button size="lg" className="w-full h-14 text-lg font-bold bg-white text-black hover:bg-white/90 shadow-xl shadow-white/10">
              <Home className="w-5 h-5 mr-2" />
              ダッシュボードに戻る
            </Button>
          </Link>
          
          <Link href="/interviews/new" className="w-full">
            <Button variant="ghost" className="w-full h-12 text-white/50 hover:text-white hover:bg-white/5">
              <Plus className="w-4 h-4 mr-2" />
              続けて別の招待を送る
            </Button>
          </Link>
        </div>

      </div>
    </main>
  );
}
