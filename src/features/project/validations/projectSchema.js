import { z } from "zod";

export const PROJECT_TYPE = ["FUNDED", "VOLUNTEER_ONLY"];
export const PROJECT_CATEGORY = ["Y_TE", "GIAO_DUC", "THIEN_TAI", "XAY_DUNG", "MOI_TRUONG", "KHAC"];

const locationSchema = z.object({
  type: z.literal("Point").default("Point"),
  coordinates: z.tuple(
    [
      z.number().min(-180).max(180),
      z.number().min(-90).max(90),
    ],
    { invalid_type_error: "Tọa độ bản đồ không hợp lệ" },
  ),
  address: z
    .string({ required_error: "Vui lòng chọn địa điểm" })
    .min(5, "Địa chỉ quá ngắn")
    .max(255, "Địa chỉ quá dài"),
});

const hasMediaLike = (item) => {
  if (!item) return false;
  return Boolean(item?._id || (item?.url && item?.publicId) || item?.file);
};

export const draftStep1Schema = z.object({
  projectType: z.enum(PROJECT_TYPE),
  title: z.string().min(1, "Vui lòng nhập tên dự án").max(100, "Tên dự án tối đa 100 ký tự"),
  category: z.enum(PROJECT_CATEGORY, { errorMap: () => ({ message: "Vui lòng chọn danh mục" }) }),
  location: locationSchema,
  startDate: z.coerce.date().optional().or(z.literal("")),
  endDate: z.coerce.date().optional().or(z.literal("")),
  description: z.string().optional().default(""),
  beneficiaryInfo: z.object({
    details: z.string().optional().default(""),
  }).optional(),
  coverMedia: z.array(z.any()).optional().default([]),
  documents: z.array(z.any()).optional().default([]),
});

export const draftStep2Schema = z.object({
  targetAmount: z.coerce.number().optional().default(0),
  mvpAmount: z.coerce.number().optional().default(0),
  budgetBreakdown: z.array(z.object({
    item: z.string().optional(),
    amount: z.coerce.number().optional(),
    note: z.string().optional(),
  })).optional().default([]),
  milestones: z.array(z.object({
    title: z.string().min(1, "Tên mốc không được để trống"),
    description: z.string().optional().default(""),
    targetAmount: z.coerce.number().optional().default(0),
    startDate: z.coerce.date().optional().or(z.literal("")),
    endDate: z.coerce.date().optional().or(z.literal("")),
    deliverables: z.string().optional(),
  })).optional().default([]),
  needsVolunteers: z.boolean().default(false),
  volunteerRoles: z.array(z.any()).optional().default([]),
});

export const strictStep1Schema = (tierMaxDurationDays) =>
  z.object({
    projectType: z.enum(PROJECT_TYPE),
    title: z.string().min(10, "Tên dự án tối thiểu 10 ký tự").max(100, "Tên dự án tối đa 100 ký tự"),
    category: z.enum(PROJECT_CATEGORY),
    location: locationSchema,
    startDate: z.coerce.date({ required_error: "Vui lòng chọn ngày bắt đầu", invalid_type_error: "Ngày không hợp lệ" }),
    endDate: z.coerce.date({ required_error: "Vui lòng chọn ngày kết thúc", invalid_type_error: "Ngày không hợp lệ" }),
    description: z.string().min(200, "Mô tả dự án phải chi tiết và dài tối thiểu 200 ký tự"),
    beneficiaryInfo: z.object({
      details: z.string().min(10, "Vui lòng mô tả rõ người thụ hưởng"),
    }),
    coverMedia: z.array(z.any()).default([]),
    documents: z.array(z.any()).default([]),
  }).superRefine((data, ctx) => {
    const totalMedia =
      (data.coverMedia?.filter(hasMediaLike).length || 0) +
      (data.documents?.filter(hasMediaLike).length || 0);

    if (totalMedia < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bắt buộc phải có tổng cộng ít nhất 3 file (ảnh bìa + tài liệu minh chứng)",
        path: ["documents"],
      });
    }

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ngày kết thúc phải sau ngày bắt đầu",
        path: ["endDate"],
      });
    }

    const durationDays = (end - start) / (1000 * 60 * 60 * 24);
    if (durationDays > tierMaxDurationDays) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Hạn mức KYC của bạn chỉ cho phép dự án dài tối đa ${tierMaxDurationDays} ngày`,
        path: ["endDate"],
      });
    }
  });

export const strictStep2Schema = (isFunded, tierCapMaxFunding, projectStartDate, projectEndDate) =>
  z.object({
    targetAmount: z.coerce.number().optional().default(0),
    mvpAmount: z.coerce.number().optional().default(0),
    budgetBreakdown: z.array(z.object({
      item: z.string().min(1, "Không được để trống"),
      amount: z.coerce.number().min(1, "Phải lớn hơn 0"),
      note: z.string().optional(),
    })).optional().default([]),
    milestones: z.array(z.object({
      title: z.string().min(1, "Tên mốc không được để trống"),
      description: z.string().min(10, "Vui lòng nhập mô tả rõ ràng cho mốc này"),
      targetAmount: z.coerce.number().optional().default(0),
      startDate: z.coerce.date({ required_error: "Bắt buộc" }).optional().or(z.literal("")),
      endDate: z.coerce.date({ required_error: "Bắt buộc" }).optional().or(z.literal("")),
      deliverables: z.string().min(5, "Bắt buộc khai báo kết quả"),
    })).optional().default([]),
    needsVolunteers: z.boolean().default(false),
    volunteerRoles: z.array(z.object({
      title: z.string().min(1, "Bắt buộc"),
      quantity: z.coerce.number().min(1, "Phải >= 1"),
    })).optional().default([]),
  }).superRefine((data, ctx) => {
    if (isFunded) {
      if (data.targetAmount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Dự án gây quỹ phải có mục tiêu lớn hơn 0",
          path: ["targetAmount"],
        });
      }

      if (data.targetAmount > tierCapMaxFunding) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Hạn mức KYC của bạn chỉ cho phép gọi vốn tối đa ${tierCapMaxFunding.toLocaleString()} VND`,
          path: ["targetAmount"],
        });
      }

      if (data.mvpAmount <= 0 || data.mvpAmount > data.targetAmount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ngưỡng giải ngân MVP không hợp lệ",
          path: ["mvpAmount"],
        });
      }

      if (!data.budgetBreakdown || data.budgetBreakdown.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Bắt buộc phải có bảng giải trình ngân sách chi tiết",
          path: ["budgetBreakdown"],
        });
      }

      if (!data.milestones || data.milestones.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Bắt buộc phải có ít nhất 1 mốc hoạt động (Milestone)",
          path: ["milestones"],
        });
      } else {
        let totalMilestoneAmount = 0;

        data.milestones.forEach((m, idx) => {
          totalMilestoneAmount += Number(m.targetAmount) || 0;

          if (!m.startDate) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Bắt buộc", path: ["milestones", idx, "startDate"] });
          }

          if (!m.endDate) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Bắt buộc", path: ["milestones", idx, "endDate"] });
          }

          if (m.startDate && m.endDate && new Date(m.startDate) >= new Date(m.endDate)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Kết thúc sau bắt đầu",
              path: ["milestones", idx, "endDate"],
            });
          }

          if (projectStartDate && projectEndDate) {
            const pStart = new Date(projectStartDate);
            const pEnd = new Date(projectEndDate);

            if (m.startDate && new Date(m.startDate) < pStart) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Ngoài TG dự án",
                path: ["milestones", idx, "startDate"],
              });
            }

            if (m.endDate && new Date(m.endDate) > pEnd) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Ngoài TG dự án",
                path: ["milestones", idx, "endDate"],
              });
            }
          }
        });

        if (totalMilestoneAmount !== data.targetAmount) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Tổng tiền các mốc (${totalMilestoneAmount.toLocaleString()}đ) chưa khớp với Tổng mục tiêu dự án (${data.targetAmount.toLocaleString()}đ).`,
            path: ["milestones_sum"],
          });
        }
      }
    } else {
      if (!data.needsVolunteers) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Dự án Volunteer-only bắt buộc phải bật tính năng Tuyển tình nguyện viên",
          path: ["needsVolunteers"],
        });
      }

      if (!data.milestones || data.milestones.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Vẫn phải có ít nhất 1 mốc hoạt động (không kèm ngân sách)",
          path: ["milestones"],
        });
      }

      data.milestones?.forEach((m, idx) => {
        if (m.targetAmount > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Dự án Volunteer không có ngân sách",
            path: ["milestones", idx, "targetAmount"],
          });
        }
      });
    }

    if (data.needsVolunteers && (!data.volunteerRoles || data.volunteerRoles.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Vui lòng cấu hình ít nhất 1 vị trí tình nguyện viên",
        path: ["volunteerRoles_sum"],
      });
    }
  });

export const createProjectSubmitSchema = (tierCapMaxFunding, tierMaxDurationDays) =>
  z.object({
    projectType: z.enum(PROJECT_TYPE),
    title: z.string().min(10, "Tên dự án tối thiểu 10 ký tự").max(100, "Tên dự án tối đa 100 ký tự"),
    category: z.enum(PROJECT_CATEGORY),
    location: locationSchema,
    description: z.string().min(200, "Mô tả dự án phải tối thiểu 200 ký tự"),
    beneficiaryInfo: z.object({
      details: z.string().min(10, "Vui lòng mô tả rõ người thụ hưởng"),
    }),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    coverMedia: z.array(z.any()).default([]),
    documents: z.array(z.any()).default([]),
    targetAmount: z.coerce.number().optional().default(0),
    mvpAmount: z.coerce.number().optional().default(0),
    budgetBreakdown: z.array(z.any()).optional().default([]),
    milestones: z.array(z.object({
      title: z.string().min(1, "Thiếu tên mốc"),
      description: z.string().min(10, "Thiếu mô tả mốc"),
      targetAmount: z.coerce.number().optional().default(0),
      startDate: z.any().optional(),
      endDate: z.any().optional(),
      deliverables: z.string().min(5, "Thiếu deliverables"),
    })).min(1, "Phải có ít nhất 1 milestone"),
    needsVolunteers: z.boolean().optional().default(false),
    volunteerRoles: z.array(z.object({
      title: z.string().min(1, "Thiếu tên vị trí"),
      quantity: z.coerce.number().min(1, "Số lượng phải >= 1"),
    })).optional().default([]),
  }).superRefine((data, ctx) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (end <= start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ngày kết thúc phải sau ngày bắt đầu",
        path: ["endDate"],
      });
    }

    const durationDays = (end - start) / (1000 * 60 * 60 * 24);
    if (durationDays > tierMaxDurationDays) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Hạn mức KYC của bạn chỉ cho phép dự án dài tối đa ${tierMaxDurationDays} ngày`,
        path: ["endDate"],
      });
    }

    const totalMedia =
      (data.coverMedia?.filter(hasMediaLike).length || 0) +
      (data.documents?.filter(hasMediaLike).length || 0);

    if (totalMedia < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bắt buộc phải có tối thiểu 3 file minh chứng",
        path: ["documents"],
      });
    }

    if (data.projectType === "FUNDED") {
      if (data.targetAmount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Dự án FUNDED phải có mục tiêu gây quỹ lớn hơn 0",
          path: ["targetAmount"],
        });
      }

      if (data.targetAmount > tierCapMaxFunding) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Hạn mức KYC của bạn chỉ cho phép gọi vốn tối đa ${tierCapMaxFunding.toLocaleString()} VND`,
          path: ["targetAmount"],
        });
      }

      if (data.mvpAmount <= 0 || data.mvpAmount > data.targetAmount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ngưỡng MVP không hợp lệ",
          path: ["mvpAmount"],
        });
      }

      if (!data.budgetBreakdown || data.budgetBreakdown.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Bắt buộc phải có bảng giải trình ngân sách",
          path: ["budgetBreakdown"],
        });
      }

      const totalMilestoneAmount = data.milestones.reduce(
        (sum, milestone) => sum + (Number(milestone.targetAmount) || 0),
        0,
      );

      if (totalMilestoneAmount !== data.targetAmount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Tổng tiền các mốc (${totalMilestoneAmount.toLocaleString()}đ) chưa khớp với Tổng mục tiêu dự án (${data.targetAmount.toLocaleString()}đ).`,
          path: ["milestones"],
        });
      }

      data.milestones.forEach((m, idx) => {
        if (!m.endDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Mốc FUNDED bắt buộc phải có hạn chót",
            path: ["milestones", idx, "endDate"],
          });
        }
      });
    }

    if (data.needsVolunteers && (!data.volunteerRoles || data.volunteerRoles.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bạn đã bật tuyển tình nguyện viên nhưng chưa cấu hình vị trí",
        path: ["volunteerRoles"],
      });
    }

    if (data.projectType === "VOLUNTEER_ONLY") {
      data.milestones.forEach((m, idx) => {
        if ((Number(m.targetAmount) || 0) > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Dự án Volunteer-only không được gán ngân sách cho milestone",
            path: ["milestones", idx, "targetAmount"],
          });
        }
      });
    }
  });