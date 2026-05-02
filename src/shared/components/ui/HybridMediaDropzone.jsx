import React, { useCallback, useRef, useState } from 'react';
import { Camera, Image as ImageIcon, X, Loader2, UploadCloud, FileText, Download } from 'lucide-react';
import { useHybridUploader } from '@/shared/hooks/useHybridUploader';
import { useToast } from '@/shared/contexts/ToastContext';
import { devConfig } from '@/config/app.config';
import clsx from 'clsx';

const getMediaUrl = (media) => media?.url || media?.secure_url || '';
const getMediaName = (media) => media?.fileName || media?.originalName || media?.name || 'Tệp đính kèm';
const getMediaMime = (media) => String(media?.mimeType || media?.mimetype || '').toLowerCase();
const getMediaExtension = (media) => {
    const name = getMediaName(media).toLowerCase();
    const url = getMediaUrl(media).toLowerCase().split('?')[0];
    const match = `${name} ${url}`.match(/\.([a-z0-9]+)(?:\s|$)/);
    return match?.[1] || '';
};
const isImageMedia = (media) => {
    const mime = getMediaMime(media);
    if (mime.startsWith('image/')) return true;
    if (getMediaUrl(media).toLowerCase().includes('/image/upload')) return true;
    return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(getMediaExtension(media));
};
const isPdfMedia = (media) => getMediaMime(media).includes('application/pdf') || getMediaExtension(media) === 'pdf';
const getDocumentLabel = (media) => {
    if (isPdfMedia(media)) return 'Tài liệu PDF';
    const ext = getMediaExtension(media);
    if (['doc', 'docx'].includes(ext)) return 'Tài liệu Word';
    if (['xls', 'xlsx'].includes(ext)) return 'Bảng tính Excel';
    if (['ppt', 'pptx'].includes(ext)) return 'Tệp trình chiếu';
    if (ext === 'txt') return 'Tệp văn bản';
    return 'Tệp đính kèm';
};
const downloadFile = async (url, fileName) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Download failed: ${response.status}`);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = fileName || 'tep-dinh-kem';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(objectUrl);
    } catch (err) {
        devConfig.error('[HybridMediaDropzone] Tải tệp thất bại', err);
    }
};

export function HybridMediaDropzone({
    value = [],
    onChange,
    requireCamera = true,
    maxFiles = 10,
    context = 'project_evidence',
    mode = 'hybrid' // 'hybrid' | 'upload_only'
}) {
    const { upload, isUploading, progress } = useHybridUploader();
    const toast = useToast();
    const fileInputRef = useRef(null);
    const [isCameraPhoto, setIsCameraPhoto] = useState(false);

    const isHybrid = mode === 'hybrid';
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
                const result = await upload(file, context, source === 'camera');

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
                // Error is handled inside useHybridUploader
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
            <div className={clsx("grid gap-3", isHybrid ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>
                {isHybrid && (
                    <button
                        type="button"
                        onClick={triggerCamera}
                        disabled={isUploading}
                        className={clsx(
                            "flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-4 transition-all min-h-[100px]",
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
                )}

                <div className="relative">
                    <input
                        type="file"
                        multiple
                        accept="image/*,application/pdf"
                        className="absolute inset-0 cursor-pointer opacity-0 z-10"
                        onChange={(e) => handleFileChange(e, 'gallery')}
                        disabled={isUploading}
                    />
                    <div className={clsx(
                        "flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-slate-600 transition-all hover:bg-slate-100",
                        isHybrid ? "h-full min-h-[100px]" : "min-h-[120px]"
                    )}>
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

            {isHybrid && (
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'camera')}
                />
            )}

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
                    {value.map((media) => {
                        const url = getMediaUrl(media);
                        const name = getMediaName(media);
                        const image = isImageMedia(media);
                        const pdf = isPdfMedia(media);

                        return (
                            <div key={media.id} className="group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                            {image ? (
                                <img
                                    src={url}
                                    alt={name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center">
                                    <div className={clsx(
                                        "flex h-12 w-12 items-center justify-center rounded-2xl",
                                        pdf ? "bg-red-50 text-red-500" : "bg-slate-200 text-slate-600"
                                    )}>
                                        <FileText size={22} />
                                    </div>
                                    <div className="min-w-0 space-y-1">
                                        <p className="truncate text-xs font-black text-slate-900">{name}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-tight text-slate-500">{getDocumentLabel(media)}</p>
                                    </div>
                                    {url && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                downloadFile(url, name);
                                            }}
                                            className="inline-flex h-7 items-center gap-1 rounded-full bg-white px-2 text-[10px] font-bold text-slate-700 shadow-sm hover:bg-amber-50"
                                        >
                                            <Download size={11} />
                                            Tải xuống
                                        </button>
                                    )}
                                </div>
                            )}

                            <div className={clsx(
                                "absolute left-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-md",
                                media.isCamera ? "bg-emerald-500/80" : "bg-slate-900/60"
                            )}>
                                {media.isCamera ? <Camera size={10} /> : image ? <ImageIcon size={10} /> : <FileText size={10} />}
                            {media.isCamera ? "GPS trực tiếp" : "Tệp"}
                            </div>

                            <button
                                type="button"
                                onClick={() => removeFile(media.id)}
                                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-500"
                            >
                                <X size={14} />
                            </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {isHybrid && requireCamera && cameraPhotosCount === 0 && (
                <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs font-medium text-amber-700 border border-amber-100">
                    <Camera size={14} className="flex-shrink-0" />
                    <span>Hệ thống yêu cầu ít nhất 01 ảnh chụp trực tiếp tại hiện trường để xác thực tọa độ GPS.</span>
                </div>
            )}
        </div>
    );
}
