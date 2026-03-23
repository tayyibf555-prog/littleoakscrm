import { z } from 'zod';

export const checkInChildSchema = z.object({
  childId: z.string().min(1, 'Child ID is required'),
  time: z.string().optional(), // defaults to now
});

export const checkOutChildSchema = z.object({
  childId: z.string().min(1, 'Child ID is required'),
  time: z.string().optional(),
});

export const updateChildAttendanceSchema = z.object({
  status: z.enum(['EXPECTED', 'PRESENT', 'ABSENT_NOTIFIED', 'ABSENT_UNNOTIFIED', 'HOLIDAY']),
  absenceReason: z.string().optional(),
  notes: z.string().optional(),
});

export const checkInStaffSchema = z.object({
  staffId: z.string().min(1, 'Staff ID is required'),
  time: z.string().optional(),
});

export const checkOutStaffSchema = z.object({
  staffId: z.string().min(1, 'Staff ID is required'),
  time: z.string().optional(),
});
