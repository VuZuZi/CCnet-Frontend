import { useFieldArray, useWatch } from 'react-hook-form';
import { calculateUnallocatedAmount } from '@/features/project/utils/finance.utils';
import { Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MilestoneItem } from './MilestoneItem';

const cn = (...inputs) => twMerge(clsx(inputs));

export function MilestonesBlock({ control, errors, isFunded, projectStartDate, projectEndDate }) {
  const { fields, append, remove } = useFieldArray({ control, name: "milestones" });

  const targetAmount = useWatch({ control, name: 'targetAmount' }) || 0;
  const milestones = useWatch({ control, name: 'milestones' }) || [];

  const unallocatedAmount = calculateUnallocatedAmount(targetAmount, milestones);
  const allocatedAmount = targetAmount - unallocatedAmount;
  const allocationPercent = targetAmount > 0
    ? Math.min((allocatedAmount / targetAmount) * 100, 100)
    : 0;

  const isPerfectlyAllocated = unallocatedAmount === 0 && targetAmount > 0;
  const isOverAllocated = unallocatedAmount < 0;

  return (
    <div className="bg-white rounded-[28px] p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">

        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900 mb-1">
            Tiến độ thực thi (các mốc)
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Chia dự án thành các giai đoạn để dễ quản lý và giải ngân.
          </p>

          {/* PROGRESS BAR */}
          {isFunded && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">

              <div className="flex justify-between items-end mb-2 text-sm font-bold">
                <span className="text-slate-600">Phân bổ ngân sách</span>

                <span className={cn(
                  isPerfectlyAllocated && "text-emerald-600",
                  isOverAllocated && "text-red-500",
                  !isPerfectlyAllocated && !isOverAllocated && "text-amber-500"
                )}>
                  {allocatedAmount.toLocaleString()} / {targetAmount.toLocaleString()} đ
                </span>
              </div>

              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isPerfectlyAllocated && "bg-emerald-500",
                    isOverAllocated && "bg-red-500",
                    !isPerfectlyAllocated && !isOverAllocated && "bg-[#fbbf24]"
                  )}
                  style={{ width: `${allocationPercent}%` }}
                />
              </div>

              <div className="mt-2 flex justify-between items-center text-xs">
                <span className="text-slate-500">
                  {isOverAllocated ? "Vượt mức:" : "Chưa phân bổ:"}
                  <span className={cn(
                    "ml-1 font-bold",
                    isOverAllocated ? "text-red-500" : "text-amber-500"
                  )}>
                    {Math.abs(unallocatedAmount).toLocaleString()} đ
                  </span>
                </span>

                {isPerfectlyAllocated && (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 size={14} /> Đã khớp
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ADD BUTTON */}
        <button
          type="button"
          onClick={() =>
            append({
              title: '',
              description: '',
              targetAmount: 0,
              startDate: '',
              endDate: '',
              deliverables: ''
            })
          }
          className="px-5 py-2.5 bg-[#fbbf24] text-white font-bold rounded-xl text-sm hover:bg-[#f59e0b] transition-all flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /> Thêm mốc
        </button>
      </div>

      {/* ERROR */}
      {errors.milestones_sum && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-bold text-sm flex items-center gap-2">
          <AlertCircle size={18} /> {errors.milestones_sum.message}
        </div>
      )}

      {/* LIST */}
      <div className="space-y-6">
        {fields.map((field, idx) => (
          <MilestoneItem
            key={field.id}
            idx={idx}
            field={field}
            remove={remove}
            isFunded={isFunded}
            projectStartDate={projectStartDate}
            projectEndDate={projectEndDate}
          />
        ))}

        {fields.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
            <p className="text-slate-500 font-medium">
              Chưa có mốc nào — hãy thêm mốc đầu tiên
            </p>
          </div>
        )}
      </div>
    </div>
  );
}