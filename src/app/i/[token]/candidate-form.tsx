"use client";
/**
 * Candidate Form Component
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { submitAvailability } from "../actions";
import { Loader2, Sparkles } from "lucide-react";

interface CandidateFormProps {
  token: string;
  defaultEmail?: string;
}

export function CandidateForm({ token, defaultEmail }: CandidateFormProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
      setLoading(true);
      await submitAvailability(token, formData);
  }

  return (
    <form action={handleSubmit} className="space-y-6 relative z-10">
       <div className="space-y-2">
         <label htmlFor="email" className="block text-sm font-medium text-foreground">
           メールアドレス
         </label>
         <input
           type="email"
           id="email"
           name="email"
           defaultValue={defaultEmail}
           className="w-full p-4 rounded-xl border border-white/10 bg-black/20 text-base placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:outline-none transition-all shadow-inner"
           placeholder="your.email@example.com"
           required
         />
         <p className="text-xs text-muted-foreground">
           確定通知を受け取るために必要です
         </p>
       </div>
       
       <div className="space-y-2">
         <label htmlFor="availability" className="block text-sm font-medium text-foreground">
           ご都合の良い日時
         </label>
         <textarea 
            id="availability"
            name="availability"
            className="w-full min-h-[160px] p-5 rounded-2xl border border-white/10 bg-black/20 text-lg placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:outline-none resize-none transition-all shadow-inner"
            placeholder="例: 来週の火曜か水曜の午後なら空いてます。12時から13時はお昼休みなので避けてもらえると助かります。あと月曜の午前中は会議があるのでNGでお願いします。"
            required
            maxLength={2000}
         />
       </div>
       <div className="flex justify-center sm:justify-end">
        <Button 
            type="submit" 
            disabled={loading} 
            size="lg" 
            className="rounded-full px-10 py-6 text-lg font-bold bg-linear-to-r from-indigo-500 to-purple-600 hover:opacity-90 transition-all shadow-lg shadow-purple-900/20 w-full sm:w-auto text-white disabled:opacity-70"
        >
            {loading ? (
                <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>Sontaくんが調整中...</span>
                </span>
            ) : (
                <span className="flex items-center gap-2">
                    AIに送る <Sparkles className="w-5 h-5" />
                </span>
            )}
        </Button>
       </div>
    </form>
  );
}
