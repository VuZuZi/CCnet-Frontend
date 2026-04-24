import { Controller } from 'react-hook-form';
import { CurrencyInput } from '@/shared/components/ui/CurrencyInput';
import { Info } from 'lucide-react';

export function FinancialPlanBlock({ control, errors }) {
    return (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-8">
            <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-xl font-bold text-slate-900">Kế Hoạch Tài Chính & Giải Ngân</h2>
                <p className="text-sm text-slate-500 mt-2">Xác định tổng ngân sách cần gọi cho dự án.</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-3">
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
                <div className="flex items-start gap-1.5 text-sm text-slate-600 bg-amber-50/50 p-4 rounded-xl border border-amber-100/50">
                    <Info size={16} className="mt-0.5 shrink-0 text-amber-500" />
                    <p>Tổng số tiền lý tưởng để hoàn thành 100% dự án (Bắt buộc phải khớp với tổng phân bổ của các Mốc bên dưới).</p>
                </div>
            </div>
        </div>
    );
}