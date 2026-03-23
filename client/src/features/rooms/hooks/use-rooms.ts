import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsApi } from '@/api/rooms';
import type { CreateRoomData } from '@/api/rooms';

export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: () => roomsApi.list().then((res) => res.data),
  });
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: ['rooms', id],
    queryFn: () => roomsApi.get(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoomData) =>
      roomsApi.create(data).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateRoomData> }) =>
      roomsApi.update(id, data).then((res) => res.data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['rooms'] });
      void queryClient.invalidateQueries({ queryKey: ['rooms', variables.id] });
    },
  });
}
