export type DiaryEntryType = 'MEAL' | 'NAP' | 'NAPPY' | 'ACTIVITY' | 'OBSERVATION' | 'MEDICATION' | 'NOTE';

export interface DiaryEntry {
  id: string;
  childId: string;
  authorId: string;
  date: string;
  time: string;
  entryType: DiaryEntryType;
  content: Record<string, unknown>;
  photoUrls: string[];
  isPrivate: boolean;
  child?: {
    firstName: string;
    lastName: string;
    room?: { name: string } | null;
  };
  author?: {
    staffProfile?: { firstName: string; lastName: string } | null;
  };
  createdAt: string;
  updatedAt: string;
}
