import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.validators';
import { asyncHandler } from '../../utils/async-handler';

const router = Router();

router.post('/login', validate(loginSchema), asyncHandler(authController.login.bind(authController)));
router.post('/logout', asyncHandler(authController.logout.bind(authController)));
router.post('/refresh', asyncHandler(authController.refresh.bind(authController)));
router.post(
  '/forgot-password',
  validate(forgotPasswordSchema),
  asyncHandler(authController.forgotPassword.bind(authController)),
);
router.post(
  '/reset-password',
  validate(resetPasswordSchema),
  asyncHandler(authController.resetPassword.bind(authController)),
);
router.get('/me', authenticate, asyncHandler(authController.me.bind(authController)));
router.put(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  asyncHandler(authController.changePassword.bind(authController)),
);

export default router;
