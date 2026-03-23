import api from './client';
import type { Announcement, Task, TaskStatus } from '@/types/communications';

export interface CreateAnnouncementData {
  title: string;
  content: string;
  priority: string;
  isPinned: boolean;
  expiresAt?: string;
}

export interface UpdateAnnouncementData extends Partial<CreateAnnouncementData> {}

export interface CreateTaskData {
  title: string;
  description?: string;
  assigneeId: string;
  dueDate?: string;
  priority: string;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {}

export interface TaskListParams {
  assigneeId?: string;
  status?: string;
}

export const communicationsApi = {
  // Announcements
  listAnnouncements: () =>
    api.get<Announcement[]>('/communications/announcements'),

  createAnnouncement: (data: CreateAnnouncementData) =>
    api.post<Announcement>('/communications/announcements', data),

  updateAnnouncement: (id: string, data: UpdateAnnouncementData) =>
    api.put<Announcement>(`/communications/announcements/${id}`, data),

  deleteAnnouncement: (id: string) =>
    api.delete(`/communications/announcements/${id}`),

  // Tasks
  listTasks: (params?: TaskListParams) =>
    api.get<Task[]>('/communications/tasks', { params }),

  createTask: (data: CreateTaskData) =>
    api.post<Task>('/communications/tasks', data),

  updateTask: (id: string, data: UpdateTaskData) =>
    api.put<Task>(`/communications/tasks/${id}`, data),

  updateTaskStatus: (id: string, status: TaskStatus) =>
    api.put<Task>(`/communications/tasks/${id}/status`, { status }),

  deleteTask: (id: string) =>
    api.delete(`/communications/tasks/${id}`),
};
