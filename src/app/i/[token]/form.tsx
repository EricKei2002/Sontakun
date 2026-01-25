"use client";

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
    <form action={handleSubmit} className="space-y-6">
       <div className="space-y-2">
         <textarea 
            name="availability"
            className="w-full min-h-[150px] p-4 rounded-xl border bg-background/50 text-lg focus:ring-2 focus:ring-primary focus:outline-none resize-none placeholder:text-muted-foreground/50"
            placeholder="例: 来週の火曜か水曜の午後なら空いてます。12時から13時はお昼休みなので避けてもらえると助かります。あと月曜の午前中は会議があるのでNGでお願いします。"
            required
         />
       </div>
       <div className="flex justify-end">
        <Button type="submit" disabled={loading} size="lg" className="rounded-full px-8 text-base">
            {loading ? "空気を読んでいます..." : "AIに送る"}
        </Button>
       </div>
    </form>
  );
}
