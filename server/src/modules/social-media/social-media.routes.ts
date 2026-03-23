import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../utils/async-handler';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';
import { z } from 'zod';

const router = Router();
router.use(authenticate);
router.use(authorize(['ADMIN', 'MANAGER']));

const createPostSchema = z.object({
  content: z.string().min(1),
  mediaUrls: z.array(z.string()).default([]),
  platforms: z.array(z.string()).min(1, 'At least one platform is required'),
  scheduledFor: z.string().optional(),
  childrenInPost: z.array(z.string()).default([]),
});

// List connected accounts
router.get(
  '/accounts',
  asyncHandler(async (_req, res) => {
    const accounts = await prisma.socialMediaAccount.findMany();
    res.json(accounts);
  }),
);

// Get children with social media consent
router.get(
  '/consent-children',
  asyncHandler(async (_req, res) => {
    const children = await prisma.child.findMany({
      where: {
        status: 'ACTIVE',
        socialMediaConsent: { canPostPhotos: true },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        socialMediaConsent: true,
      },
    });
    res.json(children);
  }),
);

// List posts
router.get(
  '/posts',
  asyncHandler(async (_req, res) => {
    const posts = await prisma.socialMediaPost.findMany({
      include: {
        author: { select: { staffProfile: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(posts);
  }),
);

// Create post
router.post(
  '/posts',
  validate(createPostSchema),
  asyncHandler(async (req, res) => {
    const { childrenInPost, platforms } = req.body;

    // Verify consent for all children in the post
    if (childrenInPost.length > 0) {
      const consents = await prisma.socialMediaConsent.findMany({
        where: {
          childId: { in: childrenInPost },
          canPostPhotos: true,
        },
      });

      const consentedChildIds = new Set(consents.map((c) => c.childId));
      const unconsentedChildren = childrenInPost.filter(
        (id: string) => !consentedChildIds.has(id),
      );

      if (unconsentedChildren.length > 0) {
        const children = await prisma.child.findMany({
          where: { id: { in: unconsentedChildren } },
          select: { firstName: true, lastName: true },
        });
        const names = children.map((c) => `${c.firstName} ${c.lastName}`).join(', ');
        throw new AppError(
          400,
          `Cannot post — the following children do not have social media consent: ${names}`,
        );
      }

      // Check platform-specific consent
      for (const consent of consents) {
        const missingPlatforms = platforms.filter(
          (p: string) => !consent.platforms.includes(p),
        );
        if (missingPlatforms.length > 0) {
          const child = await prisma.child.findUnique({
            where: { id: consent.childId },
            select: { firstName: true, lastName: true },
          });
          throw new AppError(
            400,
            `${child?.firstName} ${child?.lastName} does not have consent for: ${missingPlatforms.join(', ')}`,
          );
        }
      }
    }

    const post = await prisma.socialMediaPost.create({
      data: {
        authorId: req.user!.userId,
        content: req.body.content,
        mediaUrls: req.body.mediaUrls,
        platforms: req.body.platforms,
        scheduledFor: req.body.scheduledFor ? new Date(req.body.scheduledFor) : undefined,
        status: req.body.scheduledFor ? 'SCHEDULED' : 'DRAFT',
        consentVerified: true,
        childrenInPost: req.body.childrenInPost,
      },
    });

    // TODO: If not scheduled, publish immediately via Ayrshare
    // For now, just create the record

    res.status(201).json(post);
  }),
);

// Get post detail
router.get(
  '/posts/:id',
  asyncHandler(async (req, res) => {
    const post = await prisma.socialMediaPost.findUnique({
      where: { id: req.params.id as string },
      include: {
        author: { select: { staffProfile: { select: { firstName: true, lastName: true } } } },
      },
    });
    if (!post) throw new AppError(404, 'Post not found');
    res.json(post);
  }),
);

// Delete post
router.delete(
  '/posts/:id',
  asyncHandler(async (req, res) => {
    await prisma.socialMediaPost.delete({ where: { id: req.params.id as string } });
    res.status(204).send();
  }),
);

export default router;
