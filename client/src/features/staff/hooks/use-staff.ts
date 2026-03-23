import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffApi } from '@/api/staff';
import type {
  CreateStaffData,
  UpdateStaffData,
  UpsertDbsData,
  CreateQualificationData,
  CreateTrainingData,
  CreateShiftData,
} from '@/api/staff';

export function useStaff() {
  return useQuery({
    queryKey: ['staff'],
    queryFn: () => staffApi.list().then((res) => res.data),
  });
}

export function useStaffMember(id: string) {
  return useQuery({
    queryKey: ['staff', id],
    queryFn: () => staffApi.get(id).then((res) => res.data),
    enabled: !!id,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStaffData) =>
      staffApi.create(data).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStaffData }) =>
      staffApi.update(id, data).then((res) => res.data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['staff'] });
      void queryClient.invalidateQueries({ queryKey: ['staff', variables.id] });
    },
  });
}

export function useUpsertDbs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ staffId, data }: { staffId: string; data: UpsertDbsData }) =>
      staffApi.upsertDbs(staffId, data).then((res) => res.data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['staff', variables.staffId] });
    },
  });
}

export function useCreateQualification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ staffId, data }: { staffId: string; data: CreateQualificationData }) =>
      staffApi.createQualification(staffId, data).then((res) => res.data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['staff', variables.staffId] });
    },
  });
}

export function useDeleteQualification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ staffId, qualId }: { staffId: string; qualId: string }) =>
      staffApi.deleteQualification(staffId, qualId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['staff', variables.staffId] });
    },
  });
}

export function useCreateTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ staffId, data }: { staffId: string; data: CreateTrainingData }) =>
      staffApi.createTraining(staffId, data).then((res) => res.data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['staff', variables.staffId] });
    },
  });
}

export function useDeleteTraining() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ staffId, trainingId }: { staffId: string; trainingId: string }) =>
      staffApi.deleteTraining(staffId, trainingId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['staff', variables.staffId] });
    },
  });
}

export function useCreateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ staffId, data }: { staffId: string; data: CreateShiftData }) =>
      staffApi.createShift(staffId, data).then((res) => res.data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['staff', variables.staffId] });
    },
  });
}

export function useDeleteShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ staffId, shiftId }: { staffId: string; shiftId: string }) =>
      staffApi.deleteShift(staffId, shiftId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['staff', variables.staffId] });
    },
  });
}
