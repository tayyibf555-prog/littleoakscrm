import { Router } from 'express';
import { parentsController } from './parents.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createParentSchema, linkChildSchema } from './parents.validators';
import { asyncHandler } from '../../utils/async-handler';

const router = Router();
router.use(authenticate);
router.use(authorize(['ADMIN', 'MANAGER']));

router.get('/', asyncHandler(parentsController.list.bind(parentsController)));
router.post('/', validate(createParentSchema), asyncHandler(parentsController.create.bind(parentsController)));
router.get('/:id', asyncHandler(parentsController.getById.bind(parentsController)));
router.put('/:id', asyncHandler(parentsController.update.bind(parentsController)));
router.post(
  '/:id/link-child',
  validate(linkChildSchema),
  asyncHandler(parentsController.linkToChild.bind(parentsController)),
);

export default router;
