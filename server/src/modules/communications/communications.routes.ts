import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../utils/async-handler';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

// === Announcements ===

const createAnnouncementSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  isPinned: z.boolean().default(false),
  expiresAt: z.string().optional(),
});

router.get(
  '/announcements',
  asyncHandler(async (_req, res) => {
    const announcements = await prisma.announcement.findMany({
      include: {
        author: { select: { staffProfile: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
    });
    res.json(announcements);
  }),
);

router.post(
  '/announcements',
  authorize(['ADMIN', 'MANAGER']),
  validate(createAnnouncementSchema),
  asyncHandler(async (req, res) => {
    const announcement = await prisma.announcement.create({
      data: {
        ...req.body,
        authorId: req.user!.userId,
        expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined,
      },
    });
    res.status(201).json(announcement);
  }),
);

router.put(
  '/announcements/:id',
  authorize(['ADMIN', 'MANAGER']),
  asyncHandler(async (req, res) => {
    const announcement = await prisma.announcement.update({
      where: { id: req.params.id as string },
      data: req.body,
    });
    res.json(announcement);
  }),
);

router.delete(
  '/announcements/:id',
  authorize(['ADMIN', 'MANAGER']),
  asyncHandler(async (req, res) => {
    await prisma.announcement.delete({ where: { id: req.params.id as string } });
    res.status(204).send();
  }),
);

// === Tasks ===

const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  assigneeId: z.string().min(1),
  dueDate: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
});

const updateTaskStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
});

router.get(
  '/tasks',
  asyncHandler(async (req, res) => {
    const where: Record<string, unknown> = {};
    if (req.query.assigneeId) where.assigneeId = req.query.assigneeId;
    if (req.query.status) where.status = req.query.status;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { staffProfile: { select: { firstName: true, lastName: true } } } },
        createdBy: { select: { staffProfile: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
    });
    res.json(tasks);
  }),
);

router.post(
  '/tasks',
  validate(createTaskSchema),
  asyncHandler(async (req, res) => {
    const task = await prisma.task.create({
      data: {
        ...req.body,
        createdById: req.user!.userId,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
      },
    });
    res.status(201).json(task);
  }),
);

router.put(
  '/tasks/:id',
  asyncHandler(async (req, res) => {
    const data = { ...req.body };
    if (data.dueDate) data.dueDate = new Date(data.dueDate);
    const task = await prisma.task.update({ where: { id: req.params.id as string }, data });
    res.json(task);
  }),
);

router.put(
  '/tasks/:id/status',
  validate(updateTaskStatusSchema),
  asyncHandler(async (req, res) => {
    const task = await prisma.task.update({
      where: { id: req.params.id as string },
      data: {
        status: req.body.status,
        completedAt: req.body.status === 'DONE' ? new Date() : null,
      },
    });
    res.json(task);
  }),
);

router.delete(
  '/tasks/:id',
  asyncHandler(async (req, res) => {
    await prisma.task.delete({ where: { id: req.params.id as string } });
    res.status(204).send();
  }),
);

export default router;
