import api from './client';
import type { DiaryEntry, DiaryEntryType } from '@/types/diary';

export interface ListDiaryParams {
  date?: string;
  childId?: string;
  entryType?: DiaryEntryType;
}

export interface CreateDiaryEntryData {
  childId: string;
  date: string;
  time: string;
  entryType: DiaryEntryType;
  content: Record<string, unknown>;
  photoUrls?: string[];
  isPrivate?: boolean;
}

export interface UpdateDiaryEntryData {
  date?: string;
  time?: string;
  entryType?: DiaryEntryType;
  content?: Record<string, unknown>;
  photoUrls?: string[];
  isPrivate?: boolean;
}

export interface ChildDiaryParams {
  startDate?: string;
  endDate?: string;
}

export const diaryApi = {
  list: (params?: ListDiaryParams) =>
    api.get<DiaryEntry[]>('/diary', { params }),

  get: (id: string) =>
    api.get<DiaryEntry>(`/diary/${id}`),

  create: (data: CreateDiaryEntryData) =>
    api.post<DiaryEntry>('/diary', data),

  update: (id: string, data: UpdateDiaryEntryData) =>
    api.put<DiaryEntry>(`/diary/${id}`, data),

  delete: (id: string) =>
    api.delete(`/diary/${id}`),

  getChildEntries: (childId: string, params?: ChildDiaryParams) =>
    api.get<DiaryEntry[]>(`/diary/child/${childId}`, { params }),
};
