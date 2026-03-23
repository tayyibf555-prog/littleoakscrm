import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../utils/async-handler';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

const createDocumentSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.enum(['POLICY', 'FORM', 'CERTIFICATE', 'OFSTED', 'RISK_ASSESSMENT', 'OTHER']),
  fileUrl: z.string().min(1),
  fileName: z.string().min(1),
  fileSize: z.number().positive(),
  mimeType: z.string().min(1),
});

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const where: Record<string, unknown> = { isActive: true };
    if (req.query.category) where.category = req.query.category;
    const documents = await prisma.document.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(documents);
  }),
);

router.post(
  '/',
  authorize(['ADMIN', 'MANAGER']),
  validate(createDocumentSchema),
  asyncHandler(async (req, res) => {
    const doc = await prisma.document.create({
      data: {
        ...req.body,
        uploadedBy: req.user!.userId,
      },
    });
    res.status(201).json(doc);
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const doc = await prisma.document.findUnique({ where: { id: req.params.id as string } });
    if (!doc) throw new AppError(404, 'Document not found');
    res.json(doc);
  }),
);

router.put(
  '/:id',
  authorize(['ADMIN', 'MANAGER']),
  asyncHandler(async (req, res) => {
    const doc = await prisma.document.update({ where: { id: req.params.id as string }, data: req.body });
    res.json(doc);
  }),
);

router.delete(
  '/:id',
  authorize(['ADMIN', 'MANAGER']),
  asyncHandler(async (req, res) => {
    await prisma.document.update({ where: { id: req.params.id as string }, data: { isActive: false } });
    res.status(204).send();
  }),
);

export default router;
