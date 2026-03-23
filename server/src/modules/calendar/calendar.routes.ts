import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../utils/async-handler';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

const createEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  allDay: z.boolean().default(false),
  eventType: z.enum(['TERM_DATE', 'HOLIDAY', 'TRAINING', 'PARENT_EVENT', 'TRIP', 'MEETING', 'OTHER']),
  isRecurring: z.boolean().default(false),
  recurrenceRule: z.string().optional(),
  color: z.string().optional(),
});

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const where: Record<string, unknown> = {};
    if (startDate && endDate) {
      where.startDate = { gte: new Date(startDate as string), lte: new Date(endDate as string) };
    }
    const events = await prisma.calendarEvent.findMany({ where, orderBy: { startDate: 'asc' } });
    res.json(events);
  }),
);

router.post(
  '/',
  authorize(['ADMIN', 'MANAGER']),
  validate(createEventSchema),
  asyncHandler(async (req, res) => {
    const event = await prisma.calendarEvent.create({
      data: {
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      },
    });
    res.status(201).json(event);
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const event = await prisma.calendarEvent.findUnique({ where: { id: req.params.id as string } });
    if (!event) throw new AppError(404, 'Event not found');
    res.json(event);
  }),
);

router.put(
  '/:id',
  authorize(['ADMIN', 'MANAGER']),
  asyncHandler(async (req, res) => {
    const data = { ...req.body };
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    const event = await prisma.calendarEvent.update({ where: { id: req.params.id as string }, data });
    res.json(event);
  }),
);

router.delete(
  '/:id',
  authorize(['ADMIN', 'MANAGER']),
  asyncHandler(async (req, res) => {
    await prisma.calendarEvent.delete({ where: { id: req.params.id as string } });
    res.status(204).send();
  }),
);

export default router;
