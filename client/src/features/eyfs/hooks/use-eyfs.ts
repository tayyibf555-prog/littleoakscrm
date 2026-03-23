import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eyfsApi } from '@/api/eyfs';
import type { ListMilestonesParams, CreateAssessmentData, UpdateAssessmentData } from '@/api/eyfs';

export function useMilestones(area?: string, ageRange?: string) {
  const params: ListMilestonesParams = {
    ...(area ? { area } : {}),
    ...(ageRange ? { ageRange } : {}),
  };

  return useQuery({
    queryKey: ['eyfs', 'milestones', params],
    queryFn: () => eyfsApi.listMilestones(params).then((res) => res.data),
  });
}

export function useChildAssessments(childId: string) {
  return useQuery({
    queryKey: ['eyfs', 'assessments', childId],
    queryFn: () => eyfsApi.getChildAssessments(childId).then((res) => res.data),
    enabled: !!childId,
  });
}

export function useChildProgress(childId: string) {
  return useQuery({
    queryKey: ['eyfs', 'progress', childId],
    queryFn: () => eyfsApi.getChildProgress(childId).then((res) => res.data),
    enabled: !!childId,
  });
}

export function useCreateAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ childId, data }: { childId: string; data: CreateAssessmentData }) =>
      eyfsApi.createAssessment(childId, data).then((res) => res.data),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['eyfs', 'assessments', variables.childId] });
      void queryClient.invalidateQueries({ queryKey: ['eyfs', 'progress', variables.childId] });
    },
  });
}

export function useUpdateAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assessmentId, data }: { assessmentId: string; data: UpdateAssessmentData }) =>
      eyfsApi.updateAssessment(assessmentId, data).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['eyfs'] });
    },
  });
}
