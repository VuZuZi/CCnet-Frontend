import { z } from "zod";

export const PROJECT_TYPE = ["FUNDED", "VOLUNTEER_ONLY"];
export const PROJECT_CATEGORY = [
  "Y_TE",
  "GIAO_DUC",
  "THIEN_TAI",
  "XAY_DUNG",
  "MOI_TRUONG",
  "KHAC",
];

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

const mediaLikeSchema = z.any();

const hasMediaLike = (item) => {
  if (!item) return false;
  return Boolean(item?._id || (item?.url && item?.publicId) || item?.file);
};

const dateOrEmptySchema = z.coerce.date().optional().or(z.literal(""));

const baseMilestoneSchema = z.object({
  title: z.string().min(1, "Tên mốc không được để trống").max(100, "Tên mốc tối đa 100 ký tự"),
  description: z.string().optional().default(""),
  targetAmount: z.coerce.number().optional().default(0),
  startDate: dateOrEmptySchema,
  endDate: dateOrEmptySchema,
  deliverables: z.string().optional(),
});

const strictMilestoneSchema = z.object({
  title: z
    .string()
    .min(1, "Tên mốc không được để trống")
    .max(100, "Tên mốc tối đa 100 ký tự"),
  description: z
    .string()
    .min(10, "Vui lòng nhập mô tả rõ ràng cho mốc này")
    .max(500, "Mô tả mốc tối đa 500 ký tự"),
  targetAmount: z.coerce.number().optional().default(0),
  startDate: dateOrEmptySchema,
  endDate: dateOrEmptySchema,
  deliverables: z.string().optional().default(""),
});

const volunteerRoleSchema = z.object({
  title: z.string().min(1, "Bắt buộc"),
  quantity: z.coerce.number().min(1, "Phải >= 1"),
});

const budgetItemSchema = z.object({
  item: z.string().min(1, "Không được để trống"),
  amount: z.coerce.number().min(1, "Phải lớn hơn 0"),
  note: z.string().optional(),
});

const getDateDifferenceInDays = (start, end) =>
  (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24);

const validateProjectDateRange = (startDate, endDate, ctx, tierMaxDurationDays) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Ngày kết thúc phải sau ngày bắt đầu",
      path: ["endDate"],
    });
    return;
  }

  const durationDays = getDateDifferenceInDays(start, end);
  if (durationDays > tierMaxDurationDays) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Hạn mức KYC của bạn chỉ cho phép dự án dài tối đa ${tierMaxDurationDays} ngày`,
      path: ["endDate"],
    });
  }
};

const validateMinimumMedia = (coverMedia, documents, ctx, message) => {
  const totalMedia =
    (coverMedia?.filter(hasMediaLike).length || 0) +
    (documents?.filter(hasMediaLike).length || 0);

  if (totalMedia < 3) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message,
      path: ["documents"],
    });
  }
};

const validateVolunteerRequirement = (
  needsVolunteers,
  volunteerRoles,
  ctx,
  path = ["volunteerRoles"],
) => {
  if (needsVolunteers && (!volunteerRoles || volunteerRoles.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Vui lòng cấu hình ít nhất 1 vị trí tình nguyện viên",
      path,
    });
  }
};

const validateMilestoneInsideProjectRange = (
  milestones,
  projectStartDate,
  projectEndDate,
  ctx,
) => {
  if (!projectStartDate || !projectEndDate) return;

  const projectStart = new Date(projectStartDate);
  const projectEnd = new Date(projectEndDate);

  milestones.forEach((milestone, index) => {
    if (milestone.startDate && new Date(milestone.startDate) < projectStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ngoài TG dự án",
        path: ["milestones", index, "startDate"],
      });
    }

    if (milestone.endDate && new Date(milestone.endDate) > projectEnd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Ngoài TG dự án",
        path: ["milestones", index, "endDate"],
      });
    }
  });
};

const validateMilestoneDateOrder = (milestones, ctx) => {
  milestones.forEach((milestone, index) => {
    if (
      milestone.startDate &&
      milestone.endDate &&
      new Date(milestone.startDate) >= new Date(milestone.endDate)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Kết thúc sau bắt đầu",
        path: ["milestones", index, "endDate"],
      });
    }
  });
};

const validateMilestoneRequiredFields = (milestones, ctx) => {
  milestones.forEach((milestone, index) => {
    const deliverables = String(milestone.deliverables || "").trim();

    if (!milestone.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bắt buộc",
        path: ["milestones", index, "startDate"],
      });
    }

    if (!milestone.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bắt buộc",
        path: ["milestones", index, "endDate"],
      });
    }

    if (!deliverables) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bắt buộc khai báo kết quả",
        path: ["milestones", index, "deliverables"],
      });
    } else if (deliverables.length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Bắt buộc khai báo kết quả",
        path: ["milestones", index, "deliverables"],
      });
    } else if (deliverables.length > 1000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Kết quả nghiệm thu tối đa 1000 ký tự",
        path: ["milestones", index, "deliverables"],
      });
    }
  });
};

const validateFundedMilestones = (
  milestones,
  targetAmount,
  projectStartDate,
  projectEndDate,
  ctx,
) => {
  if (!milestones || milestones.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Bắt buộc phải có ít nhất 1 mốc hoạt động (Milestone)",
      path: ["milestones"],
    });
    return;
  }

  let totalMilestoneAmount = 0;

  milestones.forEach((milestone) => {
    totalMilestoneAmount += Number(milestone.targetAmount) || 0;
  });

  validateMilestoneRequiredFields(milestones, ctx);
  validateMilestoneDateOrder(milestones, ctx);
  validateMilestoneInsideProjectRange(
    milestones,
    projectStartDate,
    projectEndDate,
    ctx,
  );

  if (totalMilestoneAmount !== targetAmount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Tổng tiền các mốc (${totalMilestoneAmount.toLocaleString()}đ) chưa khớp với Tổng mục tiêu dự án (${targetAmount.toLocaleString()}đ).`,
      path: ["milestones"],
    });
  }
};

const validateVolunteerOnlyMilestones = (
  milestones,
  projectStartDate,
  projectEndDate,
  ctx,
) => {
  if (!milestones || milestones.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Vẫn phải có ít nhất 1 mốc hoạt động (không kèm ngân sách)",
      path: ["milestones"],
    });
    return;
  }

  validateMilestoneRequiredFields(milestones, ctx);
  validateMilestoneDateOrder(milestones, ctx);
  validateMilestoneInsideProjectRange(
    milestones,
    projectStartDate,
    projectEndDate,
    ctx,
  );

  milestones.forEach((milestone, index) => {
    if ((Number(milestone.targetAmount) || 0) > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Dự án Volunteer không có ngân sách",
        path: ["milestones", index, "targetAmount"],
      });
    }
  });
};

export const draftStep1Schema = z.object({
  projectType: z.enum(PROJECT_TYPE),
  title: z
    .string()
    .min(1, "Vui lòng nhập tên dự án")
    .max(100, "Tên dự án tối đa 100 ký tự"),
  category: z.enum(PROJECT_CATEGORY, {
    errorMap: () => ({ message: "Vui lòng chọn danh mục" }),
  }),
  location: locationSchema,
  startDate: dateOrEmptySchema,
  endDate: dateOrEmptySchema,
  description: z.string().optional().default(""),
  beneficiaryInfo: z
    .object({
      details: z.string().optional().default(""),
    })
    .optional(),
  coverMedia: z.array(mediaLikeSchema).optional().default([]),
  documents: z.array(mediaLikeSchema).optional().default([]),
});

export const draftStep2Schema = z.object({
  targetAmount: z.coerce.number().optional().default(0),
  mvpAmount: z.coerce.number().optional().default(0),
  budgetBreakdown: z
    .array(
      z.object({
        item: z.string().optional(),
        amount: z.coerce.number().optional(),
        note: z.string().optional(),
      }),
    )
    .optional()
    .default([]),
  milestones: z.array(baseMilestoneSchema).optional().default([]),
  needsVolunteers: z.boolean().default(false),
  volunteerRoles: z.array(mediaLikeSchema).optional().default([]),
});

export const strictStep1Schema = (tierMaxDurationDays) =>
  z
    .object({
      projectType: z.enum(PROJECT_TYPE),
      title: z
        .string()
        .min(10, "Tên dự án tối thiểu 10 ký tự")
        .max(100, "Tên dự án tối đa 100 ký tự"),
      category: z.enum(PROJECT_CATEGORY),
      location: locationSchema,
      startDate: z.coerce.date({
        required_error: "Vui lòng chọn ngày bắt đầu",
        invalid_type_error: "Ngày không hợp lệ",
      }),
      endDate: z.coerce.date({
        required_error: "Vui lòng chọn ngày kết thúc",
        invalid_type_error: "Ngày không hợp lệ",
      }),
      description: z
        .string()
        .min(200, "Mô tả dự án phải chi tiết và dài tối thiểu 200 ký tự"),
      beneficiaryInfo: z.object({
        details: z.string().min(10, "Vui lòng mô tả rõ người thụ hưởng"),
      }),
      coverMedia: z.array(mediaLikeSchema).default([]),
      documents: z.array(mediaLikeSchema).default([]),
    })
    .superRefine((data, ctx) => {
      validateMinimumMedia(
        data.coverMedia,
        data.documents,
        ctx,
        "Bắt buộc phải có tổng cộng ít nhất 3 file (ảnh bìa + tài liệu minh chứng)",
      );

      validateProjectDateRange(
        data.startDate,
        data.endDate,
        ctx,
        tierMaxDurationDays,
      );
    });

export const strictStep2Schema = (
  isFunded,
  tierCapMaxFunding,
  projectStartDate,
  projectEndDate,
) =>
  z
    .object({
      targetAmount: z.coerce.number().optional().default(0),
      mvpAmount: z.coerce.number().optional().default(0),
      budgetBreakdown: z.array(budgetItemSchema).optional().default([]),
      milestones: z.array(strictMilestoneSchema).optional().default([]),
      needsVolunteers: z.boolean().default(false),
      volunteerRoles: z.array(volunteerRoleSchema).optional().default([]),
    })
    .superRefine((data, ctx) => {
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

        validateFundedMilestones(
          data.milestones,
          data.targetAmount,
          projectStartDate,
          projectEndDate,
          ctx,
        );
      } else {
        if (!data.needsVolunteers) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Dự án Volunteer-only bắt buộc phải bật tính năng Tuyển tình nguyện viên",
            path: ["needsVolunteers"],
          });
        }

        validateVolunteerOnlyMilestones(
          data.milestones,
          projectStartDate,
          projectEndDate,
          ctx,
        );
      }

      validateVolunteerRequirement(
        data.needsVolunteers,
        data.volunteerRoles,
        ctx,
      );
    });

export const createProjectSubmitSchema = (
  tierCapMaxFunding,
  tierMaxDurationDays,
) =>
  z
    .object({
      projectType: z.enum(PROJECT_TYPE),
      title: z
        .string()
        .min(10, "Tên dự án tối thiểu 10 ký tự")
        .max(100, "Tên dự án tối đa 100 ký tự"),
      category: z.enum(PROJECT_CATEGORY),
      location: locationSchema,
      description: z.string().min(200, "Mô tả dự án phải tối thiểu 200 ký tự"),
      beneficiaryInfo: z.object({
        details: z.string().min(10, "Vui lòng mô tả rõ người thụ hưởng"),
      }),
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
      coverMedia: z.array(mediaLikeSchema).default([]),
      documents: z.array(mediaLikeSchema).default([]),
      targetAmount: z.coerce.number().optional().default(0),
      mvpAmount: z.coerce.number().optional().default(0),
      budgetBreakdown: z.array(mediaLikeSchema).optional().default([]),
      milestones: z
        .array(
          z.object({
            title: z.string().min(1, "Thiếu tên mốc"),
            description: z.string().min(10, "Thiếu mô tả mốc"),
            targetAmount: z.coerce.number().optional().default(0),
            startDate: z.any().optional(),
            endDate: z.any().optional(),
            deliverables: z.string().optional().default(""),
          }),
        )
        .min(1, "Phải có ít nhất 1 milestone"),
      needsVolunteers: z.boolean().optional().default(false),
      volunteerRoles: z.array(volunteerRoleSchema).optional().default([]),
    })
    .superRefine((data, ctx) => {
      validateProjectDateRange(
        data.startDate,
        data.endDate,
        ctx,
        tierMaxDurationDays,
      );

      validateMinimumMedia(
        data.coverMedia,
        data.documents,
        ctx,
        "Bắt buộc phải có tối thiểu 3 file minh chứng",
      );

      validateMilestoneRequiredFields(data.milestones, ctx);
      validateMilestoneDateOrder(data.milestones, ctx);
      validateMilestoneInsideProjectRange(
        data.milestones,
        data.startDate,
        data.endDate,
        ctx,
      );

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
      }

      validateVolunteerRequirement(
        data.needsVolunteers,
        data.volunteerRoles,
        ctx,
        ["volunteerRoles"],
      );

      if (data.projectType === "VOLUNTEER_ONLY") {
        data.milestones.forEach((milestone, index) => {
          if ((Number(milestone.targetAmount) || 0) > 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Dự án Volunteer-only không được gán ngân sách cho milestone",
              path: ["milestones", index, "targetAmount"],
            });
          }
        });

        if (!data.needsVolunteers) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Dự án Volunteer-only bắt buộc phải bật tính năng Tuyển tình nguyện viên",
            path: ["needsVolunteers"],
          });
        }
      }
    });