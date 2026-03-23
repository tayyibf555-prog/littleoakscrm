import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../utils/async-handler';
import { prisma } from '../../config/database';
import { z } from 'zod';

const router = Router();
router.use(authenticate);
router.use(authorize(['ADMIN']));

const createGdprRequestSchema = z.object({
  requestType: z.enum(['DATA_ACCESS', 'DATA_DELETION', 'DATA_RECTIFICATION', 'DATA_EXPORT']),
  requestedBy: z.string().min(1),
  requestedByEmail: z.string().email(),
  entityType: z.string().min(1),
  entityId: z.string().optional(),
  notes: z.string().optional(),
});

// GDPR Requests
router.get(
  '/requests',
  asyncHandler(async (_req, res) => {
    const requests = await prisma.gdprRequest.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(requests);
  }),
);

router.post(
  '/requests',
  validate(createGdprRequestSchema),
  asyncHandler(async (req, res) => {
    const request = await prisma.gdprRequest.create({ data: req.body });
    res.status(201).json(request);
  }),
);

router.put(
  '/requests/:id',
  asyncHandler(async (req, res) => {
    const data = { ...req.body };
    if (data.status === 'COMPLETED') {
      data.completedAt = new Date();
      data.completedBy = req.user!.userId;
    }
    const request = await prisma.gdprRequest.update({ where: { id: req.params.id as string }, data });
    res.json(request);
  }),
);

// Audit Log
router.get(
  '/audit-log',
  asyncHandler(async (req, res) => {
    const { entityType, userId, startDate, endDate } = req.query;
    const where: Record<string, unknown> = {};
    if (entityType) where.entityType = entityType;
    if (userId) where.userId = userId;
    if (startDate && endDate) {
      where.createdAt = { gte: new Date(startDate as string), lte: new Date(endDate as string) };
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { email: true, staffProfile: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json(logs);
  }),
);

export default router;
