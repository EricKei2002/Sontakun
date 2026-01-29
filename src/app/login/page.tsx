import Link from "next/link";
import Image from "next/image";
import { UserAuthForm } from "@/components/user-auth-form";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* メインカード */}
        <div className="relative rounded-3xl border border-white/10 bg-linear-to-br from-secondary/60 to-background/80 backdrop-blur-xl p-8 md:p-10 shadow-2xl">
          
          {/* ソンタくんアバター */}
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
              Sontaくんにログイン
            </h1>
            <p className="text-sm text-muted-foreground">
              AIと一緒に日程調整を始めよう
            </p>
          </div>

          {/* 認証フォーム */}
          <UserAuthForm />

          {/* 利用規約 */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-muted-foreground leading-relaxed">
              続行することで、
              <Link href="/terms" className="text-primary hover:underline mx-1">
                利用規約
              </Link>
              および
              <Link href="/privacy" className="text-primary hover:underline mx-1">
                プライバシーポリシー
              </Link>
              に同意したものとみなされます。
            </p>
          </div>
        </div>

        {/* ヒント */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            💡 招待リンクから来た方は、そのままログインしてください
          </p>
        </div>
      </div>
    </div>
  );
}
