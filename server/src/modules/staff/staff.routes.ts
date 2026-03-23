import { Router } from 'express';
import { staffController } from './staff.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  createStaffSchema,
  updateStaffSchema,
  upsertDbsSchema,
  createQualificationSchema,
  createTrainingSchema,
  createShiftSchema,
} from './staff.validators';
import { asyncHandler } from '../../utils/async-handler';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Staff CRUD
router.get('/', asyncHandler(staffController.list.bind(staffController)));
router.post(
  '/',
  authorize(['ADMIN', 'MANAGER']),
  validate(createStaffSchema),
  asyncHandler(staffController.create.bind(staffController)),
);
router.get('/:id', asyncHandler(staffController.getById.bind(staffController)));
router.put(
  '/:id',
  authorize(['ADMIN', 'MANAGER']),
  validate(updateStaffSchema),
  asyncHandler(staffController.update.bind(staffController)),
);

// DBS
router.get('/:id/dbs', asyncHandler(staffController.getDbs.bind(staffController)));
router.put(
  '/:id/dbs',
  authorize(['ADMIN', 'MANAGER']),
  validate(upsertDbsSchema),
  asyncHandler(staffController.upsertDbs.bind(staffController)),
);

// Qualifications
router.get('/:id/qualifications', asyncHandler(staffController.getQualifications.bind(staffController)));
router.post(
  '/:id/qualifications',
  authorize(['ADMIN', 'MANAGER']),
  validate(createQualificationSchema),
  asyncHandler(staffController.createQualification.bind(staffController)),
);
router.delete(
  '/:id/qualifications/:qualId',
  authorize(['ADMIN', 'MANAGER']),
  asyncHandler(staffController.deleteQualification.bind(staffController)),
);

// Training
router.get('/:id/training', asyncHandler(staffController.getTraining.bind(staffController)));
router.post(
  '/:id/training',
  authorize(['ADMIN', 'MANAGER']),
  validate(createTrainingSchema),
  asyncHandler(staffController.createTraining.bind(staffController)),
);
router.delete(
  '/:id/training/:trainingId',
  authorize(['ADMIN', 'MANAGER']),
  asyncHandler(staffController.deleteTraining.bind(staffController)),
);

// Shifts
router.get('/:id/shifts', asyncHandler(staffController.getShifts.bind(staffController)));
router.post(
  '/:id/shifts',
  authorize(['ADMIN', 'MANAGER']),
  validate(createShiftSchema),
  asyncHandler(staffController.createShift.bind(staffController)),
);
router.delete(
  '/:id/shifts/:shiftId',
  authorize(['ADMIN', 'MANAGER']),
  asyncHandler(staffController.deleteShift.bind(staffController)),
);

export default router;
