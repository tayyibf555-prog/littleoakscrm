import { Router } from 'express';
import { attendanceController } from './attendance.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  checkInChildSchema,
  checkOutChildSchema,
  updateChildAttendanceSchema,
  checkInStaffSchema,
  checkOutStaffSchema,
} from './attendance.validators';
import { asyncHandler } from '../../utils/async-handler';

const router = Router();

router.use(authenticate);

// Children attendance
router.get(
  '/children',
  asyncHandler(attendanceController.getChildrenAttendance.bind(attendanceController)),
);
router.post(
  '/children/check-in',
  validate(checkInChildSchema),
  asyncHandler(attendanceController.checkInChild.bind(attendanceController)),
);
router.post(
  '/children/check-out',
  validate(checkOutChildSchema),
  asyncHandler(attendanceController.checkOutChild.bind(attendanceController)),
);
router.put(
  '/children/:id',
  validate(updateChildAttendanceSchema),
  asyncHandler(attendanceController.updateChildAttendance.bind(attendanceController)),
);
router.get(
  '/children/report',
  asyncHandler(attendanceController.getChildAttendanceReport.bind(attendanceController)),
);

// Staff attendance
router.get(
  '/staff',
  asyncHandler(attendanceController.getStaffAttendance.bind(attendanceController)),
);
router.post(
  '/staff/check-in',
  validate(checkInStaffSchema),
  asyncHandler(attendanceController.checkInStaff.bind(attendanceController)),
);
router.post(
  '/staff/check-out',
  validate(checkOutStaffSchema),
  asyncHandler(attendanceController.checkOutStaff.bind(attendanceController)),
);

export default router;
