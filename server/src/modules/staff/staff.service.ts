import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';
import { UserRole } from '@prisma/client';

export class StaffService {
  async list() {
    return prisma.staff.findMany({
      include: {
        user: { select: { email: true, role: true, isActive: true } },
        dbsCheck: { select: { status: true, expiryDate: true, checkType: true } },
      },
      orderBy: { lastName: 'asc' },
    });
  }

  async getById(id: string) {
    const staff = await prisma.staff.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, email: true, role: true, isActive: true } },
        dbsCheck: true,
        qualifications: { orderBy: { dateObtained: 'desc' } },
        trainingRecords: { orderBy: { completedDate: 'desc' } },
        shifts: { orderBy: { date: 'desc' }, take: 30 },
      },
    });

    if (!staff) {
      throw new AppError(404, 'Staff member not found');
    }

    return staff;
  }

  async create(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    startDate: string;
    jobTitle: string;
    qualificationLevel?: number;
    role?: string;
  }) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new AppError(409, 'Email already in use');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const staff = await prisma.staff.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        address: data.address,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        startDate: new Date(data.startDate),
        jobTitle: data.jobTitle,
        qualificationLevel: data.qualificationLevel,
        user: {
          create: {
            email: data.email,
            passwordHash,
            role: (data.role as UserRole) || UserRole.STAFF,
          },
        },
      },
      include: {
        user: { select: { id: true, email: true, role: true } },
      },
    });

    return staff;
  }

  async update(id: string, data: Record<string, unknown>) {
    const staff = await prisma.staff.findUnique({ where: { id } });
    if (!staff) {
      throw new AppError(404, 'Staff member not found');
    }

    const updateData: Record<string, unknown> = { ...data };
    if (data.dateOfBirth) {
      updateData.dateOfBirth = new Date(data.dateOfBirth as string);
    }

    return prisma.staff.update({
      where: { id },
      data: updateData,
      include: {
        user: { select: { email: true, role: true } },
      },
    });
  }

  // DBS
  async getDbs(staffId: string) {
    return prisma.dbsCheck.findUnique({ where: { staffId } });
  }

  async upsertDbs(staffId: string, data: {
    dbsNumber: string;
    issueDate: string;
    expiryDate?: string;
    checkType: string;
    status: string;
    onUpdateService?: boolean;
    lastCheckedDate?: string;
  }) {
    return prisma.dbsCheck.upsert({
      where: { staffId },
      create: {
        staffId,
        dbsNumber: data.dbsNumber,
        issueDate: new Date(data.issueDate),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        checkType: data.checkType,
        status: data.status,
        onUpdateService: data.onUpdateService ?? false,
        lastCheckedDate: data.lastCheckedDate ? new Date(data.lastCheckedDate) : undefined,
      },
      update: {
        dbsNumber: data.dbsNumber,
        issueDate: new Date(data.issueDate),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        checkType: data.checkType,
        status: data.status,
        onUpdateService: data.onUpdateService,
        lastCheckedDate: data.lastCheckedDate ? new Date(data.lastCheckedDate) : undefined,
      },
    });
  }

  // Qualifications
  async getQualifications(staffId: string) {
    return prisma.qualification.findMany({
      where: { staffId },
      orderBy: { dateObtained: 'desc' },
    });
  }

  async createQualification(staffId: string, data: {
    name: string;
    level?: number;
    issuedBy?: string;
    dateObtained?: string;
    expiryDate?: string;
  }) {
    return prisma.qualification.create({
      data: {
        staffId,
        name: data.name,
        level: data.level,
        issuedBy: data.issuedBy,
        dateObtained: data.dateObtained ? new Date(data.dateObtained) : undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      },
    });
  }

  async deleteQualification(staffId: string, qualificationId: string) {
    const qual = await prisma.qualification.findFirst({
      where: { id: qualificationId, staffId },
    });
    if (!qual) {
      throw new AppError(404, 'Qualification not found');
    }
    return prisma.qualification.delete({ where: { id: qualificationId } });
  }

  // Training
  async getTraining(staffId: string) {
    return prisma.trainingRecord.findMany({
      where: { staffId },
      orderBy: { completedDate: 'desc' },
    });
  }

  async createTraining(staffId: string, data: {
    title: string;
    provider?: string;
    completedDate: string;
    expiryDate?: string;
    notes?: string;
  }) {
    return prisma.trainingRecord.create({
      data: {
        staffId,
        title: data.title,
        provider: data.provider,
        completedDate: new Date(data.completedDate),
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        notes: data.notes,
      },
    });
  }

  async deleteTraining(staffId: string, trainingId: string) {
    const record = await prisma.trainingRecord.findFirst({
      where: { id: trainingId, staffId },
    });
    if (!record) {
      throw new AppError(404, 'Training record not found');
    }
    return prisma.trainingRecord.delete({ where: { id: trainingId } });
  }

  // Shifts
  async getShifts(staffId: string, startDate?: string, endDate?: string) {
    const where: Record<string, unknown> = { staffId };
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    return prisma.shift.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  }

  async createShift(staffId: string, data: {
    date: string;
    startTime: string;
    endTime: string;
    breakMinutes?: number;
    shiftType?: string;
    notes?: string;
  }) {
    return prisma.shift.create({
      data: {
        staffId,
        date: new Date(data.date),
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        breakMinutes: data.breakMinutes ?? 0,
        shiftType: data.shiftType ?? 'REGULAR',
        notes: data.notes,
      },
    });
  }

  async deleteShift(staffId: string, shiftId: string) {
    const shift = await prisma.shift.findFirst({
      where: { id: shiftId, staffId },
    });
    if (!shift) {
      throw new AppError(404, 'Shift not found');
    }
    return prisma.shift.delete({ where: { id: shiftId } });
  }
}

export const staffService = new StaffService();
