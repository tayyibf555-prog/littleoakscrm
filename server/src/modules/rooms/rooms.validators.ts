import { z } from 'zod';

export const createRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required'),
  ageGroupMin: z.number().min(0),
  ageGroupMax: z.number().min(0),
  capacity: z.number().positive(),
  ratioRequired: z.string().min(1, 'Ratio is required'),
});

export const updateRoomSchema = z.object({
  name: z.string().min(1).optional(),
  ageGroupMin: z.number().min(0).optional(),
  ageGroupMax: z.number().min(0).optional(),
  capacity: z.number().positive().optional(),
  ratioRequired: z.string().optional(),
  isActive: z.boolean().optional(),
});
