import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, AlertCircle } from 'lucide-react';
import { PROJECT_INTENTS } from '@/shared/constants/project';

const reviewActionSchema = z.object({
    feedback: z.string().min(10, 'Vui lòng nhập lý do tối thiểu 10 ký tự để Organizer nắm rõ nguyên nhân.'),
});

export function ReviewActionModal({
    isOpen,
    onClose,
    onSubmit,
    intent,
    isLoading
}) {
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(reviewActionSchema),
        defaultValues: { feedback: '' }
    });

    useEffect(() => {
        if (isOpen) reset();
    }, [isOpen, reset]);

    if (!isOpen) return null;

    const isRevision = intent === PROJECT_INTENTS.REVISION;
    const title = isRevision ? 'Yêu cầu chỉnh sửa' : 'Từ chối dự án';

    const description = isRevision
        ? 'Người tổ chức sẽ có 14 ngày để cập nhật và nộp lại dự án. Nếu không phản hồi, dự án sẽ tự động bị hủy.'
        : 'Dự án sẽ bị hủy vĩnh viễn và người tổ chức sẽ chịu thời gian đóng băng (Cooling Period) 7 ngày.';

    const buttonText = isRevision ? 'Gửi yêu cầu' : 'Từ chối dự án';
    const buttonStyle = isRevision
        ? 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500/20'
        : 'bg-red-500 hover:bg-red-600 focus:ring-red-500/20';

    const onFormSubmit = (data) => {
        onSubmit(data.feedback);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onFormSubmit)} className="p-6">
                    <div className="flex gap-3 mb-6 p-4 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-sm leading-relaxed">
                        <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                        <p>{description}</p>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="feedback" className="block text-sm font-semibold text-slate-700">
                            Lý do chi tiết <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="feedback"
                            disabled={isLoading}
                            {...register('feedback')}
                            placeholder="Nhập phản hồi của bạn dành cho người tổ chức..."
                            className={`w-full h-32 px-4 py-3 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-4 disabled:bg-slate-50 disabled:text-slate-400 ${errors.feedback
                                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                    : 'border-slate-200 focus:border-slate-900 focus:ring-slate-900/10'
                                }`}
                        />
                        {errors.feedback && (
                            <p className="text-sm font-medium text-red-500 mt-1">
                                {errors.feedback.message}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2 focus:outline-none focus:ring-4 ${buttonStyle}`}
                        >
                            {isLoading && (
                                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            )}
                            {buttonText}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}