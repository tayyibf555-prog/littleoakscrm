import { Router } from 'express';
import { roomsController } from './rooms.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createRoomSchema, updateRoomSchema } from './rooms.validators';
import { asyncHandler } from '../../utils/async-handler';

const router = Router();
router.use(authenticate);

router.get('/', asyncHandler(roomsController.list.bind(roomsController)));
router.post(
  '/',
  authorize(['ADMIN', 'MANAGER']),
  validate(createRoomSchema),
  asyncHandler(roomsController.create.bind(roomsController)),
);
router.get('/:id', asyncHandler(roomsController.getById.bind(roomsController)));
router.put(
  '/:id',
  authorize(['ADMIN', 'MANAGER']),
  validate(updateRoomSchema),
  asyncHandler(roomsController.update.bind(roomsController)),
);

export default router;
