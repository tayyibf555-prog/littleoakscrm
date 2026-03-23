import api from './client';
import type { ChildAttendance, StaffAttendance, AttendanceReport } from '@/types/attendance';

export interface CheckInChildData {
  childId: string;
  date: string;
  time: string;
  notes?: string;
}

export interface CheckOutChildData {
  childId: string;
  date: string;
  time: string;
  notes?: string;
}

export interface UpdateChildAttendanceData {
  status?: string;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

export interface CheckInStaffData {
  staffId: string;
  date: string;
  time: string;
}

export interface CheckOutStaffData {
  staffId: string;
  date: string;
  time: string;
}

export interface ChildAttendanceParams {
  date: string;
  roomId?: string;
}

export interface AttendanceReportParams {
  startDate: string;
  endDate: string;
  childId?: string;
}

export const attendanceApi = {
  // Children attendance
  listChildren: (params: ChildAttendanceParams) =>
    api.get<ChildAttendance[]>('/attendance/children', { params }),

  checkInChild: (data: CheckInChildData) =>
    api.post<ChildAttendance>('/attendance/children/check-in', data),

  checkOutChild: (data: CheckOutChildData) =>
    api.post<ChildAttendance>('/attendance/children/check-out', data),

  updateChildAttendance: (id: string, data: UpdateChildAttendanceData) =>
    api.put<ChildAttendance>(`/attendance/children/${id}`, data),

  getReport: (params: AttendanceReportParams) =>
    api.get<AttendanceReport[]>('/attendance/children/report', { params }),

  // Staff attendance
  listStaff: (date: string) =>
    api.get<StaffAttendance[]>('/attendance/staff', { params: { date } }),

  checkInStaff: (data: CheckInStaffData) =>
    api.post<StaffAttendance>('/attendance/staff/check-in', data),

  checkOutStaff: (data: CheckOutStaffData) =>
    api.post<StaffAttendance>('/attendance/staff/check-out', data),
};
