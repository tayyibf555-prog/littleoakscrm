export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HOLIDAY' | 'SICK';

export interface ChildAttendance {
  id: string;
  childId: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: AttendanceStatus;
  notes: string | null;
  checkedInBy: string | null;
  checkedOutBy: string | null;
  child?: {
    firstName: string;
    lastName: string;
    room?: { name: string } | null;
  };
}

export interface StaffAttendance {
  id: string;
  staffId: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: 'PRESENT' | 'ABSENT' | 'HOLIDAY' | 'SICK';
  notes: string | null;
  staff?: {
    firstName: string;
    lastName: string;
  };
}

export interface AttendanceReport {
  childId: string;
  childName: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  holidayDays: number;
  sickDays: number;
  attendanceRate: number;
}
