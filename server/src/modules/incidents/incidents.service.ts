import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';

export class IncidentsService {
  async list(filters?: { status?: string; incidentType?: string; startDate?: string; endDate?: string }) {
    const where: Record<string, unknown> = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.incidentType) where.incidentType = filters.incidentType;
    if (filters?.startDate && filters?.endDate) {
      where.date = {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      };
    }

    return prisma.incident.findMany({
      where,
      include: {
        reportedBy: {
          select: { staffProfile: { select: { firstName: true, lastName: true } } },
        },
        children: {
          include: {
            child: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async getById(id: string) {
    const incident = await prisma.incident.findUnique({
      where: { id },
      include: {
        reportedBy: {
          select: { staffProfile: { select: { firstName: true, lastName: true } } },
        },
        signedOffBy: {
          select: { staffProfile: { select: { firstName: true, lastName: true } } },
        },
        children: {
          include: {
            child: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    if (!incident) {
      throw new AppError(404, 'Incident not found');
    }

    return incident;
  }

  async create(reportedById: string, data: {
    date: string;
    time: string;
    location: string;
    incidentType: string;
    severity: string;
    description: string;
    actionTaken: string;
    witnessNames?: string;
    photoUrls?: string[];
    childrenIds: string[];
  }) {
    return prisma.incident.create({
      data: {
        reportedById,
        date: new Date(data.date),
        time: new Date(data.time),
        location: data.location,
        incidentType: data.incidentType,
        severity: data.severity,
        description: data.description,
        actionTaken: data.actionTaken,
        witnessNames: data.witnessNames,
        photoUrls: data.photoUrls || [],
        children: {
          create: data.childrenIds.map((childId) => ({ childId })),
        },
      },
      include: {
        children: {
          include: { child: { select: { firstName: true, lastName: true } } },
        },
      },
    });
  }

  async signoff(id: string, signedOffById: string, signoffNotes?: string) {
    const incident = await prisma.incident.findUnique({ where: { id } });
    if (!incident) {
      throw new AppError(404, 'Incident not found');
    }

    if (incident.status === 'SIGNED_OFF' || incident.status === 'CLOSED') {
      throw new AppError(400, 'Incident has already been signed off');
    }

    return prisma.incident.update({
      where: { id },
      data: {
        signedOffById,
        signedOffAt: new Date(),
        signoffNotes,
        status: 'SIGNED_OFF',
      },
    });
  }

  async notifyParent(id: string, parentNotifiedBy: string) {
    return prisma.incident.update({
      where: { id },
      data: {
        parentNotified: true,
        parentNotifiedAt: new Date(),
        parentNotifiedBy,
      },
    });
  }
}

export const incidentsService = new IncidentsService();
