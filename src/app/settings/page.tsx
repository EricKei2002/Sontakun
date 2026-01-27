"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Coffee, Mic } from "lucide-react";

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
    <div className="container max-w-2xl mx-auto py-12 min-h-screen">
      <Link href="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="w-4 h-4 mr-2" /> ダッシュボードに戻る
      </Link>

      <h1 className="text-3xl font-bold mb-2">Sontaくんカスタマイズ</h1>
      <p className="text-muted-foreground mb-10">
        あなたの働き方に合わせて、Sontaくんの提案ロジックを調整します。
      </p>

      <div className="space-y-8">
        {/* Lunch Policy */}
        <section className="space-y-4 p-6 rounded-2xl bg-secondary/20 border border-white/5">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <Coffee className="w-5 h-5 text-amber-500" />
                お昼休みのルール
            </h2>
            <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:bg-white/5 cursor-pointer transition-colors">
                    <input 
                        type="radio" 
                        name="lunch" 
                        value="avoid" 
                        checked={lunchPolicy === "avoid"} 
                        onChange={() => setLunchPolicy("avoid")}
                        className="w-4 h-4 accent-primary" 
                    />
                    <div>
                        <div className="font-bold">しっかり休む (デフォルト)</div>
                        <div className="text-sm text-muted-foreground">12:00〜13:00 は予定を入れないようにします。</div>
                    </div>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:bg-white/5 cursor-pointer transition-colors">
                    <input 
                        type="radio" 
                        name="lunch" 
                        value="allow" 
                        checked={lunchPolicy === "allow"} 
                        onChange={() => setLunchPolicy("allow")}
                        className="w-4 h-4 accent-primary" 
                    />
                    <div>
                        <div className="font-bold">柔軟に調整する</div>
                        <div className="text-sm text-muted-foreground">必要であれば12時台も候補に入れます。</div>
                    </div>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:bg-white/5 cursor-pointer transition-colors">
                    <input 
                        type="radio" 
                        name="lunch" 
                        value="none" 
                        checked={lunchPolicy === "none"} 
                        onChange={() => setLunchPolicy("none")}
                        className="w-4 h-4 accent-primary" 
                    />
                    <div>
                        <div className="font-bold">お昼休憩なし</div>
                        <div className="text-sm text-muted-foreground">お昼休みは不要、または別の時間に取ります。</div>
                    </div>
                </label>
            </div>
        </section>

        {/* Custom Instructions */}
        <section className="space-y-4 p-6 rounded-2xl bg-secondary/20 border border-white/5">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <Mic className="w-5 h-5 text-indigo-400" />
                Sontaくんへの指示（自由記述）
            </h2>
            <p className="text-sm text-muted-foreground">
                特定の曜日や時間帯についての要望があれば、自由に書いてください。<br/>
                （例：「今週の金曜日は予定があるから入れないで」「水曜日の午前中は集中したい」「ギャル語で話して」など）
            </p>
            <Textarea 
                placeholder="ここに指示を入力..." 
                className="min-h-[150px] bg-black/20"
                value={customInstructions}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomInstructions(e.target.value)}
            />
        </section>

        <div className="pt-4 flex justify-between">
            <Button variant="ghost" onClick={handleReset} disabled={loading} className="text-muted-foreground hover:text-red-400">
                設定をリセット
            </Button>
            <Button size="lg" onClick={handleSave} disabled={loading} className="font-bold">
                {loading ? "保存中..." : (
                    <>
                        <Save className="w-4 h-4 mr-2" />
                        設定を保存する
                    </>
                )}
            </Button>
        </div>
      </div>
    </div>
  );
}
