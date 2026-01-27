"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, FileJson } from "lucide-react";

import { ExtractedConstraints } from "@/lib/gemini";

interface ConstraintsViewerProps {
  constraints: ExtractedConstraints | unknown;
}

export function ConstraintsViewer({ constraints }: ConstraintsViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between p-4 rounded-xl border bg-white/5">
         <span className="text-sm text-muted-foreground font-medium flex items-center gap-2">
            <FileJson className="w-4 h-4" />
            Sontaくんの分析データ
         </span>
         <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
            詳しく見る
         </Button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl p-6 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
              
              <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                     <FileJson className="w-5 h-5 text-primary" />
                     Sontaくんが読み取った条件
                  </h3>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full hover:bg-white/10">
                      <X className="w-5 h-5" />
                  </Button>
              </div>

              <div className="overflow-auto flex-1 rounded-xl border bg-black/50 p-4">
                  <pre className="text-xs text-muted-foreground font-mono leading-relaxed">
                      {JSON.stringify(constraints, null, 2)}
                  </pre>
              </div>
              
              <div className="mt-4 flex justify-end">
                  <Button onClick={() => setIsOpen(false)}>閉じる</Button>
              </div>
           </div>
        </div>
      )}
    </>
  );
}
