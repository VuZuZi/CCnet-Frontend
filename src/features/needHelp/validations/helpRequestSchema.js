import { z } from 'zod';

export const HELP_REQUEST_CATEGORIES = [
  { value: 'Y_TE', label: 'Medical Aid' },
  { value: 'GIAO_DUC', label: 'Education' },
  { value: 'THIEN_TAI', label: 'Disaster Relief' },
  { value: 'XAY_DUNG', label: 'Construction' },
  { value: 'MOI_TRUONG', label: 'Environment' },
  { value: 'KHAC', label: 'Other' },
];

export const URGENCY_LEVELS = [
  { value: 'LOW', label: 'Low', color: 'bg-slate-100 text-slate-700' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-700' },
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
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must not exceed 200 characters'),

  story: z.string()
    .min(50, 'Please provide a more detailed story (min 50 characters)')
    .max(5000, 'Story is too long (max 5000 characters)'),

  category: z.string().min(1, 'Please select a category'),

  location: locationSchema,

  urgencyLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),

  amountNeeded: z.coerce.number()
    .min(0, 'Amount cannot be negative')
    .optional()
    .default(0),

  evidences: z.array(evidenceSchema).max(10, 'Maximum 10 evidence files').optional().default([]),

  contactPhone: z.string()
    .max(20, 'Phone number is too long')
    .optional()
    .transform(val => val === '' ? undefined : val),

  contactEmail: z.string()
    .optional()
    .transform(val => val === '' ? undefined : val)
    .refine(val => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'Please enter a valid email'
    }),
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
