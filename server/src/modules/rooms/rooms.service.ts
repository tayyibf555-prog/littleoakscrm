import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';
import { startOfDay } from 'date-fns';

export class RoomsService {
  async list() {
    const today = startOfDay(new Date());
    return prisma.room.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { children: { where: { status: 'ACTIVE' } } } },
        staffAssignments: {
          where: { date: today },
          include: { staff: { select: { firstName: true, lastName: true } } },
        },
      },
      orderBy: { ageGroupMin: 'asc' },
    });
  }

  async getById(id: string) {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        children: {
          where: { status: 'ACTIVE' },
          select: { id: true, firstName: true, lastName: true, dateOfBirth: true },
          orderBy: { lastName: 'asc' },
        },
        staffAssignments: {
          where: { date: startOfDay(new Date()) },
          include: { staff: { select: { id: true, firstName: true, lastName: true, jobTitle: true } } },
        },
      },
    });

    if (!room) throw new AppError(404, 'Room not found');
    return room;
  }

  async create(data: { name: string; ageGroupMin: number; ageGroupMax: number; capacity: number; ratioRequired: string }) {
    return prisma.room.create({ data });
  }

  async update(id: string, data: Record<string, unknown>) {
    const room = await prisma.room.findUnique({ where: { id } });
    if (!room) throw new AppError(404, 'Room not found');
    return prisma.room.update({ where: { id }, data });
  }
}

export const roomsService = new RoomsService();
