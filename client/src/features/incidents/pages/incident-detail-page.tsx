import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { ArrowLeft, Shield, Bell, CheckCircle2 } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useIncident,
  useSignoffIncident,
  useNotifyParent,
} from '@/features/incidents/hooks/use-incidents';

const severityVariant: Record<string, 'outline' | 'secondary' | 'destructive'> = {
  MINOR: 'outline',
  MODERATE: 'secondary',
  SERIOUS: 'destructive',
};

const statusVariant: Record<string, 'destructive' | 'secondary' | 'default'> = {
  OPEN: 'destructive',
  SIGNED_OFF: 'secondary',
  CLOSED: 'default',
};

export function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: incident, isLoading } = useIncident(id!);
  const signoff = useSignoffIncident();
  const notify = useNotifyParent();

  const [signoffDialogOpen, setSignoffDialogOpen] = useState(false);
  const [signoffNotes, setSignoffNotes] = useState('');
  const [notifyDialogOpen, setNotifyDialogOpen] = useState(false);
  const [notificationMethod, setNotificationMethod] = useState('PHONE');

  const handleSignoff = async () => {
    try {
      await signoff.mutateAsync({ id: id!, notes: signoffNotes || undefined });
      toast.success('Incident signed off');
      setSignoffDialogOpen(false);
    } catch {
      toast.error('Failed to sign off');
    }
  };

  const handleNotify = async () => {
    try {
      await notify.mutateAsync({
        id: id!,
        notifiedAt: new Date().toISOString(),
        notifiedBy: 'current-user',
        notificationMethod,
      });
      toast.success('Parent notification recorded');
      setNotifyDialogOpen(false);
    } catch {
      toast.error('Failed to record notification');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!incident) {
    return <p className="text-muted-foreground">Incident not found.</p>;
  }

  return (
    <div>
      <PageHeader
        title={`Incident Report`}
        description={`${format(parseISO(incident.date), 'dd MMM yyyy')} at ${incident.time}`}
        action={
          <Link to="/incidents">
            <Button variant="outline">
              <ArrowLeft className="size-4" />
              Back
            </Button>
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Main details */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CardTitle>Incident Details</CardTitle>
                <Badge variant={severityVariant[incident.severity] ?? 'outline'}>{incident.severity}</Badge>
                <Badge variant={statusVariant[incident.status] ?? 'default'}>{incident.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Location</Label>
                <p className="text-sm">{incident.location}</p>
              </div>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground">Description</Label>
                <p className="text-sm whitespace-pre-wrap">{incident.description}</p>
              </div>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground">Action Taken</Label>
                <p className="text-sm whitespace-pre-wrap">{incident.actionTaken}</p>
              </div>
              {incident.witnesses && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-xs text-muted-foreground">Witnesses</Label>
                    <p className="text-sm">{incident.witnesses}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Children involved */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Children Involved</CardTitle>
            </CardHeader>
            <CardContent>
              {incident.children?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No children recorded</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {incident.children?.map((ic) => (
                    <Link key={ic.child.id} to={`/children/${ic.child.id}`}>
                      <Badge variant="secondary">
                        {ic.child.firstName} {ic.child.lastName}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Reported by */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Reported By</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {incident.reportedBy?.staffProfile
                  ? `${incident.reportedBy.staffProfile.firstName} ${incident.reportedBy.staffProfile.lastName}`
                  : 'Unknown'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {format(parseISO(incident.createdAt), 'dd MMM yyyy HH:mm')}
              </p>
            </CardContent>
          </Card>

          {/* Sign off */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="size-4" />
                Sign Off
              </CardTitle>
            </CardHeader>
            <CardContent>
              {incident.signedOffById ? (
                <div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="size-4" />
                    <span className="text-sm font-medium">Signed off</span>
                  </div>
                  <p className="mt-1 text-sm">
                    {incident.signedOffBy?.staffProfile
                      ? `${incident.signedOffBy.staffProfile.firstName} ${incident.signedOffBy.staffProfile.lastName}`
                      : 'Unknown'}
                  </p>
                  {incident.signedOffAt && (
                    <p className="text-xs text-muted-foreground">{format(parseISO(incident.signedOffAt), 'dd MMM yyyy HH:mm')}</p>
                  )}
                  {incident.signedOffNotes && (
                    <p className="mt-2 text-sm text-muted-foreground">{incident.signedOffNotes}</p>
                  )}
                </div>
              ) : (
                <Dialog open={signoffDialogOpen} onOpenChange={setSignoffDialogOpen}>
                  <DialogTrigger render={<Button className="w-full" />}>
                    <Shield className="size-4" />
                    Sign Off Incident
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Sign Off Incident</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Notes (optional)</Label>
                        <Textarea
                          value={signoffNotes}
                          onChange={(e) => setSignoffNotes(e.target.value)}
                          placeholder="Add any sign-off notes..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleSignoff} disabled={signoff.isPending}>
                        {signoff.isPending ? 'Signing off...' : 'Confirm Sign Off'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>

          {/* Parent notification */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="size-4" />
                Parent Notification
              </CardTitle>
            </CardHeader>
            <CardContent>
              {incident.parentNotified ? (
                <div>
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="size-4" />
                    <span className="text-sm font-medium">Parent notified</span>
                  </div>
                  {incident.parentNotifiedAt && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {format(parseISO(incident.parentNotifiedAt), 'dd MMM yyyy HH:mm')} via {incident.notificationMethod}
                    </p>
                  )}
                </div>
              ) : (
                <Dialog open={notifyDialogOpen} onOpenChange={setNotifyDialogOpen}>
                  <DialogTrigger render={<Button variant="outline" className="w-full" />}>
                    <Bell className="size-4" />
                    Record Notification
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Record Parent Notification</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Notification Method</Label>
                        <Select value={notificationMethod} onValueChange={(v) => setNotificationMethod(v ?? '')}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PHONE">Phone Call</SelectItem>
                            <SelectItem value="IN_PERSON">In Person</SelectItem>
                            <SelectItem value="EMAIL">Email</SelectItem>
                            <SelectItem value="MESSAGE">Message</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleNotify} disabled={notify.isPending}>
                        {notify.isPending ? 'Recording...' : 'Confirm'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
