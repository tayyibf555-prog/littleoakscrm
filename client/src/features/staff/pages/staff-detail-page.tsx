import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parseISO, isBefore, addDays } from 'date-fns';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  AlertTriangle,
  Shield,
  GraduationCap,
  Calendar,
  Clock,
} from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  useStaffMember,
  useUpdateStaff,
  useUpsertDbs,
  useCreateQualification,
  useDeleteQualification,
  useCreateTraining,
  useDeleteTraining,
  useCreateShift,
  useDeleteShift,
} from '@/features/staff/hooks/use-staff';
import type { StaffWithRelations, DbsCheck, Qualification, TrainingRecord, Shift } from '@/types/staff';

// --- Profile Edit Schema ---
const editProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  jobTitle: z.string().min(1, 'Job title is required'),
  department: z.string().optional(),
  dateOfBirth: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  isActive: z.boolean(),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  notes: z.string().optional(),
});

type EditProfileForm = z.infer<typeof editProfileSchema>;

// --- DBS Schema ---
const dbsSchema = z.object({
  dbsNumber: z.string().min(1, 'DBS number is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  dbsType: z.enum(['BASIC', 'STANDARD', 'ENHANCED', 'ENHANCED_BARRED'], {
    required_error: 'DBS type is required',
  }),
  status: z.enum(['CLEAR', 'WITH_CONTENT', 'PENDING'], {
    required_error: 'Status is required',
  }),
  verifiedBy: z.string().optional(),
});

type DbsForm = z.infer<typeof dbsSchema>;

// --- Qualification Schema ---
const qualificationSchema = z.object({
  name: z.string().min(1, 'Qualification name is required'),
  level: z.string().optional(),
  institution: z.string().optional(),
  dateObtained: z.string().optional(),
  expiryDate: z.string().optional(),
});

type QualificationForm = z.infer<typeof qualificationSchema>;

// --- Training Schema ---
const trainingSchema = z.object({
  courseName: z.string().min(1, 'Course name is required'),
  provider: z.string().optional(),
  completedDate: z.string().min(1, 'Completed date is required'),
  expiryDate: z.string().optional(),
});

type TrainingForm = z.infer<typeof trainingSchema>;

// --- Shift Schema ---
const shiftSchema = z.object({
  dayOfWeek: z.coerce.number().min(0).max(6),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
});

type ShiftForm = z.infer<typeof shiftSchema>;

// --- Day labels ---
const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// --- DBS type labels ---
const dbsTypeLabels: Record<string, string> = {
  BASIC: 'Basic',
  STANDARD: 'Standard',
  ENHANCED: 'Enhanced',
  ENHANCED_BARRED: 'Enhanced with Barred Lists',
};

// --- DBS status labels ---
const dbsStatusLabels: Record<string, string> = {
  CLEAR: 'Clear',
  WITH_CONTENT: 'With Content',
  PENDING: 'Pending',
};

// --- Helper: DBS expiry badge ---
function DbsExpiryBadge({ expiryDate }: { expiryDate: string }) {
  const expiry = parseISO(expiryDate);
  const now = new Date();
  const warningDate = addDays(now, 30);

  if (isBefore(expiry, now)) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="size-3" />
        Expired
      </Badge>
    );
  }

  if (isBefore(expiry, warningDate)) {
    return (
      <Badge variant="outline" className="gap-1 border-amber-500 text-amber-600">
        <AlertTriangle className="size-3" />
        Expiring Soon
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="gap-1">
      <Shield className="size-3" />
      Valid
    </Badge>
  );
}

// --- InfoField helper ---
function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}

// ===== MAIN PAGE =====
export function StaffDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: staffMember, isLoading } = useStaffMember(id!);

  if (isLoading) {
    return (
      <div>
        <Skeleton className="mb-6 h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!staffMember) {
    return (
      <div>
        <PageHeader title="Staff Member Not Found" />
        <p className="text-muted-foreground">The staff member you are looking for does not exist.</p>
        <Button variant="outline" className="mt-4" onClick={() => void navigate('/staff')}>
          Back to Staff
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => void navigate('/staff')}>
          <ArrowLeft className="size-4" />
          Back to Staff
        </Button>
      </div>

      <PageHeader
        title={`${staffMember.firstName} ${staffMember.lastName}`}
        description={staffMember.jobTitle}
        action={
          <Badge variant={staffMember.isActive ? 'default' : 'secondary'}>
            {staffMember.isActive ? 'Active' : 'Inactive'}
          </Badge>
        }
      />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="dbs">DBS</TabsTrigger>
          <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="shifts">Shifts</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <ProfileTab staffMember={staffMember} />
        </TabsContent>

        <TabsContent value="dbs" className="mt-4">
          <DbsTab staffId={staffMember.id} dbsCheck={staffMember.dbsCheck} />
        </TabsContent>

        <TabsContent value="qualifications" className="mt-4">
          <QualificationsTab staffId={staffMember.id} qualifications={staffMember.qualifications} />
        </TabsContent>

        <TabsContent value="training" className="mt-4">
          <TrainingTab staffId={staffMember.id} trainingRecords={staffMember.trainingRecords} />
        </TabsContent>

        <TabsContent value="shifts" className="mt-4">
          <ShiftsTab staffId={staffMember.id} shifts={staffMember.shifts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ===== PROFILE TAB =====
function ProfileTab({ staffMember }: { staffMember: StaffWithRelations }) {
  const [editing, setEditing] = useState(false);
  const updateStaff = useUpdateStaff();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditProfileForm>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: staffMember.firstName,
      lastName: staffMember.lastName,
      email: staffMember.email,
      phone: staffMember.phone ?? '',
      jobTitle: staffMember.jobTitle,
      department: staffMember.department ?? '',
      dateOfBirth: staffMember.dateOfBirth ? staffMember.dateOfBirth.split('T')[0] : '',
      startDate: staffMember.startDate.split('T')[0],
      endDate: staffMember.endDate ? staffMember.endDate.split('T')[0] : '',
      isActive: staffMember.isActive,
      address: staffMember.address ?? '',
      emergencyContactName: staffMember.emergencyContactName ?? '',
      emergencyContactPhone: staffMember.emergencyContactPhone ?? '',
      notes: staffMember.notes ?? '',
    },
  });

  const isActiveValue = watch('isActive');

  const onSubmit = async (data: EditProfileForm) => {
    try {
      await updateStaff.mutateAsync({
        id: staffMember.id,
        data: {
          ...data,
          phone: data.phone || undefined,
          department: data.department || undefined,
          dateOfBirth: data.dateOfBirth || undefined,
          endDate: data.endDate || undefined,
          address: data.address || undefined,
          emergencyContactName: data.emergencyContactName || undefined,
          emergencyContactPhone: data.emergencyContactPhone || undefined,
          notes: data.notes || undefined,
        },
      });
      toast.success('Staff member updated successfully');
      setEditing(false);
    } catch {
      toast.error('Failed to update staff member');
    }
  };

  if (editing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">First Name</Label>
                <Input id="edit-firstName" {...register('firstName')} aria-invalid={!!errors.firstName} />
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Last Name</Label>
                <Input id="edit-lastName" {...register('lastName')} aria-invalid={!!errors.lastName} />
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input id="edit-email" type="email" {...register('email')} aria-invalid={!!errors.email} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input id="edit-phone" type="tel" {...register('phone')} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-jobTitle">Job Title</Label>
                <Input id="edit-jobTitle" {...register('jobTitle')} aria-invalid={!!errors.jobTitle} />
                {errors.jobTitle && <p className="text-xs text-destructive">{errors.jobTitle.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department</Label>
                <Input id="edit-department" {...register('department')} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-dob">Date of Birth</Label>
                <Input id="edit-dob" type="date" {...register('dateOfBirth')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input id="edit-startDate" type="date" {...register('startDate')} aria-invalid={!!errors.startDate} />
                {errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">End Date</Label>
                <Input id="edit-endDate" type="date" {...register('endDate')} />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="edit-isActive"
                type="checkbox"
                checked={isActiveValue}
                onChange={(e) => setValue('isActive', e.target.checked)}
                className="size-4 rounded border-input"
              />
              <Label htmlFor="edit-isActive">Active</Label>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Textarea id="edit-address" {...register('address')} rows={2} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-emergencyName">Emergency Contact Name</Label>
                <Input id="edit-emergencyName" {...register('emergencyContactName')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-emergencyPhone">Emergency Contact Phone</Label>
                <Input id="edit-emergencyPhone" type="tel" {...register('emergencyContactPhone')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea id="edit-notes" {...register('notes')} rows={3} />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                <Save className="size-4" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={() => { reset(); setEditing(false); }}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Profile Information</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          Edit
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <InfoField label="First Name" value={staffMember.firstName} />
          <InfoField label="Last Name" value={staffMember.lastName} />
          <InfoField label="Email" value={staffMember.email} />
          <InfoField label="Phone" value={staffMember.phone ?? '---'} />
          <InfoField label="Job Title" value={staffMember.jobTitle} />
          <InfoField label="Department" value={staffMember.department ?? '---'} />
          <InfoField label="Date of Birth" value={staffMember.dateOfBirth ? format(parseISO(staffMember.dateOfBirth), 'dd MMM yyyy') : '---'} />
          <InfoField label="Start Date" value={format(parseISO(staffMember.startDate), 'dd MMM yyyy')} />
          <InfoField label="End Date" value={staffMember.endDate ? format(parseISO(staffMember.endDate), 'dd MMM yyyy') : '---'} />
          <InfoField label="Status" value={staffMember.isActive ? 'Active' : 'Inactive'} />
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <InfoField label="Address" value={staffMember.address ?? '---'} />
          </div>
          <InfoField label="Emergency Contact Name" value={staffMember.emergencyContactName ?? '---'} />
          <InfoField label="Emergency Contact Phone" value={staffMember.emergencyContactPhone ?? '---'} />
          <div className="col-span-2">
            <InfoField label="Notes" value={staffMember.notes ?? 'None'} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ===== DBS TAB =====
function DbsTab({ staffId, dbsCheck }: { staffId: string; dbsCheck: DbsCheck | null }) {
  const [editing, setEditing] = useState(false);
  const upsertDbs = useUpsertDbs();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DbsForm>({
    resolver: zodResolver(dbsSchema),
    defaultValues: {
      dbsNumber: dbsCheck?.dbsNumber ?? '',
      issueDate: dbsCheck?.issueDate ? dbsCheck.issueDate.split('T')[0] : '',
      expiryDate: dbsCheck?.expiryDate ? dbsCheck.expiryDate.split('T')[0] : '',
      dbsType: dbsCheck?.dbsType ?? undefined,
      status: dbsCheck?.status ?? undefined,
      verifiedBy: dbsCheck?.verifiedBy ?? '',
    },
  });

  const dbsTypeValue = watch('dbsType');
  const statusValue = watch('status');

  const onSubmit = async (data: DbsForm) => {
    try {
      await upsertDbs.mutateAsync({
        staffId,
        data: {
          ...data,
          verifiedBy: data.verifiedBy || undefined,
        },
      });
      toast.success(dbsCheck ? 'DBS check updated' : 'DBS check added');
      setEditing(false);
    } catch {
      toast.error('Failed to save DBS check');
    }
  };

  if (editing || !dbsCheck) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{dbsCheck ? 'Edit DBS Check' : 'Add DBS Check'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dbs-number">DBS Number</Label>
                <Input id="dbs-number" {...register('dbsNumber')} aria-invalid={!!errors.dbsNumber} />
                {errors.dbsNumber && <p className="text-xs text-destructive">{errors.dbsNumber.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>DBS Type</Label>
                <Select
                  value={dbsTypeValue ?? ''}
                  onValueChange={(val) => setValue('dbsType', val as DbsForm['dbsType'], { shouldValidate: true })}
                >
                  <SelectTrigger className="w-full" aria-invalid={!!errors.dbsType}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BASIC">Basic</SelectItem>
                    <SelectItem value="STANDARD">Standard</SelectItem>
                    <SelectItem value="ENHANCED">Enhanced</SelectItem>
                    <SelectItem value="ENHANCED_BARRED">Enhanced with Barred Lists</SelectItem>
                  </SelectContent>
                </Select>
                {errors.dbsType && <p className="text-xs text-destructive">{errors.dbsType.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dbs-issueDate">Issue Date</Label>
                <Input id="dbs-issueDate" type="date" {...register('issueDate')} aria-invalid={!!errors.issueDate} />
                {errors.issueDate && <p className="text-xs text-destructive">{errors.issueDate.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dbs-expiryDate">Expiry Date</Label>
                <Input id="dbs-expiryDate" type="date" {...register('expiryDate')} aria-invalid={!!errors.expiryDate} />
                {errors.expiryDate && <p className="text-xs text-destructive">{errors.expiryDate.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={statusValue ?? ''}
                  onValueChange={(val) => setValue('status', val as DbsForm['status'], { shouldValidate: true })}
                >
                  <SelectTrigger className="w-full" aria-invalid={!!errors.status}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLEAR">Clear</SelectItem>
                    <SelectItem value="WITH_CONTENT">With Content</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && <p className="text-xs text-destructive">{errors.status.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dbs-verifiedBy">Verified By</Label>
                <Input id="dbs-verifiedBy" {...register('verifiedBy')} />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                <Save className="size-4" />
                {isSubmitting ? 'Saving...' : 'Save DBS Check'}
              </Button>
              {dbsCheck && (
                <Button type="button" variant="outline" onClick={() => { reset(); setEditing(false); }}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <CardTitle>DBS Check</CardTitle>
          <DbsExpiryBadge expiryDate={dbsCheck.expiryDate} />
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
          Edit
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <InfoField label="DBS Number" value={dbsCheck.dbsNumber} />
          <InfoField label="DBS Type" value={dbsTypeLabels[dbsCheck.dbsType] ?? dbsCheck.dbsType} />
          <InfoField label="Issue Date" value={format(parseISO(dbsCheck.issueDate), 'dd MMM yyyy')} />
          <InfoField label="Expiry Date" value={format(parseISO(dbsCheck.expiryDate), 'dd MMM yyyy')} />
          <InfoField label="Status" value={dbsStatusLabels[dbsCheck.status] ?? dbsCheck.status} />
          <InfoField label="Verified By" value={dbsCheck.verifiedBy ?? '---'} />
        </div>
      </CardContent>
    </Card>
  );
}

// ===== QUALIFICATIONS TAB =====
function QualificationsTab({ staffId, qualifications }: { staffId: string; qualifications: Qualification[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const createQualification = useCreateQualification();
  const deleteQualification = useDeleteQualification();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QualificationForm>({
    resolver: zodResolver(qualificationSchema),
    defaultValues: {
      name: '',
      level: '',
      institution: '',
      dateObtained: '',
      expiryDate: '',
    },
  });

  const onSubmit = async (data: QualificationForm) => {
    try {
      await createQualification.mutateAsync({
        staffId,
        data: {
          ...data,
          level: data.level || undefined,
          institution: data.institution || undefined,
          dateObtained: data.dateObtained || undefined,
          expiryDate: data.expiryDate || undefined,
        },
      });
      toast.success('Qualification added');
      setDialogOpen(false);
      reset();
    } catch {
      toast.error('Failed to add qualification');
    }
  };

  const handleDelete = async (qualId: string) => {
    try {
      await deleteQualification.mutateAsync({ staffId, qualId });
      toast.success('Qualification removed');
    } catch {
      toast.error('Failed to delete qualification');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="size-5" />
          Qualifications
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) reset(); }}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus className="size-4" />
            Add Qualification
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Qualification</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qual-name">Qualification Name</Label>
                <Input id="qual-name" {...register('name')} aria-invalid={!!errors.name} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qual-level">Level</Label>
                  <Input id="qual-level" {...register('level')} placeholder="e.g. Level 3" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qual-institution">Institution</Label>
                  <Input id="qual-institution" {...register('institution')} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qual-dateObtained">Date Obtained</Label>
                  <Input id="qual-dateObtained" type="date" {...register('dateObtained')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qual-expiryDate">Expiry Date</Label>
                  <Input id="qual-expiryDate" type="date" {...register('expiryDate')} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Qualification'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {qualifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No qualifications recorded yet.</p>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Qualification</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Date Obtained</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {qualifications.map((qual) => (
                  <TableRow key={qual.id}>
                    <TableCell className="font-medium">{qual.name}</TableCell>
                    <TableCell>{qual.level ?? '---'}</TableCell>
                    <TableCell>{qual.institution ?? '---'}</TableCell>
                    <TableCell>
                      {qual.dateObtained ? format(parseISO(qual.dateObtained), 'dd MMM yyyy') : '---'}
                    </TableCell>
                    <TableCell>
                      {qual.expiryDate ? format(parseISO(qual.expiryDate), 'dd MMM yyyy') : '---'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => void handleDelete(qual.id)}
                      >
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===== TRAINING TAB =====
function TrainingTab({ staffId, trainingRecords }: { staffId: string; trainingRecords: TrainingRecord[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const createTraining = useCreateTraining();
  const deleteTraining = useDeleteTraining();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TrainingForm>({
    resolver: zodResolver(trainingSchema),
    defaultValues: {
      courseName: '',
      provider: '',
      completedDate: '',
      expiryDate: '',
    },
  });

  const onSubmit = async (data: TrainingForm) => {
    try {
      await createTraining.mutateAsync({
        staffId,
        data: {
          ...data,
          provider: data.provider || undefined,
          expiryDate: data.expiryDate || undefined,
        },
      });
      toast.success('Training record added');
      setDialogOpen(false);
      reset();
    } catch {
      toast.error('Failed to add training record');
    }
  };

  const handleDelete = async (trainingId: string) => {
    try {
      await deleteTraining.mutateAsync({ staffId, trainingId });
      toast.success('Training record removed');
    } catch {
      toast.error('Failed to delete training record');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="size-5" />
          Training Records
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) reset(); }}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus className="size-4" />
            Add Training
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Training Record</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="training-courseName">Course Name</Label>
                <Input id="training-courseName" {...register('courseName')} aria-invalid={!!errors.courseName} />
                {errors.courseName && <p className="text-xs text-destructive">{errors.courseName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="training-provider">Provider</Label>
                <Input id="training-provider" {...register('provider')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="training-completedDate">Completed Date</Label>
                  <Input id="training-completedDate" type="date" {...register('completedDate')} aria-invalid={!!errors.completedDate} />
                  {errors.completedDate && <p className="text-xs text-destructive">{errors.completedDate.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="training-expiryDate">Expiry Date</Label>
                  <Input id="training-expiryDate" type="date" {...register('expiryDate')} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Training'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {trainingRecords.length === 0 ? (
          <p className="text-sm text-muted-foreground">No training records yet.</p>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainingRecords.map((record) => {
                  const isExpired = record.expiryDate && isBefore(parseISO(record.expiryDate), new Date());
                  const isExpiringSoon = record.expiryDate && !isExpired && isBefore(parseISO(record.expiryDate), addDays(new Date(), 30));

                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.courseName}</TableCell>
                      <TableCell>{record.provider ?? '---'}</TableCell>
                      <TableCell>{format(parseISO(record.completedDate), 'dd MMM yyyy')}</TableCell>
                      <TableCell>
                        {record.expiryDate ? (
                          <span className="flex items-center gap-2">
                            {format(parseISO(record.expiryDate), 'dd MMM yyyy')}
                            {isExpired && (
                              <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="size-3" />
                                Expired
                              </Badge>
                            )}
                            {isExpiringSoon && (
                              <Badge variant="outline" className="gap-1 border-amber-500 text-amber-600">
                                <AlertTriangle className="size-3" />
                                Soon
                              </Badge>
                            )}
                          </span>
                        ) : (
                          '---'
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => void handleDelete(record.id)}
                        >
                          <Trash2 className="size-3.5 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===== SHIFTS TAB =====
function ShiftsTab({ staffId, shifts }: { staffId: string; shifts: Shift[] }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const createShift = useCreateShift();
  const deleteShift = useDeleteShift();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ShiftForm>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      dayOfWeek: 1,
      startTime: '',
      endTime: '',
    },
  });

  const dayOfWeekValue = watch('dayOfWeek');

  const onSubmit = async (data: ShiftForm) => {
    try {
      await createShift.mutateAsync({ staffId, data });
      toast.success('Shift added');
      setDialogOpen(false);
      reset();
    } catch {
      toast.error('Failed to add shift');
    }
  };

  const handleDelete = async (shiftId: string) => {
    try {
      await deleteShift.mutateAsync({ staffId, shiftId });
      toast.success('Shift removed');
    } catch {
      toast.error('Failed to delete shift');
    }
  };

  // Group shifts by day
  const shiftsByDay = DAY_LABELS.map((label, index) => ({
    day: label,
    dayIndex: index,
    shifts: shifts
      .filter((s) => s.dayOfWeek === index)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
  }));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Clock className="size-5" />
          Weekly Schedule
        </CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) reset(); }}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus className="size-4" />
            Add Shift
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Shift</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Day of Week</Label>
                <Select
                  value={String(dayOfWeekValue)}
                  onValueChange={(val) => setValue('dayOfWeek', Number(val), { shouldValidate: true })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAY_LABELS.map((label, index) => (
                      <SelectItem key={index} value={String(index)}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shift-startTime">Start Time</Label>
                  <Input id="shift-startTime" type="time" {...register('startTime')} aria-invalid={!!errors.startTime} />
                  {errors.startTime && <p className="text-xs text-destructive">{errors.startTime.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shift-endTime">End Time</Label>
                  <Input id="shift-endTime" type="time" {...register('endTime')} aria-invalid={!!errors.endTime} />
                  {errors.endTime && <p className="text-xs text-destructive">{errors.endTime.message}</p>}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Shift'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {shifts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No shifts scheduled yet.</p>
        ) : (
          <div className="space-y-3">
            {shiftsByDay
              .filter((day) => day.shifts.length > 0)
              .map((day) => (
                <div key={day.dayIndex} className="rounded-lg border p-4">
                  <h4 className="mb-2 text-sm font-semibold">{day.day}</h4>
                  <div className="space-y-2">
                    {day.shifts.map((shift) => (
                      <div
                        key={shift.id}
                        className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
                      >
                        <span className="flex items-center gap-2 text-sm">
                          <Clock className="size-3.5 text-muted-foreground" />
                          {shift.startTime} - {shift.endTime}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => void handleDelete(shift.id)}
                        >
                          <Trash2 className="size-3.5 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
