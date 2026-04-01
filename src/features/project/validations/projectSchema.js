import { z } from 'zod';

export const PROJECT_CATEGORY = [
  'Y_TE', 'GIAO_DUC', 'THIEN_TAI', 'XAY_DUNG', 'MOI_TRUONG', 'KHAC'
];

const getLocationSchema = (t) => z.object({
  type: z.literal('Point').default('Point'),
  coordinates: z.tuple([
    z.number()
      .min(-180, t('validation.location.longitude_min'))
      .max(180, t('validation.location.longitude_max')),
    z.number()
      .min(-90, t('validation.location.latitude_min'))
      .max(90, t('validation.location.latitude_max'))
  ], {
    invalid_type_error: t('validation.location.invalid_coordinates'),
  }),
  address: z.string({ required_error: t('validation.location.address_required') })
    .min(5, t('validation.location.address_min'))
    .max(255, t('validation.location.address_max')),
});

const getMilestoneSchema = (t) => z.object({
  title: z.string().min(5, t('validation.project.milestone_title_min')).max(100, t('validation.project.milestone_title_max')),
  description: z.string().min(10, t('validation.project.milestone_desc_min')).max(500, t('validation.project.milestone_desc_max')),
  targetAmount: z.coerce.number({ invalid_type_error: t('validation.number_required') }).min(1000, t('validation.project.milestone_amount_min')),
});

const getVolunteerRoleSchema = (t) => z.object({
  title: z.string().min(3, t('validation.project.role_title_min')).max(100, t('validation.project.role_title_max')),
  quantity: z.coerce.number({ invalid_type_error: t('validation.number_required') }).min(1, t('validation.project.role_quantity_min')),
  skillsRequired: z.array(z.string()).optional(),
});

export const getStep1Schema = (t) => z.object({
  title: z.string().min(10, t('validation.project.title_min')).max(200, t('validation.project.title_max')),
  category: z.enum(PROJECT_CATEGORY, {
    errorMap: () => ({ message: t('validation.project.category_required') })
  }),
  location: getLocationSchema(t),
  description: z.string().min(20, t('validation.project.description_min')),
  startDate: z.coerce.date({ invalid_type_error: t('validation.project.start_date_required') }),
  endDate: z.coerce.date({ invalid_type_error: t('validation.project.end_date_required') }),
  
  coverMedia: z.any().optional(),
  documents: z.array(z.any()).min(1, t('validation.project.documents_required')),
}).superRefine((data, ctx) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(data.startDate);
  start.setHours(0, 0, 0, 0);

  if (start < today) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.project.start_date_past'), path: ['startDate'] });
  }
  if (data.endDate <= data.startDate) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.project.end_date_before_start'), path: ['endDate'] });
  }
});

export const getStep2Schema = (t) => z.object({
  isFundraising: z.boolean().default(true),
  targetAmount: z.coerce.number({ invalid_type_error: t('validation.number_required') }).min(0, t('validation.project.amount_negative')),
  milestones: z.array(getMilestoneSchema(t)).optional().default([]),
  needsVolunteers: z.boolean().default(false),
  volunteerRoles: z.array(getVolunteerRoleSchema(t)).max(20, t('validation.project.roles_max')).optional().default([]),
}).superRefine((data, ctx) => {
  if (data.isFundraising) {
    if (data.targetAmount < 100000) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.project.target_amount_min'), path: ['targetAmount'] });
    }
    if (data.milestones.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.project.milestones_required'), path: ['milestones_sum'] });
    } else {
      const sumMilestones = data.milestones.reduce((acc, curr) => acc + (Number(curr.targetAmount) || 0), 0);
      if (sumMilestones !== data.targetAmount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('validation.project.milestones_mismatch', { sum: sumMilestones.toLocaleString(), target: data.targetAmount.toLocaleString() }),
          path: ['milestones_sum'],
        });
      }
    }
  } else {
    if (!data.needsVolunteers) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.project.volunteer_required_if_no_fund'), path: ['needsVolunteers'] });
    }
  }

  if (data.needsVolunteers && data.volunteerRoles.length === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('validation.project.roles_required'), path: ['volunteerRoles_sum'] });
  }
});