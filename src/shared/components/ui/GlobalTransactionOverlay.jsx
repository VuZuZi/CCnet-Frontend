import { useEffect } from 'react';
import { useTransactionLockStore } from '@/shared/stores/useTransactionLockStore';

export function GlobalTransactionOverlay() {
    const { isLocked, message } = useTransactionLockStore();

    useEffect(() => {
        if (isLocked) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isLocked]);

    if (!isLocked) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
            <div className="flex flex-col items-center gap-5 rounded-3xl bg-white p-8 shadow-2xl animate-in zoom-in-95">
                <div className="relative flex h-16 w-16 items-center justify-center">
                    <div className="absolute h-full w-full animate-spin rounded-full border-4 border-amber-100 border-t-amber-500"></div>
                    <div className="h-8 w-8 rounded-full bg-amber-100 animate-pulse"></div>
                </div>
                <div className="text-center">
                    <h3 className="text-lg font-bold text-slate-900">Vui lòng chờ</h3>
                    <p className="mt-1 text-sm font-medium text-slate-500">{message}</p>
                </div>
            </div>
        </div>
    );
}