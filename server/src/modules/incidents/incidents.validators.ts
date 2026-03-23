import { z } from 'zod';

export const createIncidentSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  location: z.string().min(1, 'Location is required'),
  incidentType: z.enum(['ACCIDENT', 'INJURY', 'BEHAVIOUR', 'NEAR_MISS', 'SAFEGUARDING']),
  severity: z.enum(['MINOR', 'MODERATE', 'SERIOUS']),
  description: z.string().min(1, 'Description is required'),
  actionTaken: z.string().min(1, 'Action taken is required'),
  witnessNames: z.string().optional(),
  photoUrls: z.array(z.string()).default([]),
  childrenIds: z.array(z.string()).min(1, 'At least one child must be associated'),
});

export const signoffIncidentSchema = z.object({
  signoffNotes: z.string().optional(),
});

export const notifyParentSchema = z.object({
  parentNotifiedBy: z.string().min(1),
});
