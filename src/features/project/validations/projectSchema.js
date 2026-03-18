import { z } from 'zod';

export const PROJECT_CATEGORY = [
  'Y_TE', 'GIAO_DUC', 'THIEN_TAI', 'XAY_DUNG', 'MOI_TRUONG', 'KHAC'
];

const locationSchema = z.object({
  type: z.literal('Point').default('Point'),
  coordinates: z.tuple([
    z.number()
      .min(-180, 'Kinh độ (Lng) phải từ -180 đến 180')
      .max(180, 'Kinh độ (Lng) phải từ -180 đến 180'),
    z.number()
      .min(-90, 'Vĩ độ (Lat) phải từ -90 đến 90')
      .max(90, 'Vĩ độ (Lat) phải từ -90 đến 90')
  ], {
    invalid_type_error: "Tọa độ bản đồ không hợp lệ",
  }),
  address: z.string({ required_error: 'Vui lòng chọn địa điểm trên bản đồ' })
    .min(5, 'Địa chỉ quá ngắn, vui lòng chọn vị trí cụ thể hơn')
    .max(255, 'Địa chỉ quá dài'),
});

const milestoneSchema = z.object({
  title: z.string().min(5, 'Tên mốc tối thiểu 5 ký tự').max(100, 'Tối đa 100 ký tự'),
  description: z.string().min(10, 'Mô tả mốc tối thiểu 10 ký tự').max(500, 'Tối đa 500 ký tự'),
  targetAmount: z.coerce.number({ invalid_type_error: 'Vui lòng nhập số' }).min(1000, 'Tối thiểu 1.000 VNĐ'),
});

const volunteerRoleSchema = z.object({
  title: z.string().min(3, 'Tên vai trò tối thiểu 3 ký tự').max(100, 'Tối đa 100 ký tự'),
  quantity: z.coerce.number({ invalid_type_error: 'Vui lòng nhập số lượng' }).min(1, 'Cần ít nhất 1 TNV'),
  skillsRequired: z.array(z.string()).optional(),
});

export const step1Schema = z.object({
  title: z.string().min(10, 'Tên dự án tối thiểu 10 ký tự').max(200, 'Tối đa 200 ký tự'),
  category: z.enum(PROJECT_CATEGORY, {
    errorMap: () => ({ message: 'Vui lòng chọn một danh mục hợp lệ' })
  }),
  location: locationSchema,
  description: z.string().min(20, 'Vui lòng nhập mô tả chi tiết cho dự án'),
  startDate: z.coerce.date({ invalid_type_error: "Vui lòng chọn ngày bắt đầu" }),
  endDate: z.coerce.date({ invalid_type_error: "Vui lòng chọn ngày kết thúc" }),
  
  coverMedia: z.any().optional(),
  documents: z.array(z.any()).min(1, 'Bắt buộc phải tải lên ít nhất 1 tài liệu chứng minh'),
}).superRefine((data, ctx) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(data.startDate);
  start.setHours(0, 0, 0, 0);

  if (start < today) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Ngày bắt đầu không được trong quá khứ', path: ['startDate'] });
  }
  if (data.endDate <= data.startDate) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Ngày kết thúc phải sau ngày bắt đầu', path: ['endDate'] });
  }
});

export const step2Schema = z.object({
  isFundraising: z.boolean().default(true),
  targetAmount: z.coerce.number({ invalid_type_error: 'Vui lòng nhập số tiền' }).min(0, 'Số tiền không được âm'),
  milestones: z.array(milestoneSchema).optional().default([]),
  needsVolunteers: z.boolean().default(false),
  volunteerRoles: z.array(volunteerRoleSchema).max(20, 'Tối đa 20 vai trò').optional().default([]),
}).superRefine((data, ctx) => {
  if (data.isFundraising) {
    if (data.targetAmount < 100000) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Ngân sách mục tiêu tối thiểu là 100.000 VNĐ', path: ['targetAmount'] });
    }
    if (data.milestones.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Bắt buộc phải có ít nhất 1 mốc giải ngân', path: ['milestones_sum'] });
    } else {
      const sumMilestones = data.milestones.reduce((acc, curr) => acc + (Number(curr.targetAmount) || 0), 0);
      if (sumMilestones !== data.targetAmount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Tổng tiền các mốc hiện tại (${sumMilestones.toLocaleString()}đ) không khớp với Ngân sách (${data.targetAmount.toLocaleString()}đ)`,
          path: ['milestones_sum'],
        });
      }
    }
  } else {
    if (!data.needsVolunteers) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Nếu không kêu gọi quỹ, bạn BẮT BUỘC phải bật tính năng Tuyển Tình nguyện viên', path: ['needsVolunteers'] });
    }
  }

  if (data.needsVolunteers && data.volunteerRoles.length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Vui lòng thêm ít nhất 1 vai trò tình nguyện viên', path: ['volunteerRoles_sum'] });
  }
});