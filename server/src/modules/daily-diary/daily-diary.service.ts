import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';
import { DiaryEntryType } from '@prisma/client';
import { startOfDay, endOfDay } from 'date-fns';

export class DailyDiaryService {
  async list(filters: { date?: string; childId?: string; entryType?: string }) {
    const where: Record<string, unknown> = {};

    if (filters.date) {
      const targetDate = new Date(filters.date);
      where.date = startOfDay(targetDate);
    } else {
      where.date = startOfDay(new Date());
    }

    if (filters.childId) where.childId = filters.childId;
    if (filters.entryType) where.entryType = filters.entryType as DiaryEntryType;

    return prisma.diaryEntry.findMany({
      where,
      include: {
        child: { select: { firstName: true, lastName: true, room: { select: { name: true } } } },
        author: {
          select: {
            staffProfile: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { time: 'desc' },
    });
  }

  async getById(id: string) {
    const entry = await prisma.diaryEntry.findUnique({
      where: { id },
      include: {
        child: { select: { firstName: true, lastName: true } },
        author: {
          select: {
            staffProfile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!entry) {
      throw new AppError(404, 'Diary entry not found');
    }

    return entry;
  }

  async getByChild(childId: string, startDate?: string, endDate?: string) {
    const where: Record<string, unknown> = { childId };

    if (startDate && endDate) {
      where.date = {
        gte: startOfDay(new Date(startDate)),
        lte: endOfDay(new Date(endDate)),
      };
    }

    return prisma.diaryEntry.findMany({
      where,
      include: {
        author: {
          select: {
            staffProfile: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: [{ date: 'desc' }, { time: 'desc' }],
    });
  }

  async create(authorId: string, data: {
    childId: string;
    date: string;
    time: string;
    entryType: DiaryEntryType;
    content: object;
    photoUrls?: string[];
    isPrivate?: boolean;
  }) {
    return prisma.diaryEntry.create({
      data: {
        childId: data.childId,
        authorId,
        date: startOfDay(new Date(data.date)),
        time: new Date(data.time),
        entryType: data.entryType,
        content: data.content as any,
        photoUrls: data.photoUrls || [],
        isPrivate: data.isPrivate ?? false,
      },
      include: {
        child: { select: { firstName: true, lastName: true } },
        author: {
          select: {
            staffProfile: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });
  }

  async update(id: string, data: Record<string, unknown>) {
    const entry = await prisma.diaryEntry.findUnique({ where: { id } });
    if (!entry) {
      throw new AppError(404, 'Diary entry not found');
    }

    return prisma.diaryEntry.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const entry = await prisma.diaryEntry.findUnique({ where: { id } });
    if (!entry) {
      throw new AppError(404, 'Diary entry not found');
    }

    return prisma.diaryEntry.delete({ where: { id } });
  }
}

export const dailyDiaryService = new DailyDiaryService();
