import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, UploadCloud, Loader2, CloudUpload, FileText, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import httpClient from '@/shared/lib/httpClient';
import { useToast } from '@/shared/contexts/ToastContext';

export function MediaDropzone({
    value = [],
    onChange,
    onRemove,
    onUploadingStatus,
    maxFiles = 5,
    accept = { 'image/*': [] },
    uploadContext = 'general',
    appearance = 'general'
}) {
    const [uploadingFiles, setUploadingFiles] = useState({});
    const toast = useToast();

    const isUploadingAny = Object.values(uploadingFiles).some(item => !item.error);

    useEffect(() => {
        if (onUploadingStatus) {
            onUploadingStatus(isUploadingAny);
        }
    }, [isUploadingAny, onUploadingStatus]);

    const dismissError = (fileId) => {
        setUploadingFiles(prev => {
            const newState = { ...prev };
            delete newState[fileId];
            return newState;
        });
    };

    const uploadToCloudinary = async (file, fileId) => {
        try {
            const sigRes = await httpClient.get(`/media/signature?context=${uploadContext}`);
            const { signature, timestamp, cloudName, apiKey, folder, tags } = sigRes.data.data;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', apiKey);
            formData.append('timestamp', timestamp);
            formData.append('signature', signature);
            formData.append('folder', folder);
            formData.append("tags", tags);

            const uploadRes = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
                formData,
                {
                    onUploadProgress: (progressEvent) => {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadingFiles(prev => ({
                            ...prev,
                            [fileId]: { ...prev[fileId], progress: percentCompleted }
                        }));
                    }
                }
            );

            return {
                url: uploadRes.data.secure_url,
                publicId: uploadRes.data.public_id,
                originalName: file.name,
                mimetype: file.type,
                size: file.size
            };

        } catch (error) {
            const cloudErrorMsg = error.response?.data?.error?.message || error.message;
            console.error(`[Lỗi tải lên trực tiếp - ${file.name}]:`, error.response?.data || error);
            throw new Error(`Lỗi: ${cloudErrorMsg}`);
        }
    };

    const onDrop = useCallback(async (acceptedFiles) => {
        const totalFiles = value.length + acceptedFiles.length;
        if (totalFiles > maxFiles) {
            toast.error(`Tối đa ${maxFiles} tệp được phép`);
            return;
        }

        const newUploads = {};
        acceptedFiles.forEach(file => {
            const fileId = `${file.name}-${Date.now()}`;
            newUploads[fileId] = { file, progress: 0, error: null };
            file._trackingId = fileId;
        });

        setUploadingFiles(prev => ({ ...prev, ...newUploads }));

        const uploadPromises = acceptedFiles.map(async (file) => {
            const fileId = file._trackingId;
            try {
                const uploadedData = await uploadToCloudinary(file, fileId);
                setUploadingFiles(prev => {
                    const newState = { ...prev };
                    delete newState[fileId];
                    return newState;
                });
                return uploadedData;
            } catch (error) {
                setUploadingFiles(prev => ({
                    ...prev,
                    [fileId]: { ...prev[fileId], error: error.message }
                }));
                toast.error(error.message);
                return null;
            }
        });

        const results = await Promise.all(uploadPromises);
        const successfulUploads = results.filter(Boolean);

        if (successfulUploads.length > 0) {
            onChange([...value, ...successfulUploads]);
        }
    }, [value, maxFiles, onChange, uploadContext, toast]);

    const removeFile = (indexToRemove) => {
        const fileToRemove = value[indexToRemove];
        if (onRemove) onRemove(fileToRemove);

        const newValue = value.filter((_, index) => index !== indexToRemove);
        onChange(newValue);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxFiles: maxFiles - value.length,
        disabled: value.length >= maxFiles || isUploadingAny
    });


    const renderDropzoneUI = () => {
        if (appearance === 'cover') {
            return (
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-colors group
                      ${isDragActive ? 'border-primary bg-yellow-50/50' : 'border-slate-300 hover:bg-slate-50 hover:border-slate-400'}
                      ${(value.length >= maxFiles || isUploadingAny) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                >
                    <input {...getInputProps()} />
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                        <CloudUpload className="text-slate-500 w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">
                        {isUploadingAny ? 'Đang tải lên...' : 'Kéo & Thả ảnh/video bìa'}
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">JPG, PNG hoặc MP4 chất lượng cao tối đa 50MB</p>
                    <button type="button" className="px-4 py-2 bg-white text-slate-700 font-bold rounded-xl text-sm border-2 border-slate-200 hover:border-slate-300 transition-colors shadow-sm pointer-events-none">
                        Duyệt tệp
                    </button>
                </div>
            );
        }

        if (appearance === 'document') {
            return (
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-colors group
                      ${isDragActive ? 'border-primary bg-yellow-50/50' : 'border-slate-300 hover:bg-slate-50 hover:border-slate-400'}
                      ${(value.length >= maxFiles || isUploadingAny) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                >
                    <input {...getInputProps()} />
                    <UploadCloud className="text-slate-400 w-6 h-6 mb-2 group-hover:-translate-y-1 transition-transform" />
                    <span className="text-sm font-medium text-slate-600">
                        {isUploadingAny ? 'Đang xử lý...' : 'Tải lên PDF hoặc Hình ảnh'}
                    </span>
                </div>
            );
        }

        return (
            <div {...getRootProps()} className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-slate-400">
                <input {...getInputProps()} />
                <UploadCloud className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-600">Kéo & thả tệp vào đây</p>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {renderDropzoneUI()}

            {Object.values(uploadingFiles).map((uploadItem) => (
                <div key={uploadItem.file.name} className={`flex items-center gap-3 p-3 border rounded-lg ${uploadItem.error ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
                    {uploadItem.error ? (
                        <button type="button" onClick={() => dismissError(uploadItem.file._trackingId)} className="p-1 hover:bg-red-100 rounded-full transition-colors" title="Đóng">
                            <X className="text-red-500 shrink-0 cursor-pointer" size={16} />
                        </button>
                    ) : (
                        <Loader2 className="animate-spin text-blue-500 shrink-0" size={16} />
                    )}
                    <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium truncate ${uploadItem.error ? 'text-red-700' : 'text-slate-700'}`}>{uploadItem.file.name}</p>
                        <div className={`w-full rounded-full h-1 mt-1.5 ${uploadItem.error ? 'bg-red-200' : 'bg-blue-200'}`}>
                            <div className={`h-1 rounded-full transition-all duration-300 ${uploadItem.error ? 'bg-red-500' : 'bg-blue-600'}`} style={{ width: `${uploadItem.progress}%` }}></div>
                        </div>
                        {uploadItem.error && <p className="text-[11px] text-red-600 mt-1 font-medium">{uploadItem.error}</p>}
                    </div>
                </div>
            ))}

            {value.length > 0 && (
                <div className={appearance === 'cover' ? "grid grid-cols-2 gap-4" : "flex flex-wrap gap-2 pt-2"}>
                    {value.map((mediaObj, idx) => {
                        const url = typeof mediaObj === 'string' ? mediaObj : mediaObj.url;
                        const originalName = typeof mediaObj === 'string' ? 'tập_tin_media' : mediaObj.originalName;
                        const isImage = url?.match(/\.(jpeg|jpg|gif|png|webp)$/i) || url?.includes('image/upload');

                        if (appearance === 'cover') {
                            return (
                                <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center h-32">
                                    {isImage ? (
                                        <img src={url} alt="xem trước ảnh bìa" className="w-full h-full object-cover" />
                                    ) : (
                                        <video src={url} className="w-full h-full object-cover" muted />
                                    )}
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500/90 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            );
                        }

                        return (
                            <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                                {isImage ? (
                                    <ImageIcon className="text-slate-500" size={16} />
                                ) : (
                                    <FileText className="text-slate-500" size={16} />
                                )}
                                <span className="text-xs font-bold text-slate-700 max-w-[150px] truncate">
                                    {originalName}
                                </span>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                    className="ml-1 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}