import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { communicationsApi } from '@/api/communications';
import type {
  CreateAnnouncementData,
  UpdateAnnouncementData,
  CreateTaskData,
  UpdateTaskData,
} from '@/api/communications';
import type { TaskStatus } from '@/types/communications';

// --- Announcements ---

export function useAnnouncements() {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: () => communicationsApi.listAnnouncements().then((res) => res.data),
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAnnouncementData) =>
      communicationsApi.createAnnouncement(data).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAnnouncementData }) =>
      communicationsApi.updateAnnouncement(id, data).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => communicationsApi.deleteAnnouncement(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });
}

// --- Tasks ---

export function useTasks(assigneeId?: string, status?: string) {
  return useQuery({
    queryKey: ['tasks', { assigneeId, status }],
    queryFn: () =>
      communicationsApi
        .listTasks({
          ...(assigneeId ? { assigneeId } : {}),
          ...(status ? { status } : {}),
        })
        .then((res) => res.data),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskData) =>
      communicationsApi.createTask(data).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskData }) =>
      communicationsApi.updateTask(id, data).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      communicationsApi.updateTaskStatus(id, status).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => communicationsApi.deleteTask(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
