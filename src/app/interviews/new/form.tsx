"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createInterview } from "../actions";

export function CreateInterviewForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
      setLoading(true);
      setError(null);
      try {
        const result = await createInterview(formData);
        if (result && result.error) {
            setError(result.error);
            setLoading(false);
        }
      } catch (e) {
        console.error(e);
        setError("予期せぬエラーが発生しました: " + (e instanceof Error ? e.message : String(e)));
        setLoading(false);
      }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
       <div className="space-y-2">
         <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            面談タイトル
         </label>
         <Input name="title" placeholder="例: エンジニア採用面談" required maxLength={100} />
       </div>
       <div className="space-y-2">
         <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            あなたの名前
         </label>
         <Input name="recruiter_name" placeholder="山田 太郎" required maxLength={50} />
       </div>
       <div className="space-y-2">
         <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            候補者のメールアドレス
         </label>
         <Input 
           name="candidate_email" 
           type="email"
           placeholder="candidate@example.com" 
           required 
           maxLength={100} 
         />
         <p className="text-xs text-muted-foreground">
           候補者に日程調整の招待が送信されます
         </p>
       </div>
       <Button type="submit" disabled={loading} className="w-full h-12 text-lg font-bold bg-linear-to-r from-primary to-indigo-600 hover:opacity-90 transition-all">
         {loading ? "送信中..." : "招待を送信"}
       </Button>
       
       {error && (
         <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400 text-center font-bold">
                {error}
            </p>
         </div>
       )}
    </form>
  );
}
