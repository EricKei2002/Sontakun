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

function GoogleMeetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z" fill="white" fillOpacity="0.01"/>
      <path d="M7 9C7 7.9 7.9 7 9 7H15C16.1 7 17 7.9 17 9V15C17 16.1 16.1 17 15 17H9C7.9 17 7 16.1 7 15V9Z" fill="white"/>
       {/* Simplified colored paths */}
       <path d="M7 9H12V12H7V9Z" fill="#EA4335"/>
       <path d="M12 9H17V12H12V9Z" fill="#4285F4"/>
       <path d="M7 12H12V15H7V12Z" fill="#FBBC04"/>
       <path d="M12 12H17V15H12V12Z" fill="#34A853"/>
       <path d="M17 10L21 8V16L17 14V10Z" fill="#34A853"/>
    </svg>
  );
}

function ZoomIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="#2D8CFF"/>
      <path d="M16 11.2V9.4C16 8.52 15.28 7.8 14.4 7.8H6.6C5.72 7.8 5 8.52 5 9.4V14.6C5 15.48 5.72 16.2 6.6 16.2H14.4C15.28 16.2 16 15.48 16 14.6V12.8L19 14.9V9.1L16 11.2Z" fill="white"/>
    </svg>
  );
}

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

    const providerOptions: { value: MeetingProvider; label: string; icon: React.ReactNode }[] = [
        { value: 'google_meet', label: 'Google Meet', icon: <GoogleMeetIcon className="w-5 h-5" /> },
        { value: 'zoom', label: 'Zoom', icon: <ZoomIcon className="w-5 h-5" /> },
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
