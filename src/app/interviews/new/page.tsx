import { CreateInterviewForm } from "./form";
import Image from "next/image";

export default function NewInterviewPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="grid w-full max-w-5xl gap-12 lg:grid-cols-2 lg:items-center mx-auto">
        
        {/* Left Side: Form */}
        <div className="w-full max-w-md mx-auto space-y-8 rounded-3xl border border-white/10 bg-secondary/30 backdrop-blur-md p-10 shadow-xl">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Sontaくん
            </h1>
            <p className="text-muted-foreground">新規日程調整を作成</p>
          </div>
          <CreateInterviewForm />
        </div>

        {/* Right Side: Tutorial */}
        <div className="hidden lg:flex flex-col items-center justify-center gap-8">
           
           {/* Speech Bubble */}
           <div className="relative bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl max-w-sm shadow-xl animate-fade-in-up">
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white/10 border-r border-b border-white/20 transform rotate-45"></div>
              <h3 className="text-xl font-bold mb-2 text-primary">はじめまして！Sontaくんです。</h3>
              <p className="text-muted-foreground leading-relaxed">
                日程調整のお手伝いをするよ。<br/>
                <span className="text-foreground font-bold">面談のタイトル</span>と<br/>
                <span className="text-foreground font-bold">候補者のメールアドレス</span>を入力するだけ！<br/><br/>
                招待を送信したら、<br/>
                あとは僕がいい感じに調整するよ！
              </p>
           </div>

           <div className="relative w-72 h-72 hover:scale-105 transition-transform duration-700 animate-float">
             <Image 
               src="/sontakun-transparent.png" 
               alt="Sontaくん" 
               fill 
               className="object-contain drop-shadow-2xl"
               priority
             />
           </div>
        </div>

      </div>
    </div>
  );
}
