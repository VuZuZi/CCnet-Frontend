import { useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { CurrencyInput } from '@/shared/components/ui/CurrencyInput';
import { CustomDatePicker } from '@/shared/components/ui/DatePicker';
import { LocationPicker } from '@/shared/components/ui/LocationPicker';
import {
    Trash2,
    MapPin,
    MapPinned,
    ShieldCheck,
    AlertCircle
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export function MilestoneItem({
    idx,
    field,
    remove,
    isFunded,
    projectStartDate,
    projectEndDate
}) {
    const { control, register, formState: { errors } } = useFormContext();
    const [hasCustomLocation, setHasCustomLocation] = useState(!!field.location);

    const currentAmount = useWatch({
        control,
        name: `milestones.${idx}.targetAmount`,
        defaultValue: field.targetAmount
    });

    return (
        <div className="p-5 md:p-6 border border-slate-200 rounded-2xl bg-white shadow-sm relative group hover:border-primary/50 transition-colors">
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
                            errors.milestones?.[idx]?.title ? 'border-red-500' : 'border-slate-200 focus:border-primary bg-slate-50 focus:bg-white'
                        )}
                        placeholder="VD: Khởi công & Đổ móng"
                    />
                    {errors.milestones?.[idx]?.title && (
                        <p className="text-red-500 text-xs mt-1 font-medium">{errors.milestones[idx].title.message}</p>
                    )}
                </div>

                <div className="md:col-span-2 mt-2">
                    {currentAmount > 0 ? (
                        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                            <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                            <div>
                                <p className="text-sm font-bold text-amber-900 uppercase tracking-tight">Nghiệm thu giải ngân</p>
                                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                                    Mốc có ngân sách yêu cầu cung cấp <b>Báo cáo chi tiêu</b> và <b>Hóa đơn tài chính</b> hợp lệ.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                            <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-emerald-900 uppercase tracking-tight">Nghiệm thu tự động (Auto-pass)</p>
                                <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                                    Mốc này sẽ được nghiệm thu tự động khi bạn <b>Check-in bằng Camera hệ thống</b> tại hiện trường. Không cần giấy tờ phức tạp.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="md:col-span-2 py-2">
                    <label className="flex items-center gap-3 cursor-pointer group/toggle w-fit">
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={hasCustomLocation}
                                onChange={(e) => {
                                    setHasCustomLocation(e.target.checked);
                                    if (!e.target.checked) {
                                        control._fields[`milestones.${idx}.location`]?._f?.onChange?.(undefined);
                                    }
                                }}
                            />
                            <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-primary transition-colors"></div>
                            <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-transform"></div>
                        </div>
                        <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                            <MapPin size={14} className={hasCustomLocation ? "text-primary" : "text-slate-400"} />
                            Mốc này diễn ra ở địa điểm khác với dự án?
                        </span>
                    </label>

                    {hasCustomLocation && (
                        <div className="mt-4 p-4 border border-blue-100 bg-blue-50/30 rounded-2xl animate-in zoom-in-95 duration-200">
                            <Controller
                                control={control}
                                name={`milestones.${idx}.location`}
                                render={({ field: locField }) => (
                                    <LocationPicker
                                        value={locField.value}
                                        onChange={locField.onChange}
                                        hasError={!!errors.milestones?.[idx]?.location}
                                    />
                                )}
                            />
                            <p className="mt-2 text-[11px] text-blue-600 font-medium flex items-center gap-1">
                                <MapPinned size={12} /> Vị trí này sẽ được dùng để xác thực check-in khi nghiệm thu mốc.
                            </p>
                        </div>
                    )}
                </div>

                <div>
                    <Controller
                        control={control}
                        name={`milestones.${idx}.startDate`}
                        render={({ field: dField }) => (
                            <CustomDatePicker
                                {...dField}
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
                        render={({ field: dField }) => (
                            <CustomDatePicker
                                {...dField}
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
                            errors.milestones?.[idx]?.description ? 'border-red-500' : 'border-slate-200 focus:border-primary bg-slate-50 focus:bg-white'
                        )}
                        placeholder="Mô tả chi tiết các hoạt động diễn ra trong giai đoạn này..."
                    />
                    {errors.milestones?.[idx]?.description && (
                        <p className="text-red-500 text-xs mt-1 font-medium">{errors.milestones[idx].description.message}</p>
                    )}
                </div>

                {isFunded && (
                    <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <Controller
                            control={control}
                            name={`milestones.${idx}.targetAmount`}
                            render={({ field: cField }) => (
                                <CurrencyInput
                                    {...cField}
                                    label="Ngân sách phân bổ cho mốc này"
                                    placeholder="Nhập số tiền..."
                                    error={errors.milestones?.[idx]?.targetAmount?.message}
                                    className="bg-white"
                                />
                            )}
                        />
                    </div>
                )}

                <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1 block">
                        Kết quả bàn giao (Deliverables)
                    </label>
                    <input
                        {...register(`milestones.${idx}.deliverables`)}
                        className={cn(
                            "w-full rounded-xl p-3 border outline-none transition-colors",
                            errors.milestones?.[idx]?.deliverables ? 'border-red-500' : 'border-slate-200 focus:border-primary bg-slate-50 focus:bg-white'
                        )}
                        placeholder="VD: Biên bản nghiệm thu, Hình ảnh thực tế móng cầu..."
                    />
                    {errors.milestones?.[idx]?.deliverables && (
                        <p className="text-red-500 text-xs mt-1 font-medium">{errors.milestones[idx].deliverables.message}</p>
                    )}
                </div>
            </div>
        </div>
    );
}