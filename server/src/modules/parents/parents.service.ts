import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';

export class ParentsService {
  async list() {
    return prisma.parent.findMany({
      include: { _count: { select: { children: true } } },
      orderBy: { lastName: 'asc' },
    });
  }

  async getById(id: string) {
    const parent = await prisma.parent.findUnique({
      where: { id },
      include: {
        children: {
          include: { child: { select: { id: true, firstName: true, lastName: true, status: true } } },
        },
      },
    });
    if (!parent) throw new AppError(404, 'Parent not found');
    return parent;
  }

  async create(data: {
    firstName: string;
    lastName: string;
    phone: string;
    relationship: string;
    email?: string;
    phoneSecondary?: string;
    address?: string;
    isMainContact?: boolean;
  }) {
    return prisma.parent.create({ data });
  }

  async update(id: string, data: Record<string, unknown>) {
    const parent = await prisma.parent.findUnique({ where: { id } });
    if (!parent) throw new AppError(404, 'Parent not found');
    return prisma.parent.update({ where: { id }, data });
  }

  async linkToChild(parentId: string, data: {
    childId: string;
    relationship: string;
    isPrimaryContact?: boolean;
    livesWithChild?: boolean;
    hasParentalResponsibility?: boolean;
  }) {
    return prisma.childParent.create({
      data: {
        parentId,
        childId: data.childId,
        relationship: data.relationship,
        isPrimaryContact: data.isPrimaryContact ?? false,
        livesWithChild: data.livesWithChild ?? true,
        hasParentalResponsibility: data.hasParentalResponsibility ?? true,
      },
    });
  }
}

export const parentsService = new ParentsService();
