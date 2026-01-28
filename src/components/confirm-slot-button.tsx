"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { requestConfirmation } from "@/app/actions/confirmation";
import { Send, Loader2, Video, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

interface ConfirmSlotButtonProps {
    interviewId: string;
    availabilityId: string;
    slotStart: string;
    slotEnd: string;
    candidateEmail?: string;
}

type MeetingProvider = 'google_meet' | 'zoom';

export function ConfirmSlotButton({ 
    interviewId, 
    availabilityId, 
    slotStart, 
    slotEnd,
    candidateEmail 
}: ConfirmSlotButtonProps) {
    const [loading, setLoading] = useState(false);
    const [provider, setProvider] = useState<MeetingProvider>('google_meet');
    const [showDropdown, setShowDropdown] = useState(false);
    const router = useRouter();

    async function handleRequestConfirmation() {
        setLoading(true);
        try {
            const result = await requestConfirmation(
                interviewId, 
                availabilityId, 
                slotStart, 
                slotEnd,
                provider,
                candidateEmail
            );
            if (result.success) {
                const message = candidateEmail 
                    ? "候補者にメールで確認依頼を送信しました！"
                    : "確認依頼を送信しました！候補者にURLを共有してください。";
                alert(message);
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

    const providerOptions: { value: MeetingProvider; label: string; icon: string }[] = [
        { value: 'google_meet', label: 'Google Meet', icon: '📹' },
        { value: 'zoom', label: 'Zoom', icon: '💻' },
    ];

    const selectedOption = providerOptions.find(o => o.value === provider)!;

    return (
        <div className="space-y-2">
            {/* 会議方法選択 */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm hover:border-primary/50 transition-colors"
                >
                    <span className="flex items-center gap-2">
                        <span>{selectedOption.icon}</span>
                        <span>{selectedOption.label}</span>
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-secondary border border-white/10 rounded-lg overflow-hidden z-10 shadow-xl">
                        {providerOptions.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    setProvider(option.value);
                                    setShowDropdown(false);
                                }}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-primary/20 transition-colors ${
                                    provider === option.value ? 'bg-primary/10 text-primary' : ''
                                }`}
                            >
                                <span>{option.icon}</span>
                                <span>{option.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* 確認依頼ボタン */}
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
                        <Video className="w-4 h-4 mr-2" />
                        <Send className="w-4 h-4 mr-2" />
                        確認依頼
                    </>
                )}
            </Button>
        </div>
    );
}
