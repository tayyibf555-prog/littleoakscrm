import { useState } from 'react';
import { Link } from 'react-router';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { Plus, AlertTriangle, Eye } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useIncidents, useCreateIncident } from '@/features/incidents/hooks/use-incidents';
import { useChildren } from '@/features/children/hooks/use-children';
import type { Incident, IncidentSeverity, IncidentStatus } from '@/types/incident';

const SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  MINOR: 'Minor',
  MODERATE: 'Moderate',
  SERIOUS: 'Serious',
};

const STATUS_LABELS: Record<IncidentStatus, string> = {
  OPEN: 'Open',
  SIGNED_OFF: 'Signed Off',
  CLOSED: 'Closed',
};

function getSeverityBadge(severity: IncidentSeverity) {
  switch (severity) {
    case 'MINOR':
      return <Badge variant="outline">{SEVERITY_LABELS[severity]}</Badge>;
    case 'MODERATE':
      return <Badge variant="secondary">{SEVERITY_LABELS[severity]}</Badge>;
    case 'SERIOUS':
      return <Badge variant="destructive">{SEVERITY_LABELS[severity]}</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

function getStatusBadge(status: IncidentStatus) {
  switch (status) {
    case 'OPEN':
      return <Badge variant="default">{STATUS_LABELS[status]}</Badge>;
    case 'SIGNED_OFF':
      return <Badge variant="secondary">{STATUS_LABELS[status]}</Badge>;
    case 'CLOSED':
      return <Badge variant="outline">{STATUS_LABELS[status]}</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

function getReportedByName(incident: Incident): string {
  const profile = incident.reportedBy?.staffProfile;
  if (profile) {
    return `${profile.firstName} ${profile.lastName}`;
  }
  return 'Unknown';
}

function getChildrenNames(incident: Incident): string {
  if (!incident.children || incident.children.length === 0) {
    return '--';
  }
  return incident.children
    .map((c) => `${c.child.firstName} ${c.child.lastName}`)
    .join(', ');
}

// ===== MAIN PAGE =====
export function IncidentsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { data: incidents, isLoading } = useIncidents();

  return (
    <div>
      <PageHeader
        title="Incident Reports"
        description="Record and manage incident reports"
        action={
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="size-4" />
            Report Incident
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !incidents || incidents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <AlertTriangle className="size-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">No incidents recorded</p>
          <p className="mt-1 text-sm text-muted-foreground">
            When incidents occur, report them here for proper documentation.
          </p>
          <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="size-4" />
            Report Incident
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Children Involved</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Location</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(parseISO(incident.date), 'dd MMM yyyy')}
                    <span className="ml-1 text-xs text-muted-foreground">{incident.time}</span>
                  </TableCell>
                  <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                  <TableCell>{getStatusBadge(incident.status)}</TableCell>
                  <TableCell className="max-w-48 truncate">
                    {getChildrenNames(incident)}
                  </TableCell>
                  <TableCell>{getReportedByName(incident)}</TableCell>
                  <TableCell>{incident.location}</TableCell>
                  <TableCell>
                    <Link to={`/incidents/${incident.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="size-4" />
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

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <CreateIncidentForm onClose={() => setCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===== CREATE INCIDENT FORM =====
function CreateIncidentForm({ onClose }: { onClose: () => void }) {
  const createIncident = useCreateIncident();
  const { data: children } = useChildren({ status: 'ACTIVE' });

  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [severity, setSeverity] = useState<IncidentSeverity>('MINOR');
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [witnesses, setWitnesses] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleChild = (childId: string) => {
    setSelectedChildren((prev) =>
      prev.includes(childId)
        ? prev.filter((id) => id !== childId)
        : [...prev, childId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location.trim()) {
      toast.error('Location is required');
      return;
    }
    if (!description.trim()) {
      toast.error('Description is required');
      return;
    }
    if (!actionTaken.trim()) {
      toast.error('Action taken is required');
      return;
    }
    if (selectedChildren.length === 0) {
      toast.error('Please select at least one child involved');
      return;
    }

    setIsSubmitting(true);

    try {
      await createIncident.mutateAsync({
        date,
        time,
        location: location.trim(),
        description: description.trim(),
        actionTaken: actionTaken.trim(),
        severity,
        childrenInvolved: selectedChildren,
        witnesses: witnesses.trim() || undefined,
      });
      toast.success('Incident reported successfully');
      onClose();
    } catch {
      toast.error('Failed to report incident');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Report Incident</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="incident-date">Date</Label>
            <Input
              id="incident-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="incident-time">Time</Label>
            <Input
              id="incident-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="incident-location">Location</Label>
          <Input
            id="incident-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Outdoor play area, Baby room..."
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Severity</Label>
          <Select value={severity} onValueChange={(val) => setSeverity(val as IncidentSeverity)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MINOR">Minor</SelectItem>
              <SelectItem value="MODERATE">Moderate</SelectItem>
              <SelectItem value="SERIOUS">Serious</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="incident-description">Description</Label>
          <Textarea
            id="incident-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe what happened..."
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="incident-action">Action Taken</Label>
          <Textarea
            id="incident-action"
            value={actionTaken}
            onChange={(e) => setActionTaken(e.target.value)}
            rows={3}
            placeholder="Describe the actions taken in response..."
            required
          />
        </div>

        {/* Children Multi-Select */}
        <div className="space-y-2">
          <Label>Children Involved</Label>
          <div className="max-h-40 overflow-y-auto rounded-lg border p-2">
            {!children || children.length === 0 ? (
              <p className="text-sm text-muted-foreground p-2">No active children found.</p>
            ) : (
              <div className="space-y-1">
                {children.map((child) => (
                  <label
                    key={child.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md p-1.5 hover:bg-muted"
                  >
                    <input
                      type="checkbox"
                      checked={selectedChildren.includes(child.id)}
                      onChange={() => toggleChild(child.id)}
                      className="size-4 rounded border-input"
                    />
                    <span className="text-sm">
                      {child.firstName} {child.lastName}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
          {selectedChildren.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {selectedChildren.length} child{selectedChildren.length > 1 ? 'ren' : ''} selected
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="incident-witnesses">Witnesses</Label>
          <Input
            id="incident-witnesses"
            value={witnesses}
            onChange={(e) => setWitnesses(e.target.value)}
            placeholder="Names of any witnesses..."
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
