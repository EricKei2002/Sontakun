"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { confirmInterview } from "@/app/dashboard/actions";
import { Check } from "lucide-react";
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

    async function handleConfirm() {
        if (!confirm("Googleカレンダーにこの予定を作成してもよろしいですか？")) return;
        
        setLoading(true);
        try {
            await confirmInterview(interviewId, availabilityId, slotStart, slotEnd);
            alert("予定を確定しました！");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("エラーが発生しました。Googleカレンダー連携が切れている可能性があります。「連携する」ボタンから再連携してください。");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button 
            size="sm" 
            onClick={handleConfirm} 
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white"
        >
            {loading ? (
                <span className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin mr-2" />
            ) : (
                <Check className="w-4 h-4 mr-1" />
            )}
            確定
        </Button>
    );
}
