import api from './client';
import type { CalendarEvent } from '@/types/calendar';

export interface CreateEventData {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  allDay: boolean;
  eventType: string;
  isRecurring: boolean;
  recurrenceRule?: string;
  color?: string;
}

export interface UpdateEventData extends Partial<CreateEventData> {}

export const calendarApi = {
  list: (startDate: string, endDate: string) =>
    api.get<CalendarEvent[]>('/calendar', { params: { startDate, endDate } }),

  get: (id: string) =>
    api.get<CalendarEvent>(`/calendar/${id}`),

  create: (data: CreateEventData) =>
    api.post<CalendarEvent>('/calendar', data),

  update: (id: string, data: UpdateEventData) =>
    api.put<CalendarEvent>(`/calendar/${id}`, data),

  delete: (id: string) =>
    api.delete(`/calendar/${id}`),
};
