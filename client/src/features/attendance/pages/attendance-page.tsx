import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  LogIn,
  LogOut,
  Clock,
  Users,
  UserCheck,
  AlertCircle,
} from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useChildrenAttendance,
  useStaffAttendance,
  useCheckInChild,
  useCheckOutChild,
  useCheckInStaff,
  useCheckOutStaff,
} from '@/features/attendance/hooks/use-attendance';
import { useRooms } from '@/features/rooms/hooks/use-rooms';
import type { ChildAttendance, StaffAttendance, AttendanceStatus } from '@/types/attendance';

const statusConfig: Record<
  AttendanceStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  PRESENT: { label: 'Present', variant: 'default' },
  ABSENT: { label: 'Absent', variant: 'destructive' },
  LATE: { label: 'Late', variant: 'outline' },
  HOLIDAY: { label: 'Holiday', variant: 'secondary' },
  SICK: { label: 'Sick', variant: 'destructive' },
};

const staffStatusConfig: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  PRESENT: { label: 'Present', variant: 'default' },
  ABSENT: { label: 'Absent', variant: 'destructive' },
  HOLIDAY: { label: 'Holiday', variant: 'secondary' },
  SICK: { label: 'Sick', variant: 'destructive' },
};

function getCurrentTime(): string {
  return format(new Date(), 'HH:mm');
}

export function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(() =>
    format(new Date(), 'yyyy-MM-dd'),
  );
  const [roomFilter, setRoomFilter] = useState<string>('ALL');

  const { data: rooms } = useRooms();
  const {
    data: childrenAttendance,
    isLoading: childrenLoading,
  } = useChildrenAttendance(
    selectedDate,
    roomFilter !== 'ALL' ? roomFilter : undefined,
  );
  const {
    data: staffAttendance,
    isLoading: staffLoading,
  } = useStaffAttendance(selectedDate);

  const checkInChild = useCheckInChild();
  const checkOutChild = useCheckOutChild();
  const checkInStaff = useCheckInStaff();
  const checkOutStaff = useCheckOutStaff();

  // Group children by room
  const childrenByRoom = useMemo(() => {
    if (!childrenAttendance) return new Map<string, ChildAttendance[]>();
    const grouped = new Map<string, ChildAttendance[]>();

    for (const record of childrenAttendance) {
      const roomName = record.child?.room?.name ?? 'Unassigned';
      const existing = grouped.get(roomName) ?? [];
      existing.push(record);
      grouped.set(roomName, existing);
    }

    // Sort children within each room by name
    for (const [key, records] of grouped) {
      grouped.set(
        key,
        records.sort((a, b) => {
          const nameA = `${a.child?.firstName ?? ''} ${a.child?.lastName ?? ''}`;
          const nameB = `${b.child?.firstName ?? ''} ${b.child?.lastName ?? ''}`;
          return nameA.localeCompare(nameB);
        }),
      );
    }

    return grouped;
  }, [childrenAttendance]);

  // Summary counts
  const childrenSummary = useMemo(() => {
    if (!childrenAttendance) return { total: 0, present: 0, absent: 0 };
    const total = childrenAttendance.length;
    const present = childrenAttendance.filter(
      (a) => a.status === 'PRESENT' || a.status === 'LATE',
    ).length;
    return { total, present, absent: total - present };
  }, [childrenAttendance]);

  const handleCheckInChild = async (childId: string) => {
    try {
      await checkInChild.mutateAsync({
        childId,
        date: selectedDate,
        time: getCurrentTime(),
      });
      toast.success('Child checked in');
    } catch {
      toast.error('Failed to check in child');
    }
  };

  const handleCheckOutChild = async (childId: string) => {
    try {
      await checkOutChild.mutateAsync({
        childId,
        date: selectedDate,
        time: getCurrentTime(),
      });
      toast.success('Child checked out');
    } catch {
      toast.error('Failed to check out child');
    }
  };

  const handleCheckInStaff = async (staffId: string) => {
    try {
      await checkInStaff.mutateAsync({
        staffId,
        date: selectedDate,
        time: getCurrentTime(),
      });
      toast.success('Staff member checked in');
    } catch {
      toast.error('Failed to check in staff');
    }
  };

  const handleCheckOutStaff = async (staffId: string) => {
    try {
      await checkOutStaff.mutateAsync({
        staffId,
        date: selectedDate,
        time: getCurrentTime(),
      });
      toast.success('Staff member checked out');
    } catch {
      toast.error('Failed to check out staff');
    }
  };

  return (
    <div>
      <PageHeader
        title="Attendance"
        description="Track daily check-ins and check-outs for children and staff"
      />

      {/* Date selector and room filter */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-muted-foreground" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-44"
          />
        </div>
        <Select value={roomFilter} onValueChange={(v) => setRoomFilter(v ?? '')}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Rooms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Rooms</SelectItem>
            {rooms?.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                {room.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Summary badges */}
        {childrenAttendance && (
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="size-4" />
              <span>{childrenSummary.total} total</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-green-600">
              <UserCheck className="size-4" />
              <span>{childrenSummary.present} present</span>
            </div>
            {childrenSummary.absent > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-destructive">
                <AlertCircle className="size-4" />
                <span>{childrenSummary.absent} not in</span>
              </div>
            )}
          </div>
        )}
      </div>

      <Tabs defaultValue="children">
        <TabsList>
          <TabsTrigger value="children">Children</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>

        <TabsContent value="children" className="mt-4">
          <ChildrenAttendanceTab
            childrenByRoom={childrenByRoom}
            isLoading={childrenLoading}
            onCheckIn={handleCheckInChild}
            onCheckOut={handleCheckOutChild}
            isCheckingIn={checkInChild.isPending}
            isCheckingOut={checkOutChild.isPending}
          />
        </TabsContent>

        <TabsContent value="staff" className="mt-4">
          <StaffAttendanceTab
            staffAttendance={staffAttendance ?? []}
            isLoading={staffLoading}
            onCheckIn={handleCheckInStaff}
            onCheckOut={handleCheckOutStaff}
            isCheckingIn={checkInStaff.isPending}
            isCheckingOut={checkOutStaff.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ===== CHILDREN ATTENDANCE TAB =====
function ChildrenAttendanceTab({
  childrenByRoom,
  isLoading,
  onCheckIn,
  onCheckOut,
  isCheckingIn,
  isCheckingOut,
}: {
  childrenByRoom: Map<string, ChildAttendance[]>;
  isLoading: boolean;
  onCheckIn: (childId: string) => void;
  onCheckOut: (childId: string) => void;
  isCheckingIn: boolean;
  isCheckingOut: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (childrenByRoom.size === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <Users className="size-10 text-muted-foreground" />
        <p className="mt-3 text-lg font-medium">No attendance records</p>
        <p className="mt-1 text-sm text-muted-foreground">
          There are no attendance records for this date. Children will appear here once attendance is set up.
        </p>
      </div>
    );
  }

  // Sort room names, but keep "Unassigned" at the end
  const sortedRooms = Array.from(childrenByRoom.keys()).sort((a, b) => {
    if (a === 'Unassigned') return 1;
    if (b === 'Unassigned') return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="space-y-4">
      {sortedRooms.map((roomName) => {
        const records = childrenByRoom.get(roomName) ?? [];
        const presentCount = records.filter(
          (r) => r.status === 'PRESENT' || r.status === 'LATE',
        ).length;

        return (
          <Card key={roomName}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{roomName}</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {presentCount} / {records.length} present
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {records.map((record) => (
                  <ChildAttendanceRow
                    key={record.id}
                    record={record}
                    onCheckIn={onCheckIn}
                    onCheckOut={onCheckOut}
                    isCheckingIn={isCheckingIn}
                    isCheckingOut={isCheckingOut}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function ChildAttendanceRow({
  record,
  onCheckIn,
  onCheckOut,
  isCheckingIn,
  isCheckingOut,
}: {
  record: ChildAttendance;
  onCheckIn: (childId: string) => void;
  onCheckOut: (childId: string) => void;
  isCheckingIn: boolean;
  isCheckingOut: boolean;
}) {
  const childName = record.child
    ? `${record.child.firstName} ${record.child.lastName}`
    : 'Unknown';

  const config = statusConfig[record.status];
  const hasCheckedIn = !!record.checkInTime;
  const hasCheckedOut = !!record.checkOutTime;

  return (
    <div className="flex items-center justify-between rounded-lg border px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
          {record.child?.firstName?.[0] ?? '?'}
          {record.child?.lastName?.[0] ?? ''}
        </div>
        <div>
          <p className="text-sm font-medium">{childName}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {hasCheckedIn && (
              <span className="flex items-center gap-1">
                <LogIn className="size-3" />
                {record.checkInTime}
              </span>
            )}
            {hasCheckedOut && (
              <span className="flex items-center gap-1">
                <LogOut className="size-3" />
                {record.checkOutTime}
              </span>
            )}
            {!hasCheckedIn && !hasCheckedOut && (
              <span>Not arrived</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant={config.variant}>{config.label}</Badge>

        {!hasCheckedIn && (
          <Button
            size="sm"
            variant="default"
            className="bg-green-600 hover:bg-green-700"
            onClick={() => onCheckIn(record.childId)}
            disabled={isCheckingIn}
          >
            <LogIn className="size-3.5" />
            Check In
          </Button>
        )}

        {hasCheckedIn && !hasCheckedOut && (
          <Button
            size="sm"
            variant="default"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => onCheckOut(record.childId)}
            disabled={isCheckingOut}
          >
            <LogOut className="size-3.5" />
            Check Out
          </Button>
        )}

        {hasCheckedIn && hasCheckedOut && (
          <span className="text-xs text-muted-foreground">Done</span>
        )}
      </div>
    </div>
  );
}

// ===== STAFF ATTENDANCE TAB =====
function StaffAttendanceTab({
  staffAttendance,
  isLoading,
  onCheckIn,
  onCheckOut,
  isCheckingIn,
  isCheckingOut,
}: {
  staffAttendance: StaffAttendance[];
  isLoading: boolean;
  onCheckIn: (staffId: string) => void;
  onCheckOut: (staffId: string) => void;
  isCheckingIn: boolean;
  isCheckingOut: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (staffAttendance.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
        <Users className="size-10 text-muted-foreground" />
        <p className="mt-3 text-lg font-medium">No staff attendance records</p>
        <p className="mt-1 text-sm text-muted-foreground">
          There are no staff attendance records for this date.
        </p>
      </div>
    );
  }

  const sortedStaff = [...staffAttendance].sort((a, b) => {
    const nameA = `${a.staff?.firstName ?? ''} ${a.staff?.lastName ?? ''}`;
    const nameB = `${b.staff?.firstName ?? ''} ${b.staff?.lastName ?? ''}`;
    return nameA.localeCompare(nameB);
  });

  const presentCount = sortedStaff.filter(
    (s) => s.status === 'PRESENT',
  ).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Staff Members</CardTitle>
          <span className="text-sm text-muted-foreground">
            {presentCount} / {sortedStaff.length} present
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedStaff.map((record) => {
            const staffName = record.staff
              ? `${record.staff.firstName} ${record.staff.lastName}`
              : 'Unknown';

            const config = staffStatusConfig[record.status] ?? {
              label: record.status,
              variant: 'outline' as const,
            };
            const hasCheckedIn = !!record.checkInTime;
            const hasCheckedOut = !!record.checkOutTime;

            return (
              <div
                key={record.id}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {record.staff?.firstName?.[0] ?? '?'}
                    {record.staff?.lastName?.[0] ?? ''}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{staffName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {hasCheckedIn && (
                        <span className="flex items-center gap-1">
                          <LogIn className="size-3" />
                          {record.checkInTime}
                        </span>
                      )}
                      {hasCheckedOut && (
                        <span className="flex items-center gap-1">
                          <LogOut className="size-3" />
                          {record.checkOutTime}
                        </span>
                      )}
                      {!hasCheckedIn && !hasCheckedOut && (
                        <span>Not arrived</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={config.variant}>{config.label}</Badge>

                  {!hasCheckedIn && (
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => onCheckIn(record.staffId)}
                      disabled={isCheckingIn}
                    >
                      <LogIn className="size-3.5" />
                      Check In
                    </Button>
                  )}

                  {hasCheckedIn && !hasCheckedOut && (
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => onCheckOut(record.staffId)}
                      disabled={isCheckingOut}
                    >
                      <LogOut className="size-3.5" />
                      Check Out
                    </Button>
                  )}

                  {hasCheckedIn && hasCheckedOut && (
                    <span className="text-xs text-muted-foreground">Done</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
