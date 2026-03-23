import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarApi } from '@/api/calendar';
import type { CreateEventData, UpdateEventData } from '@/api/calendar';

export function useCalendarEvents(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['calendar-events', startDate, endDate],
    queryFn: () => calendarApi.list(startDate, endDate).then((res) => res.data),
    enabled: !!startDate && !!endDate,
  });
}

export function useCalendarEvent(id: string) {
  return useQuery({
    queryKey: ['calendar-events', id],
    queryFn: () => calendarApi.get(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEventData) =>
      calendarApi.create(data).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventData }) =>
      calendarApi.update(id, data).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => calendarApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
}
