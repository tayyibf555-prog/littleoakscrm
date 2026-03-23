import { z } from 'zod';

export const createParentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(1, 'Phone is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  email: z.string().email().optional(),
  phoneSecondary: z.string().optional(),
  address: z.string().optional(),
  isMainContact: z.boolean().default(false),
});

export const linkChildSchema = z.object({
  childId: z.string().min(1),
  relationship: z.string().min(1),
  isPrimaryContact: z.boolean().default(false),
  livesWithChild: z.boolean().default(true),
  hasParentalResponsibility: z.boolean().default(true),
});
