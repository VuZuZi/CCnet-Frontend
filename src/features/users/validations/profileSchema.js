import { z } from 'zod';

export const profileSchema = z.object({
    fullName: z.string().min(2, 'Họ tên tối thiểu 2 ký tự'),
    phone: z.string()
        .regex(/^\+?[0-9\s\-]{7,15}$/, 'Định dạng số điện thoại không hợp lệ')
        .or(z.literal(''))
        .optional(),
    location: z.string().max(100, 'Địa điểm tối đa 100 ký tự').or(z.literal('')).optional(),
    headline: z.string().max(150, 'Tiêu đề tối đa 150 ký tự').or(z.literal('')).optional(),
    about: z.string().max(1000, 'Phần giới thiệu tối đa 1000 ký tự').or(z.literal('')).optional(),
    skills: z.preprocess(
        (val) => {
            if (typeof val === 'string') {
                return val.split(',').map(s => s.trim()).filter(Boolean);
            }
            return val || [];
        },
        z.array(z.string().max(50, 'Mỗi kỹ năng tối đa 50 ký tự'))
            .max(20, 'Cho phép tối đa 20 kỹ năng')
    ).optional()
});