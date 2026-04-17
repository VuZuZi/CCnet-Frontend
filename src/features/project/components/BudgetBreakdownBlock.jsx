import { useFieldArray, Controller } from "react-hook-form";
import { CurrencyInput } from "@/shared/components/ui/CurrencyInput";
import { Plus, Trash2, Wand2 } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs) => twMerge(clsx(inputs));

const TEMPLATE_ITEMS = [
  { item: "Chi phí vật tư / Thiết bị", amount: 0, note: "" },
  { item: "Chi phí vận chuyển / Logistics", amount: 0, note: "" },
  { item: "Chi phí nhân công / Hỗ trợ tình nguyện", amount: 0, note: "" },
  { item: "Chi phí quản lý dự án & Dự phòng (5-10%)", amount: 0, note: "" },
];

export function BudgetBreakdownBlock({ control, register, errors }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "budgetBreakdown",
  });

  const handleApplyTemplate = () => {
    append(TEMPLATE_ITEMS);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Bảng dự toán chi phí</h3>
          <p className="text-sm text-slate-500 mt-1">
            Giải trình chi tiết các khoản chi để đạt được mục tiêu gọi vốn.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleApplyTemplate}
            className="text-sm font-bold text-[#f59e0b] bg-[#fbbf24]/10 px-3 py-2 rounded-lg hover:bg-[#fbbf24]/20 flex items-center gap-1.5 transition-colors"
          >
            <Wand2 size={16} /> Gợi ý mẫu
          </button>

          <button
            type="button"
            onClick={() => append({ item: "", amount: 0, note: "" })}
            className="text-sm font-bold text-white bg-[#fbbf24] px-3 py-2 rounded-lg hover:bg-[#f59e0b] flex items-center gap-1.5 transition-colors"
          >
            <Plus size={16} /> Thêm khoản chi
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {fields.map((field, idx) => (
          <div
            key={field.id}
            className="flex flex-col gap-1 p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors"
          >
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
              <div className="w-full md:flex-1">
                <input
                  {...register(`budgetBreakdown.${idx}.item`)}
                  placeholder="Tên vật tư / khoản chi"
                  className={cn(
                    "w-full rounded-lg p-2.5 border bg-white text-sm outline-none transition-colors",
                    errors.budgetBreakdown?.[idx]?.item
                      ? "border-red-500 focus:border-red-500"
                      : "border-slate-200 focus:border-[#fbbf24]"
                  )}
                />
              </div>

              <div className="w-full md:w-48">
                <Controller
                  control={control}
                  name={`budgetBreakdown.${idx}.amount`}
                  render={({ field: amountField }) => (
                    <CurrencyInput
                      {...amountField}
                      placeholder="Số tiền"
                      className="!p-2.5 !text-sm"
                      error={errors.budgetBreakdown?.[idx]?.amount?.message}
                    />
                  )}
                />
              </div>

              <div className="w-full md:flex-1">
                <input
                  {...register(`budgetBreakdown.${idx}.note`)}
                  placeholder="Ghi chú (Tùy chọn)"
                  className="w-full rounded-lg p-2.5 border border-slate-200 bg-white text-sm outline-none focus:border-[#fbbf24] transition-colors"
                />
              </div>

              <button
                type="button"
                onClick={() => remove(idx)}
                className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors w-full md:w-auto flex justify-center"
                title="Xóa khoản chi này"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {errors.budgetBreakdown?.[idx]?.item && (
              <span className="text-xs text-red-500 font-medium px-1">
                {errors.budgetBreakdown[idx].item.message}
              </span>
            )}
          </div>
        ))}

        {fields.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
            <p className="text-slate-500 text-sm">
              Chưa có khoản chi nào. Hãy thêm khoản chi hoặc sử dụng gợi ý mẫu.
            </p>
          </div>
        )}
      </div>

      {errors.budgetBreakdown?.message && (
        <p className="text-red-500 text-sm mt-3 font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"></span>
          {errors.budgetBreakdown.message}
        </p>
      )}
    </div>
  );
}