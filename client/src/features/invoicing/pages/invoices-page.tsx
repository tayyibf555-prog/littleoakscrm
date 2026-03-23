import { useState } from 'react';
import { Link } from 'react-router';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { Plus, Pencil, PoundSterling, GraduationCap, Receipt } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  useInvoices,
  useFeeSchedules,
  useCreateFeeSchedule,
  useUpdateFeeSchedule,
  useFundedHoursList,
  useUpsertFundedHours,
} from '@/features/invoicing/hooks/use-invoicing';
import type { InvoiceStatus, FeeSchedule, FundedHours } from '@/types/invoicing';

// ---- Status styling ----
const statusVariantMap: Record<InvoiceStatus, string> = {
  DRAFT: 'outline',
  SENT: 'secondary',
  PAID: 'default',
  PARTIAL: 'secondary',
  OVERDUE: 'destructive',
  VOID: 'ghost',
};

const statusClassMap: Record<InvoiceStatus, string> = {
  DRAFT: '',
  SENT: '',
  PAID: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400',
  PARTIAL: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
  OVERDUE: '',
  VOID: 'bg-muted text-muted-foreground',
};

const statusLabel: Record<InvoiceStatus, string> = {
  DRAFT: 'Draft',
  SENT: 'Sent',
  PAID: 'Paid',
  PARTIAL: 'Partial',
  OVERDUE: 'Overdue',
  VOID: 'Void',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
}

// ===== MAIN PAGE =====
export function InvoicesPage() {
  return (
    <div>
      <PageHeader
        title="Invoicing & Billing"
        description="Manage invoices, fee schedules, and funded hours"
        action={
          <Link to="/invoicing/new">
            <Button>
              <Plus className="size-4" />
              Create Invoice
            </Button>
          </Link>
        }
      />

      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">
            <Receipt className="size-4" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="fee-schedules">
            <PoundSterling className="size-4" />
            Fee Schedules
          </TabsTrigger>
          <TabsTrigger value="funded-hours">
            <GraduationCap className="size-4" />
            Funded Hours
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-4">
          <InvoicesTab />
        </TabsContent>

        <TabsContent value="fee-schedules" className="mt-4">
          <FeeSchedulesTab />
        </TabsContent>

        <TabsContent value="funded-hours" className="mt-4">
          <FundedHoursTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ===== INVOICES TAB =====
function InvoicesTab() {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const params = statusFilter !== 'ALL' ? { status: statusFilter } : undefined;
  const { data: invoices, isLoading } = useInvoices(params);

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="SENT">Sent</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="PARTIAL">Partial</SelectItem>
            <SelectItem value="OVERDUE">Overdue</SelectItem>
            <SelectItem value="VOID">Void</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : invoices?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <p className="text-lg font-medium">No invoices found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first invoice to get started.
          </p>
          <Link to="/invoicing/new" className="mt-4">
            <Button>
              <Plus className="size-4" />
              Create Invoice
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Child</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices?.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    <Link
                      to={`/invoicing/${invoice.id}`}
                      className="text-primary hover:underline"
                    >
                      {invoice.invoiceNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {invoice.parent
                      ? `${invoice.parent.firstName} ${invoice.parent.lastName}`
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {invoice.child
                      ? `${invoice.child.firstName} ${invoice.child.lastName}`
                      : '—'}
                  </TableCell>
                  <TableCell>{formatCurrency(invoice.total)}</TableCell>
                  <TableCell>{format(parseISO(invoice.dueDate), 'dd MMM yyyy')}</TableCell>
                  <TableCell>
                    <Badge
                      variant={statusVariantMap[invoice.status] as 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost'}
                      className={statusClassMap[invoice.status]}
                    >
                      {statusLabel[invoice.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Link to={`/invoicing/${invoice.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ===== FEE SCHEDULES TAB =====
function FeeSchedulesTab() {
  const { data: feeSchedules, isLoading } = useFeeSchedules();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<FeeSchedule | null>(null);

  const openCreate = () => {
    setEditingSchedule(null);
    setDialogOpen(true);
  };

  const openEdit = (schedule: FeeSchedule) => {
    setEditingSchedule(schedule);
    setDialogOpen(true);
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Add Fee Schedule
        </Button>
      </div>

      <FeeScheduleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingSchedule={editingSchedule}
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : feeSchedules?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <p className="text-lg font-medium">No fee schedules yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a fee schedule to use when creating invoices.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Session Type</TableHead>
                <TableHead>Hours / Session</TableHead>
                <TableHead>Rate / Session</TableHead>
                <TableHead>Rate / Hour</TableHead>
                <TableHead>Active</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feeSchedules?.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">{schedule.name}</TableCell>
                  <TableCell>{schedule.sessionType}</TableCell>
                  <TableCell>{schedule.hoursPerSession}</TableCell>
                  <TableCell>{formatCurrency(schedule.ratePerSession)}</TableCell>
                  <TableCell>{formatCurrency(schedule.ratePerHour)}</TableCell>
                  <TableCell>
                    <Badge variant={schedule.isActive ? 'default' : 'secondary'}>
                      {schedule.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(schedule)}>
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ---- Fee Schedule Dialog ----
function FeeScheduleDialog({
  open,
  onOpenChange,
  editingSchedule,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSchedule: FeeSchedule | null;
}) {
  const createFeeSchedule = useCreateFeeSchedule();
  const updateFeeSchedule = useUpdateFeeSchedule();

  const [name, setName] = useState('');
  const [sessionType, setSessionType] = useState('');
  const [hoursPerSession, setHoursPerSession] = useState('');
  const [ratePerSession, setRatePerSession] = useState('');
  const [ratePerHour, setRatePerHour] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Reset form when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && editingSchedule) {
      setName(editingSchedule.name);
      setSessionType(editingSchedule.sessionType);
      setHoursPerSession(String(editingSchedule.hoursPerSession));
      setRatePerSession(String(editingSchedule.ratePerSession));
      setRatePerHour(String(editingSchedule.ratePerHour));
      setIsActive(editingSchedule.isActive);
    } else if (newOpen) {
      setName('');
      setSessionType('');
      setHoursPerSession('');
      setRatePerSession('');
      setRatePerHour('');
      setIsActive(true);
    }
    onOpenChange(newOpen);
  };

  // Ensure values sync when editingSchedule changes and dialog is already open
  if (open && editingSchedule && name === '' && editingSchedule.name !== '') {
    setName(editingSchedule.name);
    setSessionType(editingSchedule.sessionType);
    setHoursPerSession(String(editingSchedule.hoursPerSession));
    setRatePerSession(String(editingSchedule.ratePerSession));
    setRatePerHour(String(editingSchedule.ratePerHour));
    setIsActive(editingSchedule.isActive);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const data = {
      name,
      sessionType,
      hoursPerSession: Number(hoursPerSession),
      ratePerSession: Number(ratePerSession),
      ratePerHour: Number(ratePerHour),
      isActive,
    };

    try {
      if (editingSchedule) {
        await updateFeeSchedule.mutateAsync({ id: editingSchedule.id, data });
        toast.success('Fee schedule updated');
      } else {
        await createFeeSchedule.mutateAsync(data);
        toast.success('Fee schedule created');
      }
      onOpenChange(false);
    } catch {
      toast.error('Failed to save fee schedule');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editingSchedule ? 'Edit Fee Schedule' : 'Add Fee Schedule'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fs-name">Name</Label>
            <Input
              id="fs-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Full Day Session"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fs-sessionType">Session Type</Label>
            <Input
              id="fs-sessionType"
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              placeholder="e.g. FULL_DAY, HALF_DAY, HOURLY"
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fs-hours">Hours / Session</Label>
              <Input
                id="fs-hours"
                type="number"
                step="0.5"
                min="0"
                value={hoursPerSession}
                onChange={(e) => setHoursPerSession(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fs-rateSession">Rate / Session</Label>
              <Input
                id="fs-rateSession"
                type="number"
                step="0.01"
                min="0"
                value={ratePerSession}
                onChange={(e) => setRatePerSession(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fs-rateHour">Rate / Hour</Label>
              <Input
                id="fs-rateHour"
                type="number"
                step="0.01"
                min="0"
                value={ratePerHour}
                onChange={(e) => setRatePerHour(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="fs-active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="size-4 rounded border-input"
            />
            <Label htmlFor="fs-active">Active</Label>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : editingSchedule ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ===== FUNDED HOURS TAB =====
function FundedHoursTab() {
  const { data: fundedHours, isLoading } = useFundedHoursList();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFunded, setEditingFunded] = useState<FundedHours | null>(null);

  const openEdit = (funded: FundedHours) => {
    setEditingFunded(funded);
    setDialogOpen(true);
  };

  return (
    <div>
      <FundedHoursDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingFunded={editingFunded}
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : fundedHours?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <p className="text-lg font-medium">No funded hours configured</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Funded hours will appear here once assigned to children.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {fundedHours?.map((funded) => (
            <Card key={funded.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">
                  {funded.child
                    ? `${funded.child.firstName} ${funded.child.lastName}`
                    : 'Unknown Child'}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => openEdit(funded)}>
                  <Pencil className="size-3.5" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Hours / Week</span>
                    <span className="font-medium">{funded.hoursPerWeek}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Funding Type</span>
                    <Badge variant="secondary">{funded.fundingType}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Term Period</span>
                    <span className="text-xs">
                      {format(parseISO(funded.termStartDate), 'dd MMM yyyy')} -{' '}
                      {format(parseISO(funded.termEndDate), 'dd MMM yyyy')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Funded Hours Dialog ----
function FundedHoursDialog({
  open,
  onOpenChange,
  editingFunded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingFunded: FundedHours | null;
}) {
  const upsertFundedHours = useUpsertFundedHours();

  const [hoursPerWeek, setHoursPerWeek] = useState('');
  const [fundingType, setFundingType] = useState('');
  const [termStartDate, setTermStartDate] = useState('');
  const [termEndDate, setTermEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && editingFunded) {
      setHoursPerWeek(String(editingFunded.hoursPerWeek));
      setFundingType(editingFunded.fundingType);
      setTermStartDate(editingFunded.termStartDate.split('T')[0]);
      setTermEndDate(editingFunded.termEndDate.split('T')[0]);
    } else if (newOpen) {
      setHoursPerWeek('');
      setFundingType('');
      setTermStartDate('');
      setTermEndDate('');
    }
    onOpenChange(newOpen);
  };

  if (open && editingFunded && hoursPerWeek === '' && editingFunded.hoursPerWeek > 0) {
    setHoursPerWeek(String(editingFunded.hoursPerWeek));
    setFundingType(editingFunded.fundingType);
    setTermStartDate(editingFunded.termStartDate.split('T')[0]);
    setTermEndDate(editingFunded.termEndDate.split('T')[0]);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFunded) return;

    setSubmitting(true);
    try {
      await upsertFundedHours.mutateAsync({
        childId: editingFunded.childId,
        data: {
          hoursPerWeek: Number(hoursPerWeek),
          fundingType,
          termStartDate,
          termEndDate,
        },
      });
      toast.success('Funded hours updated');
      onOpenChange(false);
    } catch {
      toast.error('Failed to update funded hours');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Edit Funded Hours
            {editingFunded?.child &&
              ` - ${editingFunded.child.firstName} ${editingFunded.child.lastName}`}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fh-hours">Hours per Week</Label>
              <Input
                id="fh-hours"
                type="number"
                step="0.5"
                min="0"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fh-type">Funding Type</Label>
              <Select value={fundingType} onValueChange={setFundingType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15_HOURS">15 Hours (Universal)</SelectItem>
                  <SelectItem value="30_HOURS">30 Hours (Extended)</SelectItem>
                  <SelectItem value="2_YEAR_OLD">2-Year-Old Funding</SelectItem>
                  <SelectItem value="EYPP">EYPP</SelectItem>
                  <SelectItem value="DAF">DAF</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fh-start">Term Start</Label>
              <Input
                id="fh-start"
                type="date"
                value={termStartDate}
                onChange={(e) => setTermStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fh-end">Term End</Label>
              <Input
                id="fh-end"
                type="date"
                value={termEndDate}
                onChange={(e) => setTermEndDate(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Update'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
