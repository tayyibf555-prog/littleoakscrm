import { z } from 'zod';

export const createChildSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  preferredName: z.string().optional(),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().optional(),
  roomId: z.string().optional(),
  enrollmentDate: z.string().min(1, 'Enrollment date is required'),
  ethnicity: z.string().optional(),
  religion: z.string().optional(),
  homeLanguage: z.string().optional(),
  isEAL: z.boolean().default(false),
});

export const updateChildSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  preferredName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  roomId: z.string().nullable().optional(),
  status: z.enum(['ACTIVE', 'WAITLIST', 'LEFT']).optional(),
  leavingDate: z.string().optional(),
  ethnicity: z.string().optional(),
  religion: z.string().optional(),
  homeLanguage: z.string().optional(),
  isEAL: z.boolean().optional(),
});

export const createEmergencyContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phone: z.string().min(1, 'Phone is required'),
  phoneSecondary: z.string().optional(),
  email: z.string().email().optional(),
  isAuthorisedPickup: z.boolean().default(false),
  priority: z.number().min(1),
});

export const updateConsentsSchema = z.array(
  z.object({
    consentType: z.enum([
      'PHOTO_INTERNAL',
      'PHOTO_SOCIAL_MEDIA',
      'PHOTO_MARKETING',
      'TRIPS_LOCAL',
      'TRIPS_TRANSPORT',
      'SUNCREAM',
      'NAPPY_CREAM',
      'MEDICATION_ADMIN',
      'FIRST_AID',
      'EMERGENCY_TREATMENT',
    ]),
    granted: z.boolean(),
    grantedBy: z.string().min(1),
  }),
);

export const updateMedicalInfoSchema = z.object({
  allergies: z.string().optional(),
  dietaryNeeds: z.string().optional(),
  medicalConditions: z.string().optional(),
  medications: z.string().optional(),
  gpName: z.string().optional(),
  gpPhone: z.string().optional(),
  gpAddress: z.string().optional(),
  healthVisitor: z.string().optional(),
  specialNeeds: z.string().optional(),
  senStatus: z.string().optional(),
  ehcPlan: z.boolean().optional(),
  additionalNotes: z.string().optional(),
});
