import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incidentsApi } from '@/api/incidents';
import type { CreateIncidentData, SignoffIncidentData, NotifyParentData } from '@/api/incidents';

export function useIncidents() {
  return useQuery({
    queryKey: ['incidents'],
    queryFn: () => incidentsApi.list().then((res) => res.data),
  });
}

export function useIncident(id: string) {
  return useQuery({
    queryKey: ['incidents', id],
    queryFn: () => incidentsApi.get(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIncidentData) =>
      incidentsApi.create(data).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['incidents'] });
    },
  });
}

export function useSignoffIncident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SignoffIncidentData }) =>
      incidentsApi.signoff(id, data).then((res) => res.data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['incidents'] });
      void queryClient.invalidateQueries({ queryKey: ['incidents', variables.id] });
    },
  });
}

export function useNotifyParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: NotifyParentData }) =>
      incidentsApi.notifyParent(id, data).then((res) => res.data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['incidents'] });
      void queryClient.invalidateQueries({ queryKey: ['incidents', variables.id] });
    },
  });
}
