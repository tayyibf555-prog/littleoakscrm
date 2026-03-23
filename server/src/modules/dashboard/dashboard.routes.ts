import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { asyncHandler } from '../../utils/async-handler';
import { prisma } from '../../config/database';
import { startOfDay, addDays, subDays } from 'date-fns';

const router = Router();
router.use(authenticate);

router.get(
  '/overview',
  asyncHandler(async (_req, res) => {
    const today = startOfDay(new Date());
    const sevenDaysFromNow = addDays(today, 7);
    const thirtyDaysAgo = subDays(today, 30);

    const [
      activeChildren,
      activeStaff,
      todayChildAttendance,
      todayStaffAttendance,
      openIncidents,
      upcomingEvents,
      recentIncidents,
      overdueInvoices,
      rooms,
      expiringDbs,
    ] = await Promise.all([
      prisma.child.count({ where: { status: 'ACTIVE' } }),
      prisma.staff.count({ where: { isActive: true } }),
      prisma.childAttendance.count({ where: { date: today, status: 'PRESENT' } }),
      prisma.staffAttendance.count({ where: { date: today, status: 'PRESENT' } }),
      prisma.incident.count({ where: { status: 'OPEN' } }),
      prisma.calendarEvent.findMany({
        where: { startDate: { gte: today, lte: sevenDaysFromNow } },
        orderBy: { startDate: 'asc' },
        take: 5,
      }),
      prisma.incident.findMany({
        where: { date: { gte: thirtyDaysAgo } },
        include: {
          children: { include: { child: { select: { firstName: true, lastName: true } } } },
        },
        orderBy: { date: 'desc' },
        take: 5,
      }),
      prisma.invoice.findMany({
        where: { status: { in: ['SENT', 'OVERDUE'] }, dueDate: { lt: today } },
        include: { parent: { select: { firstName: true, lastName: true } } },
        orderBy: { dueDate: 'asc' },
        take: 5,
      }),
      prisma.room.findMany({
        where: { isActive: true },
        include: {
          _count: { select: { children: { where: { status: 'ACTIVE' } } } },
          staffAssignments: { where: { date: today } },
        },
      }),
      prisma.dbsCheck.findMany({
        where: {
          expiryDate: { lte: addDays(today, 30) },
          staff: { isActive: true },
        },
        include: { staff: { select: { firstName: true, lastName: true } } },
      }),
    ]);

    const roomOverview = rooms.map((room) => ({
      id: room.id,
      name: room.name,
      capacity: room.capacity,
      childCount: room._count.children,
      staffCount: room.staffAssignments.length,
      ratioRequired: room.ratioRequired,
    }));

    res.json({
      stats: {
        activeChildren,
        activeStaff,
        childrenPresentToday: todayChildAttendance,
        staffPresentToday: todayStaffAttendance,
        openIncidents,
      },
      rooms: roomOverview,
      upcomingEvents,
      recentIncidents,
      overdueInvoices,
      expiringDbs,
    });
  }),
);

export default router;
