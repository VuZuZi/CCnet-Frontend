import { z } from 'zod';

export const HELP_REQUEST_CATEGORIES = [
  { value: 'Y_TE', label: 'Hỗ trợ y tế' },
  { value: 'GIAO_DUC', label: 'Giáo dục' },
  { value: 'THIEN_TAI', label: 'Cứu trợ thiên tai' },
  { value: 'XAY_DUNG', label: 'Xây dựng' },
  { value: 'MOI_TRUONG', label: 'Môi trường' },
  { value: 'KHAC', label: 'Khác' },
];

export const URGENCY_LEVELS = [
  { value: 'LOW', label: 'Thấp', color: 'bg-slate-100 text-slate-700' },
  { value: 'MEDIUM', label: 'Trung bình', color: 'bg-blue-100 text-blue-700' },
  { value: 'HIGH', label: 'Cao', color: 'bg-orange-100 text-orange-700' },
  { value: 'CRITICAL', label: 'Khẩn cấp', color: 'bg-red-100 text-red-700' },
];

const locationSchema = z.object({
  type: z.literal('Point').optional().default('Point'),
  coordinates: z.array(z.number()).length(2).optional().default([0, 0]),
  address: z.string().max(500).optional(),
}).nullable().optional();

const evidenceSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional(),
  mediaType: z.enum(['image', 'video', 'document']).optional().default('image'),
  originalName: z.string().optional(),
});

export const helpRequestSchema = z.object({
  title: z.string()
    .min(10, 'Tiêu đề phải có ít nhất 10 ký tự')
    .max(200, 'Tiêu đề không được vượt quá 200 ký tự'),

  story: z.string()
    .min(50, 'Vui lòng cung cấp câu chuyện chi tiết hơn (ít nhất 50 ký tự)')
    .max(5000, 'Câu chuyện quá dài (tối đa 5000 ký tự)'),

  category: z.string().min(1, 'Vui lòng chọn một danh mục'),

  location: locationSchema,

  urgencyLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),

  amountNeeded: z.coerce.number()
    .min(0, 'Số tiền không thể là số âm')
    .optional()
    .default(0),

  evidences: z.array(evidenceSchema).max(10, 'Tối đa 10 tệp minh chứng').optional().default([]),

  contactPhone: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string()
      .regex(
        /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/,
        'Số điện thoại phải là số Việt Nam hợp lệ (ví dụ: 0912345678 hoặc +84912345678)'
      )
      .optional()
  ),

  contactEmail: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string()
      .email('Vui lòng nhập địa chỉ email hợp lệ (ví dụ: you@example.com)')
      .optional()
  ),
});

export const defaultHelpRequestValues = {
  title: '',
  story: '',
  category: '',
  location: null,
  urgencyLevel: 'MEDIUM',
  amountNeeded: 0,
  evidences: [],
  contactPhone: '',
  contactEmail: '',
};
