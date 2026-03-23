export interface Staff {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  jobTitle: string;
  department: string | null;
  dateOfBirth: string | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  photoUrl: string | null;
  address: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { email: string; role: string };
}

export interface DbsCheck {
  id: string;
  staffId: string;
  dbsNumber: string;
  issueDate: string;
  expiryDate: string;
  dbsType: 'BASIC' | 'STANDARD' | 'ENHANCED' | 'ENHANCED_BARRED';
  status: 'CLEAR' | 'WITH_CONTENT' | 'PENDING';
  verifiedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Qualification {
  id: string;
  staffId: string;
  name: string;
  level: string | null;
  institution: string | null;
  dateObtained: string | null;
  expiryDate: string | null;
  certificateUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingRecord {
  id: string;
  staffId: string;
  courseName: string;
  provider: string | null;
  completedDate: string;
  expiryDate: string | null;
  certificateUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Shift {
  id: string;
  staffId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffWithRelations extends Staff {
  dbsCheck: DbsCheck | null;
  qualifications: Qualification[];
  trainingRecords: TrainingRecord[];
  shifts: Shift[];
}
