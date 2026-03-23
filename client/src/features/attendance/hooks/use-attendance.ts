import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '@/api/attendance';
import type {
  CheckInChildData,
  CheckOutChildData,
  UpdateChildAttendanceData,
  CheckInStaffData,
  CheckOutStaffData,
  AttendanceReportParams,
} from '@/api/attendance';

export function useChildrenAttendance(date: string, roomId?: string) {
  return useQuery({
    queryKey: ['attendance', 'children', date, roomId],
    queryFn: () =>
      attendanceApi.listChildren({ date, roomId }).then((res) => res.data),
    enabled: !!date,
  });
}

export function useStaffAttendance(date: string) {
  return useQuery({
    queryKey: ['attendance', 'staff', date],
    queryFn: () => attendanceApi.listStaff(date).then((res) => res.data),
    enabled: !!date,
  });
}

export function useCheckInChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckInChildData) =>
      attendanceApi.checkInChild(data).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['attendance', 'children'] });
    },
  });
}

export function useCheckOutChild() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckOutChildData) =>
      attendanceApi.checkOutChild(data).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['attendance', 'children'] });
    },
  });
}

export function useUpdateChildAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateChildAttendanceData }) =>
      attendanceApi.updateChildAttendance(id, data).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['attendance', 'children'] });
    },
  });
}

export function useAttendanceReport(params: AttendanceReportParams) {
  return useQuery({
    queryKey: ['attendance', 'report', params],
    queryFn: () => attendanceApi.getReport(params).then((res) => res.data),
    enabled: !!params.startDate && !!params.endDate,
  });
}

export function useCheckInStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckInStaffData) =>
      attendanceApi.checkInStaff(data).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['attendance', 'staff'] });
    },
  });
}

export function useCheckOutStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CheckOutStaffData) =>
      attendanceApi.checkOutStaff(data).then((res) => res.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['attendance', 'staff'] });
    },
  });
}
