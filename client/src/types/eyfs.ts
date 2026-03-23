export type EyfsArea = 'CL' | 'PD' | 'PSED' | 'L' | 'M' | 'UW' | 'EAD';

export type AssessmentStatus = 'NOT_YET' | 'EMERGING' | 'DEVELOPING' | 'SECURE' | 'EXCEEDING';

export interface EyfsMilestone {
  id: string;
  area: EyfsArea;
  ageRange: string;
  description: string;
  sortOrder: number;
}

export interface EyfsAssessment {
  id: string;
  childId: string;
  milestoneId: string;
  status: AssessmentStatus;
  assessedBy: string;
  assessedDate: string;
  evidenceNotes: string | null;
  evidencePhotoUrls: string[];
  milestone?: EyfsMilestone;
  createdAt: string;
  updatedAt: string;
}

export interface EyfsProgressReport {
  area: EyfsArea;
  totalMilestones: number;
  assessed: number;
  secure: number;
  progressPercent: number;
}

export const EYFS_AREA_LABELS: Record<EyfsArea, string> = {
  CL: 'Communication & Language',
  PD: 'Physical Development',
  PSED: 'Personal, Social & Emotional',
  L: 'Literacy',
  M: 'Mathematics',
  UW: 'Understanding the World',
  EAD: 'Expressive Arts & Design',
};

export const ASSESSMENT_STATUS_LABELS: Record<AssessmentStatus, string> = {
  NOT_YET: 'Not Yet',
  EMERGING: 'Emerging',
  DEVELOPING: 'Developing',
  SECURE: 'Secure',
  EXCEEDING: 'Exceeding',
};
