import React, { useCallback, useRef, useState } from 'react';
import { Camera, Image as ImageIcon, X, Loader2, UploadCloud, CheckCircle2 } from 'lucide-react';
import { useHybridUploader } from '@/shared/hooks/useHybridUploader';
import { useToast } from '@/shared/contexts/ToastContext';
import { devConfig } from '@/config/app.config';
import clsx from 'clsx';

export function HybridMediaDropzone({
    value = [],
    onChange,
    requireCamera = true,
    maxFiles = 10,
    context = 'project_evidence'
}) {
    const { upload, isUploading, progress } = useHybridUploader();
    const toast = useToast();
    const fileInputRef = useRef(null);
    const [isCameraPhoto, setIsCameraPhoto] = useState(false);

    const cameraPhotosCount = value.filter(m => m.isCamera).length;

    const handleFileChange = useCallback(async (e, source = 'gallery') => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        if (value.length + files.length > maxFiles) {
            toast.error(`Tối đa chỉ được tải lên ${maxFiles} tập tin`);
            return;
        }

        for (const file of files) {
            try {
                const result = await upload(file, context);

                if (result) {
                    const newMedia = {
                        ...result,
                        isCamera: source === 'camera'
                    };
                    onChange([...value, newMedia]);

                    if (source === 'camera') {
                        devConfig.log("[HybridUploader] Đã nhận ảnh từ Camera Hệ Thống.");
                    }
                }
            } catch (err) {
            }
        }

        e.target.value = '';
    }, [upload, value, onChange, maxFiles, context, toast]);

    const removeFile = (id) => {
        onChange(value.filter(m => m.id !== id));
    };

    const triggerCamera = () => {
        if (fileInputRef.current) {
            setIsCameraPhoto(true);
            fileInputRef.current.click();
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                    type="button"
                    onClick={triggerCamera}
                    disabled={isUploading}
                    className={clsx(
                        "flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-4 transition-all",
                        requireCamera && cameraPhotosCount === 0
                            ? "border-amber-300 bg-amber-50 text-amber-700 animate-pulse"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    )}
                >
                    {isUploading && isCameraPhoto ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Camera className="h-5 w-5" />
                    )}
                    <div className="text-left">
                        <p className="text-sm font-bold">Chụp ảnh hiện trường</p>
                        <p className="text-[10px] opacity-80 uppercase tracking-tight">Bắt buộc - Có GPS</p>
                    </div>
                </button>

                <div className="relative">
                    <input
                        type="file"
                        multiple
                        accept="image/*,application/pdf"
                        className="absolute inset-0 cursor-pointer opacity-0"
                        onChange={(e) => handleFileChange(e, 'gallery')}
                        disabled={isUploading}
                    />
                    <div className="flex h-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-slate-600 transition-all hover:bg-slate-100">
                        {isUploading && !isCameraPhoto ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <UploadCloud className="h-5 w-5" />
                        )}
                        <div className="text-left">
                            <p className="text-sm font-bold">Tải lên tài liệu</p>
                            <p className="text-[10px] opacity-80 uppercase tracking-tight">Hóa đơn, chứng từ...</p>
                        </div>
                    </div>
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFileChange(e, 'camera')}
            />

            {isUploading && (
                <div className="overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-1.5 bg-emerald-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            {value.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {value.map((media) => (
                        <div key={media.id} className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                            <img
                                src={media.url}
                                alt="Preview"
                                className="h-full w-full object-cover"
                            />

                            <div className={clsx(
                                "absolute left-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-md",
                                media.isCamera ? "bg-emerald-500/80" : "bg-slate-900/60"
                            )}>
                                {media.isCamera ? <Camera size={10} /> : <ImageIcon size={10} />}
                                {media.isCamera ? "LIVE GPS" : "FILE"}
                            </div>

                            <button
                                type="button"
                                onClick={() => removeFile(media.id)}
                                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {requireCamera && cameraPhotosCount === 0 && (
                <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs font-medium text-amber-700 border border-amber-100">
                    <Camera size={14} className="flex-shrink-0" />
                    <span>Hệ thống yêu cầu ít nhất 01 ảnh chụp trực tiếp tại hiện trường để xác thực tọa độ GPS.</span>
                </div>
            )}
        </div>
    );
}