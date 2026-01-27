"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageSquareQuote } from "lucide-react";

interface FormattedMessageViewerProps {
  rawText: string;
  formalText?: string;
}

export function FormattedMessageViewer({ rawText, formalText }: FormattedMessageViewerProps) {
  const [showRaw, setShowRaw] = useState(false);

  // If no formal text is available, just show raw text without toggle
  if (!formalText) {
    return (
        <div className="p-6 rounded-xl border bg-muted/20 backdrop-blur-sm">
            <p className="italic text-lg text-foreground/90 leading-relaxed">&quot;{rawText}&quot;</p>
        </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="p-6 rounded-xl border bg-linear-to-br from-indigo-500/5 to-purple-500/5 backdrop-blur-sm relative transition-all duration-300">
        
        {/* Label Badge */}
        <div className="absolute top-3 left-3 flex gap-2">
            {!showRaw ? (
                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                    <Sparkles className="w-3 h-3" /> Sontaくん整形済み
                </span>
            ) : (
                <span className="bg-gray-500/10 text-gray-400 border border-gray-500/20 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                    <MessageSquareQuote className="w-3 h-3" /> 原文
                </span>
            )}
        </div>

        {/* Content */}
        <div className="mt-4">
             <p className={`text-lg leading-relaxed ${showRaw ? "text-muted-foreground italic" : "text-foreground font-medium"}`}>
                &quot;{showRaw ? rawText : formalText}&quot;
             </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowRaw(!showRaw)}
            className="text-xs text-muted-foreground hover:text-foreground"
        >
            {showRaw ? (
                <>
                   <Sparkles className="w-3 h-3 mr-1" />
                   Sontaくんによる整形文章を見る
                </>
            ) : (
                <>
                   <MessageSquareQuote className="w-3 h-3 mr-1" />
                   原文を見る
                </>
            )}
        </Button>
      </div>
    </div>
  );
}
