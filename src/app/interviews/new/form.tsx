"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createInterview } from "../actions";
import { InterviewerAvailabilityEditor } from "@/components/interviewer-availability-editor";

export function CreateInterviewForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
      console.log("フォーム送信開始");
      setLoading(true);
      setError(null);
      try {
        const result = await createInterview(formData);
        console.log("Server Action Result:", result);
        
        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else if (result?.success && result?.redirectUrl) {
            console.log("リダイレクト実行:", result.redirectUrl);
            // router.pushでは遷移しない場合があるため、window.location.hrefを使用
            window.location.href = result.redirectUrl;
            // loadingステートは維持
        } else {
            console.error("不明な戻り値:", result);
            setError("サーバーから予期せぬ応答がありました");
            setLoading(false);
        }
      } catch (e) {
        console.error("送信エラー:", e);
        setError("予期せぬエラーが発生しました");
        setLoading(false);
      }
  }

  return (
    <form action={handleSubmit} className="space-y-5">
       {/* 面談タイトル */}
       <div className="space-y-2">
         <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <span className="w-5 h-5 flex items-center justify-center rounded bg-primary/20 text-xs">📋</span>
            面談タイトル
         </label>
         <input 
           name="title" 
           placeholder="例: エンジニア採用面談" 
           required 
           maxLength={100}
           className="w-full h-12 px-4 rounded-xl bg-black/30 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
         />
       </div>

       {/* あなたの名前 */}
       <div className="space-y-2">
         <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <span className="w-5 h-5 flex items-center justify-center rounded bg-primary/20 text-xs">👤</span>
            あなたの名前
         </label>
         <input 
           name="recruiter_name" 
           placeholder="山田 太郎" 
           required 
           maxLength={50}
           className="w-full h-12 px-4 rounded-xl bg-black/30 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
         />
       </div>

       {/* 候補者のメールアドレス */}
       <div className="space-y-2">
         <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <span className="w-5 h-5 flex items-center justify-center rounded bg-primary/20 text-xs">✉️</span>
            候補者のメールアドレス
         </label>
         <input 
           name="candidate_email" 
           type="email"
           placeholder="candidate@example.com" 
           required 
           maxLength={100}
           className="w-full h-12 px-4 rounded-xl bg-black/30 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
         />
       </div>

       <div className="pt-4 border-t border-white/10"></div>

       {/* 空き時間エディタ */}
       <InterviewerAvailabilityEditor />

       <div className="pb-4 border-b border-white/10"></div>

       {/* 送信ボタン */}
       <Button 
         type="submit" 
         disabled={loading} 
         className="w-full h-14 text-lg font-bold rounded-xl bg-linear-to-r from-primary via-purple-500 to-pink-500 hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
       >
         {loading ? (
           <span className="flex items-center gap-2">
             <span className="animate-spin">🌀</span>
             送信中...
           </span>
         ) : (
           <span className="flex items-center gap-2">
             🚀 招待を送信
           </span>
         )}
       </Button>
       
       {error && (
         <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-shake">
            <p className="text-sm text-red-400 text-center font-medium flex items-center justify-center gap-2">
                <span>⚠️</span>
                {error}
            </p>
         </div>
       )}
    </form>
  );
}
