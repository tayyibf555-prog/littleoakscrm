import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '@/api/documents';
import type {
  ListDocumentsParams,
  CreateDocumentData,
  UpdateDocumentData,
} from '@/api/documents';

export function useDocuments(params?: ListDocumentsParams) {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => documentsApi.list(params).then((res) => res.data),
  });
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['documents', id],
    queryFn: () => documentsApi.get(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDocumentData) =>
      documentsApi.create(data).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDocumentData }) =>
      documentsApi.update(id, data).then((res) => res.data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
      void queryClient.invalidateQueries({ queryKey: ['documents', variables.id] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentsApi.delete(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });
}
