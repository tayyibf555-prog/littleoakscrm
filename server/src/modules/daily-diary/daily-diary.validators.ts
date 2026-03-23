import { z } from 'zod';

export const createDiaryEntrySchema = z.object({
  childId: z.string().min(1, 'Child ID is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  entryType: z.enum([
    'MEAL',
    'NAP',
    'NAPPY',
    'ACTIVITY',
    'OBSERVATION',
    'MILESTONE',
    'NOTE',
    'MEDICATION_GIVEN',
  ]),
  content: z.record(z.unknown()),
  photoUrls: z.array(z.string()).default([]),
  isPrivate: z.boolean().default(false),
});

export const updateDiaryEntrySchema = z.object({
  content: z.record(z.unknown()).optional(),
  photoUrls: z.array(z.string()).optional(),
  isPrivate: z.boolean().optional(),
});
