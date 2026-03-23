import type { Room } from './room';

export type ChildStatus = 'ACTIVE' | 'LEFT' | 'WAITLIST';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  preferredName: string | null;
  dateOfBirth: string;
  gender: Gender;
  status: ChildStatus;
  roomId: string | null;
  enrollmentDate: string;
  leaveDate: string | null;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  room?: Room | null;
}

export interface MedicalInfo {
  id: string;
  childId: string;
  allergies: string | null;
  dietaryNeeds: string | null;
  medicalConditions: string | null;
  gpName: string | null;
  gpPhone: string | null;
  gpAddress: string | null;
  healthNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContact {
  id: string;
  childId: string;
  firstName: string;
  lastName: string;
  relationship: string;
  phone: string;
  email: string | null;
  priority: number;
  authorisedPickup: boolean;
  createdAt: string;
  updatedAt: string;
}

export const ConsentType = {
  PHOTO: 'PHOTO',
  VIDEO: 'VIDEO',
  OUTINGS: 'OUTINGS',
  SUNSCREEN: 'SUNSCREEN',
  MEDICATION: 'MEDICATION',
  FACE_PAINTING: 'FACE_PAINTING',
  SOCIAL_MEDIA: 'SOCIAL_MEDIA',
} as const;
export type ConsentType = (typeof ConsentType)[keyof typeof ConsentType];

export interface Consent {
  id: string;
  childId: string;
  type: ConsentType;
  granted: boolean;
  grantedBy: string | null;
  grantedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChildWithRelations extends Child {
  room: Room | null;
  medicalInfo: MedicalInfo | null;
  emergencyContacts: EmergencyContact[];
  consents: Consent[];
}
