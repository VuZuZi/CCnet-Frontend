import { useFieldArray, useWatch, Controller } from "react-hook-form";
import { CurrencyInput } from "@/shared/components/ui/CurrencyInput";
import { CustomDatePicker } from "@/shared/components/ui/DatePicker";
import { getMilestoneAllocationSummary } from "@/features/project/utils/projectDraft.utils";
import { Plus, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs) => twMerge(clsx(inputs));

const EMPTY_MILESTONE = {
  title: "",
  description: "",
  targetAmount: 0,
  startDate: null,
  endDate: null,
  deliverables: "",
};

export function MilestonesBlock({
  control,
  register,
  errors,
  isFunded,
  projectStartDate,
  projectEndDate,
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "milestones",
  });

  const targetAmount = useWatch({ control, name: "targetAmount" }) || 0;
  const milestones = useWatch({ control, name: "milestones" }) || [];

  const {
    unallocatedAmount,
    allocatedAmount,
    allocationPercent,
    isPerfectlyAllocated,
    isOverAllocated,
  } = getMilestoneAllocationSummary(targetAmount, milestones);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="w-full sm:flex-1">
          <h2 className="text-xl font-bold text-slate-900 mb-1">
            Tiến Độ Thực Thi (Milestones)
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Chia nhỏ dự án thành các giai đoạn để dễ quản lý và giải ngân.
          </p>

          {isFunded ? (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-end mb-2 text-sm font-bold">
                <span className="text-slate-600">Phân bổ ngân sách mốc:</span>
                <span
                  className={cn(
                    isPerfectlyAllocated
                      ? "text-emerald-600"
                      : isOverAllocated
                        ? "text-red-500"
                        : "text-amber-500",
                  )}
                >
                  {allocatedAmount.toLocaleString()} /{" "}
                  {Number(targetAmount || 0).toLocaleString()} VND
                </span>
              </div>

              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isPerfectlyAllocated
                      ? "bg-emerald-500"
                      : isOverAllocated
                        ? "bg-red-500"
                        : "bg-[#fbbf24]",
                  )}
                  style={{ width: `${allocationPercent}%` }}
                />
              </div>

              <div className="mt-2 flex justify-between items-center text-xs">
                <span className="text-slate-500">
                  {isOverAllocated ? "Vượt mức:" : "Chưa phân bổ:"}
                  <span
                    className={cn(
                      "ml-1 font-bold",
                      isOverAllocated ? "text-red-500" : "text-amber-500",
                    )}
                  >
                    {Math.abs(unallocatedAmount).toLocaleString()} VND
                  </span>
                </span>

                {isPerfectlyAllocated ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 size={14} /> Khớp mục tiêu
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => append(EMPTY_MILESTONE)}
          className="px-4 py-2.5 bg-[#fbbf24] text-white font-bold rounded-xl text-sm hover:bg-[#f59e0b] transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm shadow-[#fbbf24]/20 w-full sm:w-auto justify-center"
        >
          <Plus size={18} /> Thêm Mốc Mới
        </button>
      </div>

      {errors.milestones_sum ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-bold text-sm flex items-center gap-2">
          <AlertCircle size={18} /> {errors.milestones_sum.message}
        </div>
      ) : null}

      <div className="space-y-6">
        {fields.map((field, idx) => (
          <div
            key={field.id}
            className="p-5 md:p-6 border border-slate-200 rounded-2xl bg-white shadow-sm relative group hover:border-[#fbbf24]/50 transition-colors"
          >
            <button
              type="button"
              onClick={() => remove(idx)}
              className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pr-8">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">
                  Tên giai đoạn {idx + 1}
                </label>
                <input
                  {...register(`milestones.${idx}.title`)}
                  className={cn(
                    "w-full rounded-xl p-3 border outline-none transition-colors",
                    errors.milestones?.[idx]?.title
                      ? "border-red-500"
                      : "border-slate-200 focus:border-[#fbbf24] bg-slate-50 focus:bg-white",
                  )}
                  placeholder="VD: Khởi công & Đổ móng"
                />
                {errors.milestones?.[idx]?.title ? (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.milestones[idx].title.message}
                  </p>
                ) : null}
              </div>

              <div>
                <Controller
                  control={control}
                  name={`milestones.${idx}.startDate`}
                  render={({ field: dateField }) => (
                    <CustomDatePicker
                      {...dateField}
                      label="Ngày bắt đầu mốc"
                      minDate={projectStartDate}
                      maxDate={projectEndDate}
                      error={errors.milestones?.[idx]?.startDate?.message}
                    />
                  )}
                />
              </div>

              <div>
                <Controller
                  control={control}
                  name={`milestones.${idx}.endDate`}
                  render={({ field: dateField }) => (
                    <CustomDatePicker
                      {...dateField}
                      label="Hạn chót mốc"
                      minDate={projectStartDate}
                      maxDate={projectEndDate}
                      error={errors.milestones?.[idx]?.endDate?.message}
                    />
                  )}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">
                  Mô tả công việc
                </label>
                <textarea
                  {...register(`milestones.${idx}.description`)}
                  className={cn(
                    "w-full rounded-xl p-3 border outline-none min-h-[80px] resize-y transition-colors",
                    errors.milestones?.[idx]?.description
                      ? "border-red-500"
                      : "border-slate-200 focus:border-[#fbbf24] bg-slate-50 focus:bg-white",
                  )}
                  placeholder="Mô tả chi tiết các hoạt động diễn ra trong giai đoạn này..."
                />
                {errors.milestones?.[idx]?.description ? (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.milestones[idx].description.message}
                  </p>
                ) : null}
              </div>

              {isFunded ? (
                <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <Controller
                    control={control}
                    name={`milestones.${idx}.targetAmount`}
                    render={({ field: amountField }) => (
                      <CurrencyInput
                        {...amountField}
                        label="Ngân sách phân bổ cho mốc này"
                        placeholder="Nhập số tiền..."
                        error={errors.milestones?.[idx]?.targetAmount?.message}
                        className="bg-white"
                      />
                    )}
                  />
                </div>
              ) : null}

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">
                  Kết quả bàn giao (Deliverables)
                </label>
                <input
                  {...register(`milestones.${idx}.deliverables`)}
                  className={cn(
                    "w-full rounded-xl p-3 border outline-none transition-colors",
                    errors.milestones?.[idx]?.deliverables
                      ? "border-red-500"
                      : "border-slate-200 focus:border-[#fbbf24] bg-slate-50 focus:bg-white",
                  )}
                  placeholder="VD: Biên bản nghiệm thu, Hình ảnh thực tế móng cầu..."
                />
                {errors.milestones?.[idx]?.deliverables ? (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {errors.milestones[idx].deliverables.message}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ))}

        {fields.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
            <p className="text-slate-500">
              Chưa có mốc thực thi nào. Bắt buộc phải có ít nhất 1 mốc.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}