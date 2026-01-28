"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { requestConfirmation } from "@/app/actions/confirmation";
import { Send, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ConfirmSlotButtonProps {
    interviewId: string;
    availabilityId: string;
    slotStart: string;
    slotEnd: string;
}

export function ConfirmSlotButton({ interviewId, availabilityId, slotStart, slotEnd }: ConfirmSlotButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleRequestConfirmation() {
        setLoading(true);
        try {
            const result = await requestConfirmation(interviewId, availabilityId, slotStart, slotEnd);
            if (result.success) {
                alert("候補者に確認依頼を送信しました！");
                router.refresh();
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

    return (
        <Button 
            size="sm" 
            onClick={handleRequestConfirmation} 
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white w-full"
        >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    送信中...
                </>
            ) : (
                <>
                    <Send className="w-4 h-4 mr-2" />
                    確認依頼
                </>
            )}
        </Button>
    );
}
