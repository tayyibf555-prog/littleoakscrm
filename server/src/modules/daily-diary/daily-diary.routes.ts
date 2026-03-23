import { Router } from 'express';
import { dailyDiaryController } from './daily-diary.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createDiaryEntrySchema, updateDiaryEntrySchema } from './daily-diary.validators';
import { asyncHandler } from '../../utils/async-handler';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(dailyDiaryController.list.bind(dailyDiaryController)));
router.post(
  '/',
  validate(createDiaryEntrySchema),
  asyncHandler(dailyDiaryController.create.bind(dailyDiaryController)),
);
router.get('/:id', asyncHandler(dailyDiaryController.getById.bind(dailyDiaryController)));
router.put(
  '/:id',
  validate(updateDiaryEntrySchema),
  asyncHandler(dailyDiaryController.update.bind(dailyDiaryController)),
);
router.delete('/:id', asyncHandler(dailyDiaryController.delete.bind(dailyDiaryController)));
router.get(
  '/child/:childId',
  asyncHandler(dailyDiaryController.getByChild.bind(dailyDiaryController)),
);

export default router;
