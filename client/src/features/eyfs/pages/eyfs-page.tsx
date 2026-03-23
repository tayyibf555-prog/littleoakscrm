import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ClipboardCheck, TrendingUp } from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
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

import { useChildren } from '@/features/children/hooks/use-children';
import {
  useMilestones,
  useChildAssessments,
  useChildProgress,
  useCreateAssessment,
  useUpdateAssessment,
} from '@/features/eyfs/hooks/use-eyfs';
import { useAuth } from '@/providers/auth-provider';
import type { EyfsArea, AssessmentStatus, EyfsMilestone, EyfsAssessment } from '@/types/eyfs';
import {
  EYFS_AREA_LABELS,
  ASSESSMENT_STATUS_LABELS,
} from '@/types/eyfs';

const EYFS_AREAS: EyfsArea[] = ['CL', 'PD', 'PSED', 'L', 'M', 'UW', 'EAD'];

const STATUS_OPTIONS: AssessmentStatus[] = ['NOT_YET', 'EMERGING', 'DEVELOPING', 'SECURE', 'EXCEEDING'];

function getProgressColor(percent: number): string {
  if (percent < 25) return 'bg-red-500';
  if (percent <= 50) return 'bg-amber-500';
  return 'bg-green-500';
}

function getProgressTextColor(percent: number): string {
  if (percent < 25) return 'text-red-600';
  if (percent <= 50) return 'text-amber-600';
  return 'text-green-600';
}

function getStatusBadge(status: AssessmentStatus) {
  switch (status) {
    case 'NOT_YET':
      return <Badge variant="outline">{ASSESSMENT_STATUS_LABELS[status]}</Badge>;
    case 'EMERGING':
      return <Badge variant="default">{ASSESSMENT_STATUS_LABELS[status]}</Badge>;
    case 'DEVELOPING':
      return <Badge variant="secondary">{ASSESSMENT_STATUS_LABELS[status]}</Badge>;
    case 'SECURE':
      return <Badge variant="default" className="bg-green-600 hover:bg-green-700">{ASSESSMENT_STATUS_LABELS[status]}</Badge>;
    case 'EXCEEDING':
      return <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">{ASSESSMENT_STATUS_LABELS[status]}</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
}

// ===== MAIN PAGE =====
export function EyfsPage() {
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const { data: children, isLoading: childrenLoading } = useChildren({ status: 'ACTIVE' });

  return (
    <div>
      <PageHeader
        title="EYFS Milestone Tracking"
        description="Track Early Years Foundation Stage development milestones"
      />

      {/* Child Selector */}
      <div className="mb-6">
        <Label className="mb-2 block text-sm font-medium">Select Child</Label>
        {childrenLoading ? (
          <Skeleton className="h-8 w-64" />
        ) : (
          <Select value={selectedChildId} onValueChange={setSelectedChildId}>
            <SelectTrigger className="w-72">
              <SelectValue placeholder="Choose a child..." />
            </SelectTrigger>
            <SelectContent>
              {children?.map((child) => (
                <SelectItem key={child.id} value={child.id}>
                  {child.firstName} {child.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {!selectedChildId ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <ClipboardCheck className="size-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">Select a child to begin</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a child from the dropdown above to view and track their EYFS milestones.
          </p>
        </div>
      ) : (
        <ChildEyfsView childId={selectedChildId} />
      )}
    </div>
  );
}

// ===== CHILD EYFS VIEW =====
function ChildEyfsView({ childId }: { childId: string }) {
  const { data: progress, isLoading: progressLoading } = useChildProgress(childId);
  const { data: milestones, isLoading: milestonesLoading } = useMilestones();
  const { data: assessments, isLoading: assessmentsLoading } = useChildAssessments(childId);

  const isLoading = progressLoading || milestonesLoading || assessmentsLoading;

  // Build a map from milestoneId -> assessment for quick lookup
  const assessmentMap = useMemo(() => {
    const map = new Map<string, EyfsAssessment>();
    if (assessments) {
      for (const assessment of assessments) {
        map.set(assessment.milestoneId, assessment);
      }
    }
    return map;
  }, [assessments]);

  // Build a map from area -> progress report
  const progressMap = useMemo(() => {
    const map = new Map<EyfsArea, (typeof progress extends (infer U)[] | undefined ? U : never)>();
    if (progress) {
      for (const item of progress) {
        map.set(item.area, item);
      }
    }
    return map;
  }, [progress]);

  // Group milestones by area
  const milestonesByArea = useMemo(() => {
    const map = new Map<EyfsArea, EyfsMilestone[]>();
    if (milestones) {
      for (const milestone of milestones) {
        const existing = map.get(milestone.area) ?? [];
        existing.push(milestone);
        map.set(milestone.area, existing);
      }
      // Sort each area's milestones by sortOrder
      for (const [area, items] of map) {
        map.set(area, items.sort((a, b) => a.sortOrder - b.sortOrder));
      }
    }
    return map;
  }, [milestones]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview Cards */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <TrendingUp className="size-5" />
          Progress Overview
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {EYFS_AREAS.map((area) => {
            const report = progressMap.get(area);
            const percent = report?.progressPercent ?? 0;

            return (
              <Card key={area}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{EYFS_AREA_LABELS[area]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold ${getProgressTextColor(percent)}`}>
                      {Math.round(percent)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {report?.secure ?? 0}/{report?.totalMilestones ?? 0} secure
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${getProgressColor(percent)}`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {report?.assessed ?? 0} of {report?.totalMilestones ?? 0} assessed
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Detailed Area Tabs */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Milestones by Area</h2>
        <Tabs defaultValue="CL">
          <TabsList className="flex-wrap">
            {EYFS_AREAS.map((area) => (
              <TabsTrigger key={area} value={area}>
                {area}
              </TabsTrigger>
            ))}
          </TabsList>

          {EYFS_AREAS.map((area) => (
            <TabsContent key={area} value={area} className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{EYFS_AREA_LABELS[area]}</CardTitle>
                </CardHeader>
                <CardContent>
                  <MilestoneList
                    childId={childId}
                    milestones={milestonesByArea.get(area) ?? []}
                    assessmentMap={assessmentMap}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

// ===== MILESTONE LIST =====
function MilestoneList({
  childId,
  milestones,
  assessmentMap,
}: {
  childId: string;
  milestones: EyfsMilestone[];
  assessmentMap: Map<string, EyfsAssessment>;
}) {
  const [assessDialogOpen, setAssessDialogOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<EyfsMilestone | null>(null);
  const [existingAssessment, setExistingAssessment] = useState<EyfsAssessment | null>(null);

  const openAssessDialog = (milestone: EyfsMilestone) => {
    const existing = assessmentMap.get(milestone.id) ?? null;
    setSelectedMilestone(milestone);
    setExistingAssessment(existing);
    setAssessDialogOpen(true);
  };

  if (milestones.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No milestones available for this area.</p>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {milestones.map((milestone) => {
          const assessment = assessmentMap.get(milestone.id);

          return (
            <div
              key={milestone.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{milestone.description}</p>
                <p className="text-xs text-muted-foreground">Age range: {milestone.ageRange}</p>
              </div>
              <div className="flex items-center gap-3">
                {assessment ? (
                  getStatusBadge(assessment.status)
                ) : (
                  <Badge variant="outline">Not Assessed</Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openAssessDialog(milestone)}
                >
                  {assessment ? 'Update' : 'Assess'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={assessDialogOpen} onOpenChange={setAssessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedMilestone && (
            <AssessmentForm
              childId={childId}
              milestone={selectedMilestone}
              existingAssessment={existingAssessment}
              onClose={() => setAssessDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ===== ASSESSMENT FORM =====
function AssessmentForm({
  childId,
  milestone,
  existingAssessment,
  onClose,
}: {
  childId: string;
  milestone: EyfsMilestone;
  existingAssessment: EyfsAssessment | null;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const createAssessment = useCreateAssessment();
  const updateAssessment = useUpdateAssessment();

  const [status, setStatus] = useState<AssessmentStatus>(
    existingAssessment?.status ?? 'NOT_YET'
  );
  const [assessedDate, setAssessedDate] = useState(
    existingAssessment?.assessedDate
      ? existingAssessment.assessedDate.split('T')[0]
      : format(new Date(), 'yyyy-MM-dd')
  );
  const [evidenceNotes, setEvidenceNotes] = useState(
    existingAssessment?.evidenceNotes ?? ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (existingAssessment) {
        await updateAssessment.mutateAsync({
          assessmentId: existingAssessment.id,
          data: {
            status,
            assessedDate,
            evidenceNotes: evidenceNotes || undefined,
          },
        });
        toast.success('Assessment updated successfully');
      } else {
        await createAssessment.mutateAsync({
          childId,
          data: {
            milestoneId: milestone.id,
            status,
            assessedBy: user?.id ?? '',
            assessedDate,
            evidenceNotes: evidenceNotes || undefined,
          },
        });
        toast.success('Assessment recorded successfully');
      }
      onClose();
    } catch {
      toast.error('Failed to save assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {existingAssessment ? 'Update Assessment' : 'Record Assessment'}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm font-medium">{milestone.description}</p>
          <p className="text-xs text-muted-foreground">
            {EYFS_AREA_LABELS[milestone.area]} - Age range: {milestone.ageRange}
          </p>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(val) => setStatus(val as AssessmentStatus)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {ASSESSMENT_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="assessed-date">Assessment Date</Label>
          <Input
            id="assessed-date"
            type="date"
            value={assessedDate}
            onChange={(e) => setAssessedDate(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="evidence-notes">Evidence Notes</Label>
          <Textarea
            id="evidence-notes"
            value={evidenceNotes}
            onChange={(e) => setEvidenceNotes(e.target.value)}
            rows={3}
            placeholder="Describe the evidence observed..."
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : existingAssessment ? 'Update' : 'Save'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
