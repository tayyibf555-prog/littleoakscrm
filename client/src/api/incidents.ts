import api from './client';
import type { Incident } from '@/types/incident';

export interface CreateIncidentData {
  date: string;
  time: string;
  location: string;
  description: string;
  actionTaken: string;
  severity: string;
  childrenInvolved: string[];
  witnesses?: string;
}

export interface SignoffIncidentData {
  notes?: string;
}

export interface NotifyParentData {
  notifiedAt: string;
  notifiedBy: string;
  notificationMethod: string;
}

export const incidentsApi = {
  list: () =>
    api.get<Incident[]>('/incidents'),

  get: (id: string) =>
    api.get<Incident>(`/incidents/${id}`),

  create: (data: CreateIncidentData) =>
    api.post<Incident>('/incidents', data),

  signoff: (id: string, data: SignoffIncidentData) =>
    api.post<Incident>(`/incidents/${id}/signoff`, data),

  notifyParent: (id: string, data: NotifyParentData) =>
    api.put<Incident>(`/incidents/${id}/parent-notify`, data),
};
