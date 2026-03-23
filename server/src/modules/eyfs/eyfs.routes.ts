import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../utils/async-handler';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

const createAssessmentSchema = z.object({
  milestoneId: z.string().min(1),
  status: z.enum(['EMERGING', 'DEVELOPING', 'SECURE', 'EXCEEDING', 'NOT_YET']),
  assessedBy: z.string().min(1),
  assessedDate: z.string().min(1),
  evidenceNotes: z.string().optional(),
  evidencePhotoUrls: z.array(z.string()).default([]),
});

// Get all milestones grouped by area
router.get(
  '/milestones',
  asyncHandler(async (req, res) => {
    const { area, ageRange } = req.query;
    const where: Record<string, unknown> = {};
    if (area) where.area = area;
    if (ageRange) where.ageRange = ageRange;

    const milestones = await prisma.eyfsMilestone.findMany({
      where,
      orderBy: [{ area: 'asc' }, { sortOrder: 'asc' }],
    });
    res.json(milestones);
  }),
);

// Get all assessments for a child
router.get(
  '/children/:childId',
  asyncHandler(async (req, res) => {
    const assessments = await prisma.eyfsAssessment.findMany({
      where: { childId: req.params.childId as string },
      include: { milestone: true },
      orderBy: [{ milestone: { area: 'asc' } }, { milestone: { sortOrder: 'asc' } }],
    });
    res.json(assessments);
  }),
);

// Record a new assessment
router.post(
  '/children/:childId',
  validate(createAssessmentSchema),
  asyncHandler(async (req, res) => {
    const assessment = await prisma.eyfsAssessment.create({
      data: {
        childId: req.params.childId as string,
        milestoneId: req.body.milestoneId,
        status: req.body.status,
        assessedBy: req.body.assessedBy,
        assessedDate: new Date(req.body.assessedDate),
        evidenceNotes: req.body.evidenceNotes,
        evidencePhotoUrls: req.body.evidencePhotoUrls,
      },
      include: { milestone: true },
    });
    res.status(201).json(assessment);
  }),
);

// Update an assessment
router.put(
  '/assessments/:id',
  asyncHandler(async (req, res) => {
    const data = { ...req.body };
    if (data.assessedDate) data.assessedDate = new Date(data.assessedDate);
    const assessment = await prisma.eyfsAssessment.update({
      where: { id: req.params.id as string },
      data,
      include: { milestone: true },
    });
    res.json(assessment);
  }),
);

// Progress report - percentage secure per area for a child
router.get(
  '/children/:childId/report',
  asyncHandler(async (req, res) => {
    const childId = req.params.childId as string;

    const child = await prisma.child.findUnique({ where: { id: childId } });
    if (!child) throw new AppError(404, 'Child not found');

    const assessments = await prisma.eyfsAssessment.findMany({
      where: { childId },
      include: { milestone: true },
    });

    const milestones = await prisma.eyfsMilestone.findMany();

    // Group by area
    const areas = ['CL', 'PD', 'PSED', 'L', 'M', 'UW', 'EAD'];
    const report = areas.map((area) => {
      const areaMilestones = milestones.filter((m) => m.area === area);
      const areaAssessments = assessments.filter((a) => a.milestone.area === area);
      const secure = areaAssessments.filter(
        (a) => a.status === 'SECURE' || a.status === 'EXCEEDING',
      ).length;

      return {
        area,
        totalMilestones: areaMilestones.length,
        assessed: areaAssessments.length,
        secure,
        progressPercent: areaMilestones.length > 0 ? Math.round((secure / areaMilestones.length) * 100) : 0,
      };
    });

    res.json(report);
  }),
);

export default router;
