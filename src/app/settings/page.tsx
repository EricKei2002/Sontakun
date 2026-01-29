"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Save, Coffee, Mic, RotateCcw } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [lunchPolicy, setLunchPolicy] = useState<"avoid" | "allow" | "none">("avoid");
  const [customInstructions, setCustomInstructions] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadSettings() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setLunchPolicy(data.lunch_policy || "avoid");
        setCustomInstructions(data.custom_instructions || "");
      }
    }
    loadSettings();
  }, [supabase]);

  async function handleSave() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        lunch_policy: lunchPolicy,
        custom_instructions: customInstructions,
        updated_at: new Date().toISOString()
      });

    if (error) {
        alert("保存に失敗しました: " + error.message);
    } else {
        alert("設定を保存しました！");
        router.refresh();
    }
    setLoading(false);
  }

  async function handleReset() {
    if (!confirm("設定を初期状態に戻しますか？")) return;
    
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
        .from('user_settings')
        .delete()
        .eq('user_id', user.id);

    if (error) {
        alert("リセットに失敗しました: " + error.message);
    } else {
        alert("設定をリセットしました");
        setLunchPolicy("avoid");
        setCustomInstructions("");
        router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 relative overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* 戻るボタン */}
        <Link href="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> ダッシュボードに戻る
        </Link>

        {/* メインカード */}
        <div className="relative rounded-3xl border border-white/10 bg-linear-to-br from-secondary/60 to-background/80 backdrop-blur-xl p-8 shadow-2xl">
          
          {/* ソンタくんアバター */}
          <div className="absolute -top-14 left-1/2 -translate-x-1/2">
            <div className="relative w-28 h-28 rounded-full overflow-hidden ring-4 ring-primary/30 shadow-2xl bg-secondary">
              <Image src="/sontakun.jpg" alt="Sontaくん" fill className="object-cover" priority />
            </div>
          </div>

          {/* ヘッダー */}
          <div className="pt-14 pb-6 text-center space-y-2">
            <h1 className="text-2xl font-bold bg-linear-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Sontaくんカスタマイズ
            </h1>
            <p className="text-sm text-muted-foreground">
              あなたの働き方に合わせて提案ロジックを調整
            </p>
          </div>

          <div className="space-y-6">
            {/* お昼休みのルール */}
            <section className="space-y-4 p-5 rounded-2xl bg-black/20 border border-white/5">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Coffee className="w-4 h-4 text-amber-500" />
                </span>
                お昼休みのルール
              </h2>
              <div className="space-y-2">
                {[
                  { value: "avoid", label: "しっかり休む", desc: "12:00〜13:00 は予定を入れない", default: true },
                  { value: "allow", label: "柔軟に調整する", desc: "必要であれば12時台も候補に" },
                  { value: "none", label: "お昼休憩なし", desc: "別の時間に取ります" },
                ].map((opt) => (
                  <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${lunchPolicy === opt.value ? 'border-primary/50 bg-primary/5' : 'border-white/5 hover:bg-white/5'}`}>
                    <input 
                      type="radio" 
                      name="lunch" 
                      value={opt.value} 
                      checked={lunchPolicy === opt.value} 
                      onChange={() => setLunchPolicy(opt.value as typeof lunchPolicy)}
                      className="w-4 h-4 accent-primary" 
                    />
                    <div className="flex-1">
                      <div className="font-medium flex items-center gap-2">
                        {opt.label}
                        {opt.default && <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">デフォルト</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* カスタム指示 */}
            <section className="space-y-4 p-5 rounded-2xl bg-black/20 border border-white/5">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                  <Mic className="w-4 h-4 text-indigo-400" />
                </span>
                Sontaくんへの指示
              </h2>
              <p className="text-xs text-muted-foreground">
                特定の曜日や時間帯についての要望を自由に書いてください
              </p>
              <Textarea 
                placeholder="例: 今週の金曜は予定があるから入れないで、水曜午前は集中したい..." 
                className="min-h-[120px] bg-black/30 border-white/10 rounded-xl resize-none"
                value={customInstructions}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomInstructions(e.target.value)}
              />
            </section>

            {/* ボタン */}
            <div className="flex items-center justify-between pt-4">
              <Button 
                variant="ghost" 
                onClick={handleReset} 
                disabled={loading} 
                className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                リセット
              </Button>
              <Button 
                size="lg" 
                onClick={handleSave} 
                disabled={loading} 
                className="font-bold rounded-xl bg-linear-to-r from-primary via-purple-500 to-pink-500 hover:opacity-90 shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">🔄</span>
                    保存中...
                  </span>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    設定を保存
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
