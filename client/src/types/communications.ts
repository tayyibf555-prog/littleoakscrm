export type AnnouncementPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Announcement {
  id: string;
  authorId: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  isPinned: boolean;
  publishedAt: string;
  expiresAt: string | null;
  author?: {
    staffProfile?: { firstName: string; lastName: string } | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  assigneeId: string;
  createdById: string;
  dueDate: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  completedAt: string | null;
  assignee?: {
    staffProfile?: { firstName: string; lastName: string } | null;
  };
  createdBy?: {
    staffProfile?: { firstName: string; lastName: string } | null;
  };
  createdAt: string;
  updatedAt: string;
}
