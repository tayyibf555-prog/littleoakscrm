import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';
import { startOfDay } from 'date-fns';

export class AttendanceService {
  // Children attendance
  async getChildrenAttendance(date?: string) {
    const targetDate = date ? startOfDay(new Date(date)) : startOfDay(new Date());

    const children = await prisma.child.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        roomId: true,
        room: { select: { name: true } },
        attendance: {
          where: { date: targetDate },
          take: 1,
        },
      },
      orderBy: [{ room: { name: 'asc' } }, { lastName: 'asc' }],
    });

    return children.map((child) => ({
      childId: child.id,
      childName: `${child.firstName} ${child.lastName}`,
      roomId: child.roomId,
      roomName: child.room?.name,
      attendance: child.attendance[0] || null,
    }));
  }

  async checkInChild(childId: string, time?: string, checkedInBy?: string) {
    const today = startOfDay(new Date());
    const checkInTime = time ? new Date(time) : new Date();

    return prisma.childAttendance.upsert({
      where: { childId_date: { childId, date: today } },
      create: {
        childId,
        date: today,
        checkInTime,
        checkedInBy,
        status: 'PRESENT',
      },
      update: {
        checkInTime,
        checkedInBy,
        status: 'PRESENT',
      },
    });
  }

  async checkOutChild(childId: string, time?: string, checkedOutBy?: string) {
    const today = startOfDay(new Date());
    const checkOutTime = time ? new Date(time) : new Date();

    const attendance = await prisma.childAttendance.findUnique({
      where: { childId_date: { childId, date: today } },
    });

    if (!attendance) {
      throw new AppError(400, 'Child has not been checked in today');
    }

    return prisma.childAttendance.update({
      where: { id: attendance.id },
      data: {
        checkOutTime,
        checkedOutBy,
      },
    });
  }

  async updateChildAttendance(
    attendanceId: string,
    data: { status?: string; absenceReason?: string; notes?: string },
  ) {
    return prisma.childAttendance.update({
      where: { id: attendanceId },
      data,
    });
  }

  async getChildAttendanceReport(startDate: string, endDate: string, childId?: string) {
    const where: Record<string, unknown> = {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };
    if (childId) where.childId = childId;

    return prisma.childAttendance.findMany({
      where,
      include: {
        child: { select: { firstName: true, lastName: true, room: { select: { name: true } } } },
      },
      orderBy: [{ date: 'asc' }, { child: { lastName: 'asc' } }],
    });
  }

  // Staff attendance
  async getStaffAttendance(date?: string) {
    const targetDate = date ? startOfDay(new Date(date)) : startOfDay(new Date());

    const staff = await prisma.staff.findMany({
      where: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        jobTitle: true,
        staffAttendance: {
          where: { date: targetDate },
          take: 1,
        },
      },
      orderBy: { lastName: 'asc' },
    });

    return staff.map((s) => ({
      staffId: s.id,
      staffName: `${s.firstName} ${s.lastName}`,
      jobTitle: s.jobTitle,
      attendance: s.staffAttendance[0] || null,
    }));
  }

  async checkInStaff(staffId: string, time?: string) {
    const today = startOfDay(new Date());
    const checkInTime = time ? new Date(time) : new Date();

    return prisma.staffAttendance.upsert({
      where: { staffId_date: { staffId, date: today } },
      create: {
        staffId,
        date: today,
        checkInTime,
        status: 'PRESENT',
      },
      update: {
        checkInTime,
        status: 'PRESENT',
      },
    });
  }

  async checkOutStaff(staffId: string, time?: string) {
    const today = startOfDay(new Date());
    const checkOutTime = time ? new Date(time) : new Date();

    const attendance = await prisma.staffAttendance.findUnique({
      where: { staffId_date: { staffId, date: today } },
    });

    if (!attendance) {
      throw new AppError(400, 'Staff member has not been checked in today');
    }

    return prisma.staffAttendance.update({
      where: { id: attendance.id },
      data: { checkOutTime },
    });
  }
}

export const attendanceService = new AttendanceService();
