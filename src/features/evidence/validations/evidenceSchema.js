import { z } from "zod";

export const evidenceSubmitSchema = z.object({
    reportContent: z
        .string()
        .min(10, "Nội dung báo cáo phải có ít nhất 10 ký tự.")
        .max(2000, "Tối đa 2000 ký tự."),
    mediaIds: z.array(z.string()).optional().default([]),
    receiptMediaIds: z.array(z.string()).optional().default([]),
    spentAmount: z.union([z.coerce.number().min(0, "Số tiền không được nhỏ hơn 0"), z.literal('')]).optional()
});

export const evidenceUpdateSchema = evidenceSubmitSchema.extend({
    reportContent: z.string().min(50, "Vui lòng giải trình chi tiết hơn theo yêu cầu của Admin.")
});