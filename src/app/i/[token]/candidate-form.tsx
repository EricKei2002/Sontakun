"use client";
/**
 * Candidate Form Component
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { submitAvailability } from "../actions";

export function CandidateForm({ token }: { token: string }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
      setLoading(true);
      await submitAvailability(token, formData);
  }

  return (
    <form action={handleSubmit} className="space-y-6 relative z-10">
       <div className="space-y-2">
         <textarea 
            name="availability"
            className="w-full min-h-[160px] p-5 rounded-2xl border border-white/10 bg-black/20 text-lg placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 focus:outline-none resize-none transition-all shadow-inner"
            placeholder="例: 来週の火曜か水曜の午後なら空いてます。12時から13時はお昼休みなので避けてもらえると助かります。あと月曜の午前中は会議があるのでNGでお願いします。"
            required
         />
       </div>
       <div className="flex justify-center sm:justify-end">
        <Button 
            type="submit" 
            disabled={loading} 
            size="lg" 
            className="rounded-full px-10 py-6 text-lg font-bold bg-linear-to-r from-indigo-500 to-purple-600 hover:opacity-90 transition-all shadow-lg shadow-purple-900/20"
        >
            {loading ? (
                <span className="flex items-center gap-2">
                    <span className="animate-spin text-xl">🌀</span> 空気を読んでいます...
                </span>
            ) : "AIに送る"}
        </Button>
       </div>
    </form>
  );
}
