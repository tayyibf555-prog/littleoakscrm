export type IncidentSeverity = 'MINOR' | 'MODERATE' | 'SERIOUS';
export type IncidentStatus = 'OPEN' | 'SIGNED_OFF' | 'CLOSED';

export interface Incident {
  id: string;
  reportedById: string;
  date: string;
  time: string;
  location: string;
  description: string;
  actionTaken: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  signedOffById: string | null;
  signedOffAt: string | null;
  signedOffNotes: string | null;
  parentNotified: boolean;
  parentNotifiedAt: string | null;
  parentNotifiedBy: string | null;
  notificationMethod: string | null;
  witnesses: string | null;
  createdAt: string;
  updatedAt: string;
  reportedBy?: {
    staffProfile?: { firstName: string; lastName: string } | null;
  };
  signedOffBy?: {
    staffProfile?: { firstName: string; lastName: string } | null;
  } | null;
  children?: Array<{
    child: { id: string; firstName: string; lastName: string };
  }>;
}
