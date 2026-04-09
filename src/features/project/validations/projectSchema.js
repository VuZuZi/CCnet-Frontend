import { z } from 'zod';

export const PROJECT_TYPE = ['FUNDED', 'VOLUNTEER_ONLY'];
export const PROJECT_CATEGORY = ['Y_TE', 'GIAO_DUC', 'THIEN_TAI', 'XAY_DUNG', 'MOI_TRUONG', 'KHAC'];
export const SURPLUS_POLICY = ['REFUND_PRO_RATA', 'CARRY_OVER', 'DONATE_TO_PLATFORM'];

const locationSchema = z.object({
  type: z.literal('Point').default('Point'),
  coordinates: z.tuple([
    z.number().min(-180).max(180),
    z.number().min(-90).max(90)
  ], { invalid_type_error: "Tọa độ bản đồ không hợp lệ" }),
  address: z.string({ required_error: 'Vui lòng chọn địa điểm' })
    .min(5, 'Địa chỉ quá ngắn')
    .max(255, 'Địa chỉ quá dài'),
});

export const draftStep1Schema = z.object({
  projectType: z.enum(PROJECT_TYPE),
  title: z.string().min(1, 'Vui lòng nhập tên dự án').max(100, 'Tên dự án tối đa 100 ký tự'),
  category: z.enum(PROJECT_CATEGORY, { errorMap: () => ({ message: 'Vui lòng chọn danh mục' }) }),
  location: locationSchema,
  startDate: z.coerce.date().optional().or(z.literal('')),
  endDate: z.coerce.date().optional().or(z.literal('')),

  description: z.string().optional().default(''),
  beneficiaryInfo: z.object({
    details: z.string().optional().default('')
  }).optional(),
  coverMedia: z.array(z.any()).optional().default([]),
  documents: z.array(z.any()).optional().default([]),
}).superRefine((data, ctx) => {
  if (data.startDate && data.endDate && new Date(data.endDate) <= new Date(data.startDate)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Ngày kết thúc phải sau ngày bắt đầu', path: ['endDate'] });
  }
});

export const createProjectSubmitSchema = (tierCapMaxFunding, tierMaxDurationDays) => {
  return z.object({
    projectType: z.enum(PROJECT_TYPE),
    title: z.string().min(10, 'Tên dự án tối thiểu 10 ký tự').max(100, 'Tên dự án tối đa 100 ký tự'),
    category: z.enum(PROJECT_CATEGORY),
    location: locationSchema,
    description: z.string().min(200, 'Mô tả dự án phải chi tiết và dài tối thiểu 200 ký tự'),
    beneficiaryInfo: z.object({
      details: z.string().min(10, 'Vui lòng mô tả rõ người thụ hưởng')
    }),

    startDate: z.coerce.date({ required_error: "Vui lòng chọn ngày bắt đầu" }),
    endDate: z.coerce.date({ required_error: "Vui lòng chọn ngày kết thúc" }),

    coverMedia: z.array(z.any()).default([]),
    documents: z.array(z.any()).default([]),

    targetAmount: z.coerce.number().default(0),
    mvpAmount: z.coerce.number().default(0),
    budgetBreakdown: z.array(z.object({
      item: z.string(), amount: z.coerce.number(), note: z.string().optional()
    })).default([]),
    surplusPolicy: z.enum(SURPLUS_POLICY).or(z.literal('')),

    milestones: z.array(z.any()).default([]),

    needsVolunteers: z.boolean().default(false),
    volunteerRoles: z.array(z.any()).default([]),

  }).superRefine((data, ctx) => {
    const totalMedia = (data.coverMedia?.length || 0) + (data.documents?.length || 0);
    if (totalMedia < 3) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Bắt buộc phải có tổng cộng ít nhất 3 file (ảnh bìa + tài liệu minh chứng)', path: ['documents'] });
    }

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end <= start) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Ngày kết thúc phải sau ngày bắt đầu', path: ['endDate'] });
    }
    const durationDays = (end - start) / (1000 * 60 * 60 * 24);
    if (durationDays > tierMaxDurationDays) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Hạn mức KYC của bạn chỉ cho phép dự án dài tối đa ${tierMaxDurationDays} ngày`, path: ['endDate'] });
    }

    if (data.projectType === 'FUNDED') {
      if (data.targetAmount <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Dự án gây quỹ phải có mục tiêu lớn hơn 0', path: ['targetAmount'] });
      }
      if (data.targetAmount > tierCapMaxFunding) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Hạn mức KYC của bạn chỉ cho phép gọi vốn tối đa ${tierCapMaxFunding.toLocaleString()} VND`, path: ['targetAmount'] });
      }
      if (data.mvpAmount <= 0 || data.mvpAmount > data.targetAmount) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Ngưỡng giải ngân tối thiểu (MVP) không hợp lệ', path: ['mvpAmount'] });
      }
      if (data.budgetBreakdown.length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Bắt buộc phải có bảng giải trình ngân sách chi tiết', path: ['budgetBreakdown'] });
      }
      if (!SURPLUS_POLICY.includes(data.surplusPolicy)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Vui lòng chọn chính sách xử lý tiền thừa', path: ['surplusPolicy'] });
      }

      if (data.milestones.length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Bắt buộc phải có ít nhất 1 mốc hoạt động (Milestone)', path: ['milestones'] });
      } else {
        let totalMilestoneAmount = 0;
        data.milestones.forEach((m, i) => {
          if (!m.endDate) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Mỗi milestone bắt buộc phải có Deadline', path: [`milestones.${i}.endDate`] });
          if (!m.deliverables) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Bắt buộc khai báo kết quả nghiệm thu', path: [`milestones.${i}.deliverables`] });
          totalMilestoneAmount += (Number(m.targetAmount) || 0);
        });
        if (totalMilestoneAmount !== data.targetAmount) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Tổng ngân sách các mốc không khớp với Tổng mục tiêu dự án', path: ['milestones_sum'] });
        }
      }

    } else {
      if (!data.needsVolunteers) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Dự án Volunteer-only bắt buộc phải bật tính năng Tuyển tình nguyện viên', path: ['needsVolunteers'] });
      }
      if (data.milestones.length === 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Vẫn phải có ít nhất 1 mốc hoạt động (không kèm ngân sách)', path: ['milestones'] });
      }
      data.milestones.forEach((m, i) => {
        if (m.targetAmount > 0) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Dự án Volunteer-only không được phép gắn tiền vào Milestone', path: [`milestones.${i}.targetAmount`] });
        }
        if (!m.deliverables) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Bắt buộc khai báo kết quả nghiệm thu', path: [`milestones.${i}.deliverables`] });
      });
    }

    if (data.needsVolunteers && data.volunteerRoles.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Vui lòng cấu hình ít nhất 1 vị trí tình nguyện viên', path: ['volunteerRoles_sum'] });
    }
  });
};

export const draftStep2Schema = z.object({
  targetAmount: z.coerce.number().optional().default(0),
  mvpAmount: z.coerce.number().optional().default(0),
  surplusPolicy: z.string().optional(),
  budgetBreakdown: z.array(z.object({
    item: z.string().optional(),
    amount: z.coerce.number().optional(),
    note: z.string().optional()
  })).optional().default([]),

  milestones: z.array(z.object({
    title: z.string().min(1, 'Tên mốc không được để trống'),
    description: z.string().min(1, 'Vui lòng nhập mô tả cho mốc này'),
    targetAmount: z.coerce.number().optional().default(0),
    endDate: z.coerce.date().optional().or(z.literal('')),
    deliverables: z.string().optional()
  })).optional().default([]),

  needsVolunteers: z.boolean().default(false),
  volunteerRoles: z.array(z.any()).optional().default([]),
}).superRefine((data, ctx) => {
  if (data.targetAmount > 0) {
    if (data.mvpAmount > data.targetAmount) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Ngưỡng giải ngân MVP không được lớn hơn Tổng mục tiêu', path: ['mvpAmount'] });
    }

    if (data.milestones && data.milestones.length > 0) {
      const sumMilestones = data.milestones.reduce((sum, m) => sum + (Number(m.targetAmount) || 0), 0);
      if (sumMilestones !== data.targetAmount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Tổng tiền các mốc (${sumMilestones.toLocaleString()}đ) chưa khớp với Tổng mục tiêu dự án (${data.targetAmount.toLocaleString()}đ).`,
          path: ['milestones_sum']
        });
      }
    }
  }
});

export const createDraftStep2Schema = (projectStartDate, projectEndDate) => z.object({
  targetAmount: z.coerce.number().optional().default(0),
  mvpAmount: z.coerce.number().optional().default(0),
  surplusPolicy: z.string().optional(),
  budgetBreakdown: z.array(z.object({
    item: z.string().optional(),
    amount: z.coerce.number().optional(),
    note: z.string().optional()
  })).optional().default([]),
  
  milestones: z.array(z.object({
    title: z.string().min(1, 'Tên mốc không được để trống'),
    description: z.string().min(1, 'Vui lòng nhập mô tả cho mốc này'), 
    targetAmount: z.coerce.number().optional().default(0),
    endDate: z.coerce.date().optional().or(z.literal('')),
    deliverables: z.string().optional()
  })).optional().default([]),
  
  needsVolunteers: z.boolean().default(false),
  volunteerRoles: z.array(z.any()).optional().default([]),
}).superRefine((data, ctx) => {
  if (data.targetAmount > 0) {
    if (data.mvpAmount > data.targetAmount) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Ngưỡng giải ngân MVP không lớn hơn Tổng mục tiêu', path: ['mvpAmount'] });
    }
    
    if (data.milestones && data.milestones.length > 0) {
      const sumMilestones = data.milestones.reduce((sum, m) => sum + (Number(m.targetAmount) || 0), 0);
      if (sumMilestones !== data.targetAmount) {
        ctx.addIssue({ 
          code: z.ZodIssueCode.custom, 
          message: `Lỗi: Tổng tiền các mốc (${sumMilestones.toLocaleString()}đ) chưa khớp với Tổng mục tiêu dự án (${data.targetAmount.toLocaleString()}đ).`, 
          path: ['milestones_sum'] 
        });
      }
    }
  }

  if (data.milestones && data.milestones.length > 0 && projectStartDate && projectEndDate) {
    const pStart = new Date(projectStartDate);
    const pEnd = new Date(projectEndDate);
    
    data.milestones.forEach((m, idx) => {
      if (m.endDate) {
        const mEnd = new Date(m.endDate);
        if (mEnd < pStart || mEnd > pEnd) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Hạn chót phải nằm trong khoảng thời gian dự án`,
            path: [`milestones`, idx, `endDate`]
          });
        }
      }
    });
  }
});