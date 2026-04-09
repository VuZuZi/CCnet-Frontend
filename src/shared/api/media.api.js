import httpClient from "@/shared/lib/httpClient";

export const mediaAPI = {
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