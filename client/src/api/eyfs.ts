import api from './client';
import type { EyfsMilestone, EyfsAssessment, EyfsProgressReport } from '@/types/eyfs';

export interface ListMilestonesParams {
  area?: string;
  ageRange?: string;
}

export interface CreateAssessmentData {
  milestoneId: string;
  status: string;
  assessedBy: string;
  assessedDate: string;
  evidenceNotes?: string;
  evidencePhotoUrls?: string[];
}

export interface UpdateAssessmentData {
  status?: string;
  assessedBy?: string;
  assessedDate?: string;
  evidenceNotes?: string;
  evidencePhotoUrls?: string[];
}

export const eyfsApi = {
  listMilestones: (params?: ListMilestonesParams) =>
    api.get<EyfsMilestone[]>('/eyfs/milestones', { params }),

  getChildAssessments: (childId: string) =>
    api.get<EyfsAssessment[]>(`/eyfs/children/${childId}`),

  createAssessment: (childId: string, data: CreateAssessmentData) =>
    api.post<EyfsAssessment>(`/eyfs/children/${childId}`, data),

  updateAssessment: (assessmentId: string, data: UpdateAssessmentData) =>
    api.put<EyfsAssessment>(`/eyfs/assessments/${assessmentId}`, data),

  getChildProgress: (childId: string) =>
    api.get<EyfsProgressReport[]>(`/eyfs/children/${childId}/report`),
};
