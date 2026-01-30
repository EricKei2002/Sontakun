import { CreateInterviewForm } from "./form";
import Image from "next/image";

export default function NewInterviewPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-20 relative overflow-x-hidden">
      {/* 背景装飾 */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-lg mx-auto">
        {/* メインカード */}
        <div className="relative rounded-3xl border border-white/10 bg-linear-to-br from-secondary/60 to-background/80 backdrop-blur-xl p-8 md:p-10 shadow-2xl">
          
          {/* ソンタくんアバター - 上部に配置 */}
          <div className="absolute -top-14 left-1/2 -translate-x-1/2">
            <div className="relative w-28 h-28 rounded-full overflow-hidden ring-4 ring-primary/30 shadow-2xl bg-secondary">
              <Image 
                src="/sontakun.jpg" 
                alt="Sontaくん" 
                fill 
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* ヘッダー */}
          <div className="pt-14 pb-6 text-center space-y-2">
            <h1 className="text-2xl font-bold bg-linear-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
              新しい日程調整を作成
            </h1>
            <p className="text-sm text-muted-foreground">
              候補者にスマートな招待を送信しましょう
            </p>
          </div>

          {/* ステップ表示 */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-primary text-xs font-bold text-white">1</span>
              <span className="text-xs font-medium text-primary">情報入力</span>
            </div>
            <div className="w-8 h-px bg-white/20" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white/20 text-xs font-bold text-muted-foreground">2</span>
              <span className="text-xs font-medium text-muted-foreground">招待送信</span>
            </div>
            <div className="w-8 h-px bg-white/20" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white/20 text-xs font-bold text-muted-foreground">3</span>
              <span className="text-xs font-medium text-muted-foreground">AI調整</span>
            </div>
          </div>

          {/* フォーム */}
          <CreateInterviewForm />

          {/* フッター */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-muted-foreground">
              💡 登録済みユーザーには<span className="text-primary font-medium">アプリ内通知</span>、
              それ以外は<span className="text-primary font-medium">メール招待</span>が届きます
            </p>
          </div>
        </div>

        {/* 吹き出し - モバイルでは非表示 */}
        <div className="hidden md:block absolute -right-4 top-1/3 translate-x-full max-w-[200px]">
          <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-2xl shadow-lg">
            <div className="absolute -left-2 top-6 w-4 h-4 bg-white/5 border-l border-b border-white/10 transform rotate-45" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="text-primary font-bold">ヒント:</span><br/>
              候補者が返信したら、<br/>
              AIが最適な日程を提案するよ！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
