import httpClient from "@/shared/lib/httpClient";

export const mediaAPI = {
    upload: async (file, { context = "general", lat, lng, onProgress, signal } = {}) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("context", context);
        
        if (lat !== undefined && lat !== null) formData.append("lat", lat);
        if (lng !== undefined && lng !== null) formData.append("lng", lng);

        const res = await httpClient.post("/media/upload", formData, {
            signal,
            onUploadProgress: onProgress,
            headers: { "Content-Type": "multipart/form-data" },
        });
        
        return res.data?.data?.media;
    },

    uploadSmart: async (file, config = {}) => {
        const formData = new FormData();
        formData.append("file", file);
        
        const res = await httpClient.post("/media/upload-smart", formData, {
            ...config,
            headers: { ...config.headers, "Content-Type": "multipart/form-data" },
        });
        return res.data?.data?.media;
    },

    getSignature: async (context = "general", config = {}) => {
        const res = await httpClient.get("/media/signature", {
            ...config,
            params: { context, ...(config.params || {}) }
        });
        return res.data?.data;
    },

    syncMedia: async (payload, config = {}) => {
        const res = await httpClient.post("/media/sync", payload, config);
        return res.data?.data?.media;
    },

    deleteMedia: async (id) => {
        const res = await httpClient.delete(`/media/${id}`);
        return res.data;
    }
};