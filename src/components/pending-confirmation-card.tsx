"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { respondToConfirmation } from "@/app/actions/confirmation";
import { Check, X, Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface PendingConfirmationCardProps {
    token: string;
    availabilityId: string;
    pendingSlot: {
        start: string;
        end: string;
    };
    interviewTitle: string;
}

export function PendingConfirmationCard({ 
    token, 
    availabilityId, 
    pendingSlot, 
    interviewTitle 
}: PendingConfirmationCardProps) {
    const [loading, setLoading] = useState(false);
    const [responded, setResponded] = useState(false);
    const [accepted, setAccepted] = useState<boolean | null>(null);

    const startDate = new Date(pendingSlot.start);
    const endDate = new Date(pendingSlot.end);

    async function handleResponse(accept: boolean) {
        setLoading(true);
        try {
            const result = await respondToConfirmation(token, availabilityId, accept);
            if (result.success) {
                setResponded(true);
                setAccepted(accept);
            } else {
                alert(result.error || "エラーが発生しました");
            }
        } catch (error) {
            console.error(error);
            alert("エラーが発生しました");
        } finally {
            setLoading(false);
        }
    }

    if (responded) {
        return (
            <div className="bg-black/20 backdrop-blur-xl border border-white/10 p-6 rounded-2xl text-center">
                {accepted ? (
                    <div className="space-y-3">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                            <Check className="w-8 h-8 text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-green-400">日程が確定しました！</h3>
                        <p className="text-muted-foreground">
                            {format(startDate, "M月d日 (EEEE)", { locale: ja })}
                            <br />
                            {format(startDate, "HH:mm")} - {format(endDate, "HH:mm")}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
                            <Calendar className="w-8 h-8 text-yellow-400" />
                        </div>
                        <h3 className="text-xl font-bold text-yellow-400">別の日時をリクエストしました</h3>
                        <p className="text-muted-foreground">
                            担当者に再調整を依頼しました。
                        </p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="bg-linear-to-r from-indigo-500/10 to-purple-500/10 backdrop-blur-xl border border-primary/50 p-6 rounded-2xl">
            <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                    確認待ち
                </div>
                <h3 className="text-xl font-bold mb-2">{interviewTitle}</h3>
                <p className="text-muted-foreground">以下の日程でよろしいですか？</p>
            </div>

            <div className="bg-black/20 rounded-xl p-6 mb-6 text-center">
                <p className="text-2xl font-bold text-primary mb-1">
                    {format(startDate, "M月d日 (EEEE)", { locale: ja })}
                </p>
                <p className="text-4xl font-mono text-white">
                    {format(startDate, "HH:mm")} - {format(endDate, "HH:mm")}
                </p>
            </div>

            <div className="flex gap-3">
                <Button
                    variant="outline"
                    className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                    onClick={() => handleResponse(false)}
                    disabled={loading}
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <>
                            <X className="w-4 h-4 mr-2" />
                            別の日時を希望
                        </>
                    )}
                </Button>
                <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleResponse(true)}
                    disabled={loading}
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <>
                            <Check className="w-4 h-4 mr-2" />
                            この時間でOK
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
