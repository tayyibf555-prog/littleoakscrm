import { Router } from 'express';
import { invoicingController } from './invoicing.controller';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  createInvoiceSchema,
  recordPaymentSchema,
  createFeeScheduleSchema,
  updateFundedHoursSchema,
} from './invoicing.validators';
import { asyncHandler } from '../../utils/async-handler';

const router = Router();
router.use(authenticate);
router.use(authorize(['ADMIN', 'MANAGER']));

// Fee Schedules
router.get('/fee-schedules', asyncHandler(invoicingController.listFeeSchedules.bind(invoicingController)));
router.post(
  '/fee-schedules',
  validate(createFeeScheduleSchema),
  asyncHandler(invoicingController.createFeeSchedule.bind(invoicingController)),
);
router.put('/fee-schedules/:id', asyncHandler(invoicingController.updateFeeSchedule.bind(invoicingController)));

// Funded Hours
router.get('/funded-hours', asyncHandler(invoicingController.listFundedHours.bind(invoicingController)));
router.get('/funded-hours/:childId', asyncHandler(invoicingController.getFundedHours.bind(invoicingController)));
router.put(
  '/funded-hours/:childId',
  validate(updateFundedHoursSchema),
  asyncHandler(invoicingController.upsertFundedHours.bind(invoicingController)),
);

// Invoices
router.get('/invoices', asyncHandler(invoicingController.listInvoices.bind(invoicingController)));
router.post(
  '/invoices',
  validate(createInvoiceSchema),
  asyncHandler(invoicingController.createInvoice.bind(invoicingController)),
);
router.get('/invoices/:id', asyncHandler(invoicingController.getInvoice.bind(invoicingController)));
router.delete('/invoices/:id', asyncHandler(invoicingController.voidInvoice.bind(invoicingController)));
router.post('/invoices/:id/send', asyncHandler(invoicingController.sendInvoice.bind(invoicingController)));
router.post(
  '/invoices/:id/payments',
  validate(recordPaymentSchema),
  asyncHandler(invoicingController.recordPayment.bind(invoicingController)),
);

export default router;
