import { Router } from 'express';
import { childrenController } from './children.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  createChildSchema,
  updateChildSchema,
  createEmergencyContactSchema,
  updateConsentsSchema,
  updateMedicalInfoSchema,
} from './children.validators';
import { asyncHandler } from '../../utils/async-handler';

const router = Router();
router.use(authenticate);

// Children CRUD
router.get('/', asyncHandler(childrenController.list.bind(childrenController)));
router.post(
  '/',
  authorize(['ADMIN', 'MANAGER']),
  validate(createChildSchema),
  asyncHandler(childrenController.create.bind(childrenController)),
);
router.get('/:id', asyncHandler(childrenController.getById.bind(childrenController)));
router.put(
  '/:id',
  authorize(['ADMIN', 'MANAGER']),
  validate(updateChildSchema),
  asyncHandler(childrenController.update.bind(childrenController)),
);

// Medical Info
router.get('/:id/medical', asyncHandler(childrenController.getMedical.bind(childrenController)));
router.put(
  '/:id/medical',
  authorize(['ADMIN', 'MANAGER']),
  validate(updateMedicalInfoSchema),
  asyncHandler(childrenController.updateMedical.bind(childrenController)),
);

// Emergency Contacts
router.get('/:id/contacts', asyncHandler(childrenController.getContacts.bind(childrenController)));
router.post(
  '/:id/contacts',
  authorize(['ADMIN', 'MANAGER']),
  validate(createEmergencyContactSchema),
  asyncHandler(childrenController.createContact.bind(childrenController)),
);
router.put(
  '/:id/contacts/:contactId',
  authorize(['ADMIN', 'MANAGER']),
  asyncHandler(childrenController.updateContact.bind(childrenController)),
);
router.delete(
  '/:id/contacts/:contactId',
  authorize(['ADMIN', 'MANAGER']),
  asyncHandler(childrenController.deleteContact.bind(childrenController)),
);

// Consents
router.get('/:id/consents', asyncHandler(childrenController.getConsents.bind(childrenController)));
router.put(
  '/:id/consents',
  authorize(['ADMIN', 'MANAGER']),
  asyncHandler(childrenController.updateConsents.bind(childrenController)),
);

export default router;
