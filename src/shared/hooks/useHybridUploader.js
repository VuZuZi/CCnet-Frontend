import { useState, useCallback, useRef } from "react";
import axios from "axios";
import { mediaAPI } from "../api/media.api";
import { devConfig } from "@/config/app.config";

const MAX_SMART_UPLOAD_SIZE = 5 * 1024 * 1024;

export function useHybridUploader() {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    
    const abortControllerRef = useRef(null);

    const cancel = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    }, []);

    const upload = useCallback(async (file, folderContext = "organizer_kyc") => {
        if (!file || isUploading) return null;

        setIsUploading(true);
        setProgress(0);
        setError(null);

        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        const isImage = file.type.startsWith("image/");
        const isSmallFile = file.size <= MAX_SMART_UPLOAD_SIZE;

        try {
            if (isImage && isSmallFile) {
                setProgress(50);
                const mediaRes = await mediaAPI.uploadSmart(file, { signal });
                setProgress(100);

                return {
                    id: mediaRes._id,
                    fileName: mediaRes.originalName,
                    mimeType: mediaRes.mimetype,
                    size: mediaRes.size,
                    url: mediaRes.url,
                };
            }

            const signatureData = await mediaAPI.getSignature(folderContext, { signal });

            const formData = new FormData();
            formData.append("file", file);
            formData.append("api_key", signatureData.apiKey);
            formData.append("timestamp", signatureData.timestamp);
            formData.append("signature", signatureData.signature);

            if (signatureData.folder) formData.append("folder", signatureData.folder);
            if (signatureData.tags) formData.append("tags", signatureData.tags);

            const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/auto/upload`;

            const cloudRes = await axios.post(cloudinaryUrl, formData, {
                signal,
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setProgress(percentCompleted);
                    }
                },
            });

            const syncPayload = {
                publicId: cloudRes.data.public_id,
                url: cloudRes.data.secure_url,
                size: cloudRes.data.bytes,
                mimetype: cloudRes.data.original_extension || file.type,
                originalName: file.name,
                context: folderContext
            };

            const syncedMedia = await mediaAPI.syncMedia(syncPayload, { signal });

            return {
                id: syncedMedia._id,
                fileName: syncedMedia.originalName,
                mimeType: syncedMedia.mimetype,
                size: syncedMedia.size,
                url: syncedMedia.url || cloudRes.data.secure_url,
            };

        } catch (err) {
            if (axios.isCancel(err) || err.name === 'AbortError' || err.name === 'CanceledError') {
                devConfig.log("[useHybridUploader] Người dùng chủ động hủy tải lên.");
                setError(new Error("Đã hủy tải lên"));
                return null;
            }

            devConfig.error("[useHybridUploader Error]", err);
            const errorMessage = err.response?.data?.message || err.message || "Tải lên thất bại";
            setError(new Error(errorMessage));
            throw new Error(errorMessage);
        } finally {
            setIsUploading(false);
            abortControllerRef.current = null; // Dọn dẹp RAM
        }
    }, [isUploading]);

    return { upload, cancel, isUploading, progress, error };
}