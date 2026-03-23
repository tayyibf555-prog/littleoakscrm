import { z } from 'zod';

export const createStaffSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  qualificationLevel: z.number().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF']).default('STAFF'),
});

export const updateStaffSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  jobTitle: z.string().optional(),
  qualificationLevel: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const upsertDbsSchema = z.object({
  dbsNumber: z.string().min(1, 'DBS number is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  expiryDate: z.string().optional(),
  checkType: z.enum(['BASIC', 'STANDARD', 'ENHANCED', 'ENHANCED_BARRED']),
  status: z.enum(['CLEAR', 'PENDING', 'FLAGGED']),
  onUpdateService: z.boolean().default(false),
  lastCheckedDate: z.string().optional(),
});

export const createQualificationSchema = z.object({
  name: z.string().min(1, 'Qualification name is required'),
  level: z.number().optional(),
  issuedBy: z.string().optional(),
  dateObtained: z.string().optional(),
  expiryDate: z.string().optional(),
});

export const createTrainingSchema = z.object({
  title: z.string().min(1, 'Training title is required'),
  provider: z.string().optional(),
  completedDate: z.string().min(1, 'Completion date is required'),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
});

export const createShiftSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  breakMinutes: z.number().default(0),
  shiftType: z.enum(['REGULAR', 'OVERTIME', 'TRAINING', 'HOLIDAY', 'SICK']).default('REGULAR'),
  notes: z.string().optional(),
});
