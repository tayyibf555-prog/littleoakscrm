import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { childrenApi } from '@/api/children';
import type { ListChildrenParams, CreateChildData, UpdateChildData, UpdateMedicalData, CreateContactData, UpdateContactData, UpdateConsentData } from '@/api/children';

export function useChildren(params?: ListChildrenParams) {
  return useQuery({
    queryKey: ['children', params],
    queryFn: () => childrenApi.list(params).then((res) => res.data),
  });
}

export function useChild(id: string) {
  return useQuery({
    queryKey: ['children', id],
    queryFn: () => childrenApi.get(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreateChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateChildData) =>
      childrenApi.create(data).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['children'] });
    },
  });
}

export function useUpdateChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateChildData }) =>
      childrenApi.update(id, data).then((res) => res.data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['children'] });
      void queryClient.invalidateQueries({ queryKey: ['children', variables.id] });
    },
  });
}

export function useUpdateMedical() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ childId, data }: { childId: string; data: UpdateMedicalData }) =>
      childrenApi.updateMedical(childId, data).then((res) => res.data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['children', variables.childId] });
    },
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ childId, data }: { childId: string; data: CreateContactData }) =>
      childrenApi.createContact(childId, data).then((res) => res.data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['children', variables.childId] });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ childId, contactId, data }: { childId: string; contactId: string; data: UpdateContactData }) =>
      childrenApi.updateContact(childId, contactId, data).then((res) => res.data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['children', variables.childId] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ childId, contactId }: { childId: string; contactId: string }) =>
      childrenApi.deleteContact(childId, contactId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['children', variables.childId] });
    },
  });
}

export function useUpdateConsents() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ childId, data }: { childId: string; data: UpdateConsentData[] }) =>
      childrenApi.updateConsents(childId, data).then((res) => res.data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['children', variables.childId] });
    },
  });
}
