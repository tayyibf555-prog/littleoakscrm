import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { diaryApi } from '@/api/diary';
import type {
  CreateDiaryEntryData,
  UpdateDiaryEntryData,
  ListDiaryParams,
} from '@/api/diary';
import type { DiaryEntryType } from '@/types/diary';

export function useDiaryEntries(date?: string, childId?: string, entryType?: DiaryEntryType) {
  const params: ListDiaryParams = {};
  if (date) params.date = date;
  if (childId) params.childId = childId;
  if (entryType) params.entryType = entryType;

  return useQuery({
    queryKey: ['diary', params],
    queryFn: () => diaryApi.list(params).then((res) => res.data),
  });
}

export function useDiaryEntry(id: string) {
  return useQuery({
    queryKey: ['diary', id],
    queryFn: () => diaryApi.get(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreateDiaryEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDiaryEntryData) =>
      diaryApi.create(data).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['diary'] });
    },
  });
}

export function useUpdateDiaryEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDiaryEntryData }) =>
      diaryApi.update(id, data).then((res) => res.data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['diary'] });
      void queryClient.invalidateQueries({ queryKey: ['diary', variables.id] });
    },
  });
}

export function useDeleteDiaryEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => diaryApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['diary'] });
    },
  });
}
