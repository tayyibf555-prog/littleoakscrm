import api from './client';
import type { Child, ChildWithRelations, MedicalInfo, EmergencyContact, Consent } from '@/types/child';

export interface ListChildrenParams {
  search?: string;
  status?: string;
  roomId?: string;
}

export interface CreateChildData {
  firstName: string;
  lastName: string;
  preferredName?: string;
  dateOfBirth: string;
  gender: string;
  roomId?: string;
  enrollmentDate: string;
}

export interface UpdateChildData extends Partial<CreateChildData> {
  status?: string;
  leaveDate?: string;
}

export interface UpdateMedicalData {
  allergies?: string;
  dietaryNeeds?: string;
  medicalConditions?: string;
  gpName?: string;
  gpPhone?: string;
  gpAddress?: string;
  healthNotes?: string;
}

export interface CreateContactData {
  firstName: string;
  lastName: string;
  relationship: string;
  phone: string;
  email?: string;
  priority: number;
  authorisedPickup: boolean;
}

export interface UpdateContactData extends Partial<CreateContactData> {}

export interface UpdateConsentData {
  type: string;
  granted: boolean;
  grantedBy?: string;
}

export const childrenApi = {
  list: (params?: ListChildrenParams) =>
    api.get<Child[]>('/children', { params }),

  get: (id: string) =>
    api.get<ChildWithRelations>(`/children/${id}`),

  create: (data: CreateChildData) =>
    api.post<Child>('/children', data),

  update: (id: string, data: UpdateChildData) =>
    api.patch<Child>(`/children/${id}`, data),

  getMedical: (childId: string) =>
    api.get<MedicalInfo>(`/children/${childId}/medical`),

  updateMedical: (childId: string, data: UpdateMedicalData) =>
    api.put<MedicalInfo>(`/children/${childId}/medical`, data),

  getContacts: (childId: string) =>
    api.get<EmergencyContact[]>(`/children/${childId}/contacts`),

  createContact: (childId: string, data: CreateContactData) =>
    api.post<EmergencyContact>(`/children/${childId}/contacts`, data),

  updateContact: (childId: string, contactId: string, data: UpdateContactData) =>
    api.patch<EmergencyContact>(`/children/${childId}/contacts/${contactId}`, data),

  deleteContact: (childId: string, contactId: string) =>
    api.delete(`/children/${childId}/contacts/${contactId}`),

  getConsents: (childId: string) =>
    api.get<Consent[]>(`/children/${childId}/consents`),

  updateConsents: (childId: string, data: UpdateConsentData[]) =>
    api.put<Consent[]>(`/children/${childId}/consents`, data),
};
