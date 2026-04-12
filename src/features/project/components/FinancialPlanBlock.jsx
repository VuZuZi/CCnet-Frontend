import { Controller, useWatch } from 'react-hook-form';
import { CurrencyInput } from '@/shared/components/ui/CurrencyInput';
import { calculatePercentage } from '@/features/project/utils/finance.utils';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export function FinancialPlanBlock({ control, errors }) {
    const targetAmount = useWatch({ control, name: 'targetAmount' }) || 0;
    const mvpAmount = useWatch({ control, name: 'mvpAmount' }) || 0;

    const mvpPercent = calculatePercentage(mvpAmount, targetAmount);
    const isMvpExceed = mvpAmount > targetAmount;
    const isMvpValid = mvpAmount > 0 && !isMvpExceed && targetAmount > 0;

    return (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Kế Hoạch Tài Chính & Giải Ngân</h2>
                    <p className="text-sm text-slate-500 mt-1">Xác định tổng vốn cần gọi và ngưỡng tối thiểu để bắt đầu dự án.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <Controller
                        control={control}
                        name="targetAmount"
                        render={({ field }) => (
                            <CurrencyInput
                                {...field}
                                label="Tổng mục tiêu gọi vốn"
                                placeholder="Ví dụ: 150,000,000"
                                error={errors.targetAmount?.message}
                            />
                        )}
                    />
                    <div className="flex items-start gap-1.5 text-xs text-slate-500">
                        <Info size={14} className="mt-0.5 shrink-0 text-[#fbbf24]" />
                        <p>Tổng số tiền lý tưởng để hoàn thành 100% dự án.</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Controller
                        control={control}
                        name="mvpAmount"
                        render={({ field }) => (
                            <CurrencyInput
                                {...field}
                                label="Ngưỡng giải ngân tối thiểu (MVP)"
                                placeholder="Ví dụ: 50,000,000"
                                error={errors.mvpAmount?.message}
                            />
                        )}
                    />

                    <div className="pt-2">
                        <div className="flex justify-between items-end mb-1.5">
                            <span className="text-xs font-bold text-slate-600">Tỷ lệ MVP / Mục tiêu:</span>
                            <span className={cn(
                                "text-sm font-bold transition-colors duration-300",
                                isMvpExceed ? "text-red-500" : isMvpValid ? "text-emerald-600" : "text-slate-400"
                            )}>
                                {mvpPercent.toFixed(1)}%
                            </span>
                        </div>

                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-500 ease-out",
                                    isMvpExceed ? "bg-red-500" : "bg-[#fbbf24]"
                                )}
                                style={{ width: `${Math.min(mvpPercent, 100)}%` }}
                            />
                        </div>

                        <div className="mt-2 h-5">
                            {isMvpExceed && (
                                <p className="text-xs font-bold text-red-500 flex items-center gap-1 animate-in fade-in zoom-in duration-300">
                                    <AlertCircle size={12} /> MVP không được vượt quá Mục tiêu!
                                </p>
                            )}
                            {isMvpValid && !isMvpExceed && (
                                <p className="text-xs font-medium text-emerald-600 flex items-center gap-1 animate-in fade-in zoom-in duration-300">
                                    <CheckCircle2 size={12} /> Hợp lệ. Dự án sẽ chạy khi đạt {mvpPercent.toFixed(1)}% vốn.
                                </p>
                            )}
                            {!targetAmount && mvpAmount > 0 && (
                                <p className="text-xs font-medium text-amber-500 flex items-center gap-1 animate-in fade-in zoom-in duration-300">
                                    <AlertCircle size={12} /> Vui lòng nhập Tổng mục tiêu trước.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}