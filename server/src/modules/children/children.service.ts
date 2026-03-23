import { prisma } from '../../config/database';
import { AppError } from '../../middleware/error-handler';
import { ConsentType } from '@prisma/client';

export class ChildrenService {
  async list(filters?: { status?: string; roomId?: string; search?: string }) {
    const where: Record<string, unknown> = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.roomId) where.roomId = filters.roomId;
    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.child.findMany({
      where,
      include: {
        room: { select: { id: true, name: true } },
      },
      orderBy: { lastName: 'asc' },
    });
  }

  async getById(id: string) {
    const child = await prisma.child.findUnique({
      where: { id },
      include: {
        room: { select: { id: true, name: true } },
        medicalInfo: true,
        consents: true,
        emergencyContacts: { orderBy: { priority: 'asc' } },
        parentLinks: {
          include: {
            parent: true,
          },
        },
        socialMediaConsent: true,
        fundedHours: true,
      },
    });

    if (!child) throw new AppError(404, 'Child not found');
    return child;
  }

  async create(data: {
    firstName: string;
    lastName: string;
    preferredName?: string;
    dateOfBirth: string;
    gender?: string;
    roomId?: string;
    enrollmentDate: string;
    ethnicity?: string;
    religion?: string;
    homeLanguage?: string;
    isEAL?: boolean;
  }) {
    return prisma.child.create({
      data: {
        ...data,
        dateOfBirth: new Date(data.dateOfBirth),
        enrollmentDate: new Date(data.enrollmentDate),
      },
      include: { room: { select: { name: true } } },
    });
  }

  async update(id: string, data: Record<string, unknown>) {
    const child = await prisma.child.findUnique({ where: { id } });
    if (!child) throw new AppError(404, 'Child not found');

    const updateData = { ...data };
    if (updateData.dateOfBirth) updateData.dateOfBirth = new Date(updateData.dateOfBirth as string);
    if (updateData.enrollmentDate) updateData.enrollmentDate = new Date(updateData.enrollmentDate as string);
    if (updateData.leavingDate) updateData.leavingDate = new Date(updateData.leavingDate as string);

    return prisma.child.update({
      where: { id },
      data: updateData,
      include: { room: { select: { name: true } } },
    });
  }

  // Medical Info
  async getMedical(childId: string) {
    return prisma.medicalInfo.findUnique({ where: { childId } });
  }

  async updateMedical(childId: string, data: Record<string, unknown>) {
    return prisma.medicalInfo.upsert({
      where: { childId },
      create: { childId, ...data },
      update: data,
    });
  }

  // Emergency Contacts
  async getContacts(childId: string) {
    return prisma.emergencyContact.findMany({
      where: { childId },
      orderBy: { priority: 'asc' },
    });
  }

  async createContact(childId: string, data: {
    name: string;
    relationship: string;
    phone: string;
    phoneSecondary?: string;
    email?: string;
    isAuthorisedPickup?: boolean;
    priority: number;
  }) {
    return prisma.emergencyContact.create({
      data: { childId, ...data },
    });
  }

  async updateContact(childId: string, contactId: string, data: Record<string, unknown>) {
    const contact = await prisma.emergencyContact.findFirst({ where: { id: contactId, childId } });
    if (!contact) throw new AppError(404, 'Emergency contact not found');
    return prisma.emergencyContact.update({ where: { id: contactId }, data });
  }

  async deleteContact(childId: string, contactId: string) {
    const contact = await prisma.emergencyContact.findFirst({ where: { id: contactId, childId } });
    if (!contact) throw new AppError(404, 'Emergency contact not found');
    return prisma.emergencyContact.delete({ where: { id: contactId } });
  }

  // Consents
  async getConsents(childId: string) {
    return prisma.consent.findMany({ where: { childId } });
  }

  async updateConsents(childId: string, consents: Array<{ consentType: ConsentType; granted: boolean; grantedBy: string }>) {
    const results = [];
    for (const consent of consents) {
      const result = await prisma.consent.upsert({
        where: { childId_consentType: { childId, consentType: consent.consentType } },
        create: {
          childId,
          consentType: consent.consentType,
          granted: consent.granted,
          grantedBy: consent.grantedBy,
          grantedDate: new Date(),
        },
        update: {
          granted: consent.granted,
          grantedBy: consent.grantedBy,
          grantedDate: new Date(),
        },
      });
      results.push(result);
    }
    return results;
  }
}

export const childrenService = new ChildrenService();
