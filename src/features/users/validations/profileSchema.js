import { z } from 'zod';

export const profileSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    phone: z.string()
        .regex(/^\+?[0-9\s-]{7,15}$/, 'Invalid phone number format')
        .or(z.literal(''))
        .optional(),
    location: z.string().max(100, 'Location must be at most 100 characters').or(z.literal('')).optional(),
    headline: z.string().max(150, 'Headline must be at most 150 characters').or(z.literal('')).optional(),
    about: z.string().max(1000, 'About section must be at most 1000 characters').or(z.literal('')).optional(),
    skills: z.preprocess(
        (val) => {
            if (typeof val === 'string') {
                return val.split(',').map(s => s.trim()).filter(Boolean);
            }
            return val || [];
        },
        z.array(z.string().max(50, 'Each skill must be at most 50 characters'))
         .max(20, 'Maximum 20 skills allowed')
    ).optional()
});
