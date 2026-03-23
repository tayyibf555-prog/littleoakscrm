import api from './client';
import type { Staff, StaffWithRelations, DbsCheck, Qualification, TrainingRecord, Shift } from '@/types/staff';

export interface CreateStaffData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle: string;
  department?: string;
  dateOfBirth?: string;
  startDate: string;
}

export interface UpdateStaffData extends Partial<CreateStaffData> {
  isActive?: boolean;
  endDate?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
}

export interface UpsertDbsData {
  dbsNumber: string;
  issueDate: string;
  expiryDate: string;
  dbsType: string;
  status: string;
  verifiedBy?: string;
}

export interface CreateQualificationData {
  name: string;
  level?: string;
  institution?: string;
  dateObtained?: string;
  expiryDate?: string;
}

export interface CreateTrainingData {
  courseName: string;
  provider?: string;
  completedDate: string;
  expiryDate?: string;
}

export interface CreateShiftData {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export const staffApi = {
  list: () => api.get<Staff[]>('/staff'),
  get: (id: string) => api.get<StaffWithRelations>(`/staff/${id}`),
  create: (data: CreateStaffData) => api.post<Staff>('/staff', data),
  update: (id: string, data: UpdateStaffData) => api.put<Staff>(`/staff/${id}`, data),

  getDbs: (staffId: string) => api.get<DbsCheck>(`/staff/${staffId}/dbs`),
  upsertDbs: (staffId: string, data: UpsertDbsData) => api.put<DbsCheck>(`/staff/${staffId}/dbs`, data),

  getQualifications: (staffId: string) => api.get<Qualification[]>(`/staff/${staffId}/qualifications`),
  createQualification: (staffId: string, data: CreateQualificationData) => api.post<Qualification>(`/staff/${staffId}/qualifications`, data),
  deleteQualification: (staffId: string, qualId: string) => api.delete(`/staff/${staffId}/qualifications/${qualId}`),

  getTraining: (staffId: string) => api.get<TrainingRecord[]>(`/staff/${staffId}/training`),
  createTraining: (staffId: string, data: CreateTrainingData) => api.post<TrainingRecord>(`/staff/${staffId}/training`, data),
  deleteTraining: (staffId: string, trainingId: string) => api.delete(`/staff/${staffId}/training/${trainingId}`),

  getShifts: (staffId: string) => api.get<Shift[]>(`/staff/${staffId}/shifts`),
  createShift: (staffId: string, data: CreateShiftData) => api.post<Shift>(`/staff/${staffId}/shifts`, data),
  deleteShift: (staffId: string, shiftId: string) => api.delete(`/staff/${staffId}/shifts/${shiftId}`),
};
