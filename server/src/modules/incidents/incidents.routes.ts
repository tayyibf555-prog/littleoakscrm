import { Router } from 'express';
import { incidentsController } from './incidents.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  createIncidentSchema,
  signoffIncidentSchema,
  notifyParentSchema,
} from './incidents.validators';
import { asyncHandler } from '../../utils/async-handler';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(incidentsController.list.bind(incidentsController)));
router.post(
  '/',
  validate(createIncidentSchema),
  asyncHandler(incidentsController.create.bind(incidentsController)),
);
router.get('/:id', asyncHandler(incidentsController.getById.bind(incidentsController)));
router.post(
  '/:id/signoff',
  authorize(['ADMIN', 'MANAGER']),
  validate(signoffIncidentSchema),
  asyncHandler(incidentsController.signoff.bind(incidentsController)),
);
router.put(
  '/:id/parent-notify',
  validate(notifyParentSchema),
  asyncHandler(incidentsController.notifyParent.bind(incidentsController)),
);

export default router;
