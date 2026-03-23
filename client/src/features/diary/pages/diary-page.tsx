import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  Utensils,
  Moon,
  Baby,
  Palette,
  Eye,
  Pill,
  StickyNote,
  Clock,
  Lock,
} from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
  useDiaryEntries,
  useCreateDiaryEntry,
  useDeleteDiaryEntry,
} from '@/features/diary/hooks/use-diary';
import { useChildren } from '@/features/children/hooks/use-children';
import type { DiaryEntry, DiaryEntryType } from '@/types/diary';

// ===== CONSTANTS =====
const ENTRY_TYPES: { value: DiaryEntryType; label: string }[] = [
  { value: 'MEAL', label: 'Meal' },
  { value: 'NAP', label: 'Nap' },
  { value: 'NAPPY', label: 'Nappy' },
  { value: 'ACTIVITY', label: 'Activity' },
  { value: 'OBSERVATION', label: 'Observation' },
  { value: 'MEDICATION', label: 'Medication' },
  { value: 'NOTE', label: 'Note' },
];

const entryTypeConfig: Record<
  DiaryEntryType,
  {
    label: string;
    icon: typeof Utensils;
    color: string;
    bgColor: string;
  }
> = {
  MEAL: {
    label: 'Meal',
    icon: Utensils,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  NAP: {
    label: 'Nap',
    icon: Moon,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
  NAPPY: {
    label: 'Nappy',
    icon: Baby,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
  },
  ACTIVITY: {
    label: 'Activity',
    icon: Palette,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  OBSERVATION: {
    label: 'Observation',
    icon: Eye,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  MEDICATION: {
    label: 'Medication',
    icon: Pill,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  NOTE: {
    label: 'Note',
    icon: StickyNote,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
  },
};

const entryTypeBadgeColor: Record<DiaryEntryType, string> = {
  MEAL: 'bg-orange-100 text-orange-700 border-orange-200',
  NAP: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  NAPPY: 'bg-pink-100 text-pink-700 border-pink-200',
  ACTIVITY: 'bg-green-100 text-green-700 border-green-200',
  OBSERVATION: 'bg-blue-100 text-blue-700 border-blue-200',
  MEDICATION: 'bg-red-100 text-red-700 border-red-200',
  NOTE: 'bg-amber-100 text-amber-700 border-amber-200',
};

const MEAL_TYPES = ['Breakfast', 'Morning Snack', 'Lunch', 'Afternoon Snack', 'Tea'];
const MEAL_AMOUNTS = ['All', 'Most', 'Some', 'Little', 'None'];
const NAP_QUALITIES = ['Good', 'Fair', 'Poor'];
const NAPPY_TYPES = ['Wet', 'Dirty', 'Both', 'Dry'];

// ===== MAIN PAGE =====
export function DiaryPage() {
  const [selectedDate, setSelectedDate] = useState(() =>
    format(new Date(), 'yyyy-MM-dd'),
  );
  const [childFilter, setChildFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: children } = useChildren({ status: 'ACTIVE' });
  const {
    data: entries,
    isLoading,
  } = useDiaryEntries(
    selectedDate,
    childFilter !== 'ALL' ? childFilter : undefined,
    typeFilter !== 'ALL' ? (typeFilter as DiaryEntryType) : undefined,
  );
  const createEntry = useCreateDiaryEntry();
  const deleteEntry = useDeleteDiaryEntry();

  // Group entries by time (hour), newest first
  const groupedEntries = useMemo(() => {
    if (!entries) return [];

    const sorted = [...entries].sort((a, b) => {
      // Sort by time descending (newest first)
      if (a.time > b.time) return -1;
      if (a.time < b.time) return 1;
      return 0;
    });

    const groups: { time: string; entries: DiaryEntry[] }[] = [];
    let currentHour = '';

    for (const entry of sorted) {
      const hour = entry.time.substring(0, 2) + ':00';
      if (hour !== currentHour) {
        currentHour = hour;
        groups.push({ time: hour, entries: [] });
      }
      groups[groups.length - 1].entries.push(entry);
    }

    return groups;
  }, [entries]);

  const handleDelete = async (id: string) => {
    try {
      await deleteEntry.mutateAsync(id);
      toast.success('Entry deleted');
    } catch {
      toast.error('Failed to delete entry');
    }
  };

  return (
    <div>
      <PageHeader
        title="Daily Diary"
        description="Record and track daily activities for each child"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button />}>
              <Plus className="size-4" />
              Add Entry
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New Diary Entry</DialogTitle>
              </DialogHeader>
              <CreateEntryForm
                children={children ?? []}
                selectedDate={selectedDate}
                onSubmit={async (data) => {
                  try {
                    await createEntry.mutateAsync(data);
                    toast.success('Entry created');
                    setDialogOpen(false);
                  } catch {
                    toast.error('Failed to create entry');
                  }
                }}
                isSubmitting={createEntry.isPending}
              />
            </DialogContent>
          </Dialog>
        }
      />

      {/* Filters */}
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

        <Select value={childFilter} onValueChange={(v) => setChildFilter(v ?? '')}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Children" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Children</SelectItem>
            {children?.map((child) => (
              <SelectItem key={child.id} value={child.id}>
                {child.firstName} {child.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? '')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            {ENTRY_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {entries && (
          <span className="ml-auto text-sm text-muted-foreground">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </span>
        )}
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : groupedEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <StickyNote className="size-10 text-muted-foreground" />
          <p className="mt-3 text-lg font-medium">No diary entries</p>
          <p className="mt-1 text-sm text-muted-foreground">
            No entries recorded for this date. Click "Add Entry" to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedEntries.map((group) => (
            <div key={group.time}>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-full bg-muted">
                  <Clock className="size-3 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {group.time}
                </span>
                <div className="flex-1 border-t" />
              </div>

              <div className="space-y-3 pl-8">
                {group.entries.map((entry) => (
                  <DiaryEntryCard
                    key={entry.id}
                    entry={entry}
                    onDelete={handleDelete}
                    isDeleting={deleteEntry.isPending}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== DIARY ENTRY CARD =====
function DiaryEntryCard({
  entry,
  onDelete,
  isDeleting,
}: {
  entry: DiaryEntry;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const config = entryTypeConfig[entry.entryType];
  const Icon = config.icon;
  const badgeColor = entryTypeBadgeColor[entry.entryType];

  const childName = entry.child
    ? `${entry.child.firstName} ${entry.child.lastName}`
    : 'Unknown';

  const authorName = entry.author?.staffProfile
    ? `${entry.author.staffProfile.firstName} ${entry.author.staffProfile.lastName}`
    : 'Unknown';

  const contentSummary = getContentSummary(entry.entryType, entry.content);

  return (
    <Card>
      <CardContent className="py-3">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${config.bgColor}`}
          >
            <Icon className={`size-4 ${config.color}`} />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{childName}</span>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${badgeColor}`}
              >
                {config.label}
              </span>
              {entry.isPrivate && (
                <Lock className="size-3 text-muted-foreground" />
              )}
              <span className="ml-auto text-xs text-muted-foreground">
                {entry.time}
              </span>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">{contentSummary}</p>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                By {authorName}
                {entry.child?.room?.name && (
                  <> &middot; {entry.child.room.name}</>
                )}
              </span>

              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onDelete(entry.id)}
                disabled={isDeleting}
              >
                <Trash2 className="size-3.5 text-destructive" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getContentSummary(
  entryType: DiaryEntryType,
  content: Record<string, unknown>,
): string {
  switch (entryType) {
    case 'MEAL': {
      const mealType = (content.mealType as string) ?? '';
      const amount = (content.amount as string) ?? '';
      return mealType && amount
        ? `${mealType} - Ate ${amount.toLowerCase()}`
        : mealType || 'Meal recorded';
    }
    case 'NAP': {
      const startTime = (content.startTime as string) ?? '';
      const endTime = (content.endTime as string) ?? '';
      const quality = (content.quality as string) ?? '';
      const parts: string[] = [];
      if (startTime && endTime) parts.push(`${startTime} - ${endTime}`);
      if (quality) parts.push(`Quality: ${quality}`);
      return parts.length > 0 ? parts.join(' | ') : 'Nap recorded';
    }
    case 'NAPPY': {
      const nappyType = (content.nappyType as string) ?? '';
      const notes = (content.notes as string) ?? '';
      return nappyType
        ? `${nappyType}${notes ? ` - ${notes}` : ''}`
        : 'Nappy change recorded';
    }
    case 'ACTIVITY': {
      const activityName = (content.activityName as string) ?? '';
      const description = (content.description as string) ?? '';
      return activityName
        ? `${activityName}${description ? `: ${description}` : ''}`
        : 'Activity recorded';
    }
    case 'OBSERVATION': {
      const text = (content.observationText as string) ?? '';
      return text || 'Observation recorded';
    }
    case 'MEDICATION': {
      const name = (content.medicationName as string) ?? '';
      const dosage = (content.dosage as string) ?? '';
      const at = (content.administeredAt as string) ?? '';
      const parts: string[] = [];
      if (name) parts.push(name);
      if (dosage) parts.push(dosage);
      if (at) parts.push(`at ${at}`);
      return parts.length > 0 ? parts.join(' - ') : 'Medication recorded';
    }
    case 'NOTE': {
      const noteText = (content.noteText as string) ?? '';
      return noteText || 'Note recorded';
    }
    default:
      return 'Entry recorded';
  }
}

// ===== CREATE ENTRY FORM =====
function CreateEntryForm({
  children,
  selectedDate,
  onSubmit,
  isSubmitting,
}: {
  children: { id: string; firstName: string; lastName: string }[];
  selectedDate: string;
  onSubmit: (data: {
    childId: string;
    date: string;
    time: string;
    entryType: DiaryEntryType;
    content: Record<string, unknown>;
    isPrivate: boolean;
  }) => Promise<void>;
  isSubmitting: boolean;
}) {
  const [childId, setChildId] = useState('');
  const [entryType, setEntryType] = useState<DiaryEntryType | ''>('');
  const [date, setDate] = useState(selectedDate);
  const [time, setTime] = useState(() => format(new Date(), 'HH:mm'));
  const [isPrivate, setIsPrivate] = useState(false);

  // Dynamic content state
  const [mealType, setMealType] = useState('');
  const [mealAmount, setMealAmount] = useState('');
  const [napStartTime, setNapStartTime] = useState('');
  const [napEndTime, setNapEndTime] = useState('');
  const [napQuality, setNapQuality] = useState('');
  const [nappyType, setNappyType] = useState('');
  const [nappyNotes, setNappyNotes] = useState('');
  const [activityName, setActivityName] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [observationText, setObservationText] = useState('');
  const [medicationName, setMedicationName] = useState('');
  const [medicationDosage, setMedicationDosage] = useState('');
  const [medicationAdministeredAt, setMedicationAdministeredAt] = useState('');
  const [noteText, setNoteText] = useState('');

  const buildContent = (): Record<string, unknown> => {
    switch (entryType) {
      case 'MEAL':
        return { mealType, amount: mealAmount };
      case 'NAP':
        return { startTime: napStartTime, endTime: napEndTime, quality: napQuality };
      case 'NAPPY':
        return { nappyType, notes: nappyNotes };
      case 'ACTIVITY':
        return { activityName, description: activityDescription };
      case 'OBSERVATION':
        return { observationText };
      case 'MEDICATION':
        return {
          medicationName,
          dosage: medicationDosage,
          administeredAt: medicationAdministeredAt,
        };
      case 'NOTE':
        return { noteText };
      default:
        return {};
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childId || !entryType || !date || !time) {
      toast.error('Please fill in all required fields');
      return;
    }
    await onSubmit({
      childId,
      date,
      time,
      entryType,
      content: buildContent(),
      isPrivate,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Child selector */}
      <div className="space-y-2">
        <Label>Child *</Label>
        <Select value={childId} onValueChange={(v) => setChildId(v ?? '')}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a child" />
          </SelectTrigger>
          <SelectContent>
            {children.map((child) => (
              <SelectItem key={child.id} value={child.id}>
                {child.firstName} {child.lastName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Entry type selector */}
      <div className="space-y-2">
        <Label>Entry Type *</Label>
        <Select
          value={entryType}
          onValueChange={(val) => setEntryType(val as DiaryEntryType)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select entry type" />
          </SelectTrigger>
          <SelectContent>
            {ENTRY_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date and time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date *</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Time *</Label>
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>

      {/* Dynamic content fields based on entry type */}
      {entryType === 'MEAL' && (
        <div className="space-y-4 rounded-lg border p-3">
          <div className="space-y-2">
            <Label>Meal Type</Label>
            <Select value={mealType} onValueChange={(v) => setMealType(v ?? '')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent>
                {MEAL_TYPES.map((mt) => (
                  <SelectItem key={mt} value={mt}>
                    {mt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Amount Eaten</Label>
            <Select value={mealAmount} onValueChange={(v) => setMealAmount(v ?? '')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select amount" />
              </SelectTrigger>
              <SelectContent>
                {MEAL_AMOUNTS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {entryType === 'NAP' && (
        <div className="space-y-4 rounded-lg border p-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={napStartTime}
                onChange={(e) => setNapStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="time"
                value={napEndTime}
                onChange={(e) => setNapEndTime(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Quality</Label>
            <Select value={napQuality} onValueChange={(v) => setNapQuality(v ?? '')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                {NAP_QUALITIES.map((q) => (
                  <SelectItem key={q} value={q}>
                    {q}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {entryType === 'NAPPY' && (
        <div className="space-y-4 rounded-lg border p-3">
          <div className="space-y-2">
            <Label>Nappy Type</Label>
            <Select value={nappyType} onValueChange={(v) => setNappyType(v ?? '')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {NAPPY_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input
              value={nappyNotes}
              onChange={(e) => setNappyNotes(e.target.value)}
              placeholder="Any additional notes..."
            />
          </div>
        </div>
      )}

      {entryType === 'ACTIVITY' && (
        <div className="space-y-4 rounded-lg border p-3">
          <div className="space-y-2">
            <Label>Activity Name</Label>
            <Input
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder="e.g. Painting, Outdoor Play"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={activityDescription}
              onChange={(e) => setActivityDescription(e.target.value)}
              placeholder="Describe the activity..."
              rows={3}
            />
          </div>
        </div>
      )}

      {entryType === 'OBSERVATION' && (
        <div className="space-y-4 rounded-lg border p-3">
          <div className="space-y-2">
            <Label>Observation</Label>
            <Textarea
              value={observationText}
              onChange={(e) => setObservationText(e.target.value)}
              placeholder="Record your observation..."
              rows={4}
            />
          </div>
        </div>
      )}

      {entryType === 'MEDICATION' && (
        <div className="space-y-4 rounded-lg border p-3">
          <div className="space-y-2">
            <Label>Medication Name</Label>
            <Input
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
              placeholder="e.g. Calpol"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Dosage</Label>
              <Input
                value={medicationDosage}
                onChange={(e) => setMedicationDosage(e.target.value)}
                placeholder="e.g. 5ml"
              />
            </div>
            <div className="space-y-2">
              <Label>Administered At</Label>
              <Input
                type="time"
                value={medicationAdministeredAt}
                onChange={(e) => setMedicationAdministeredAt(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {entryType === 'NOTE' && (
        <div className="space-y-4 rounded-lg border p-3">
          <div className="space-y-2">
            <Label>Note</Label>
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write your note..."
              rows={4}
            />
          </div>
        </div>
      )}

      {/* Private toggle */}
      <div className="flex items-center gap-2">
        <input
          id="diary-private"
          type="checkbox"
          checked={isPrivate}
          onChange={(e) => setIsPrivate(e.target.checked)}
          className="size-4 rounded border-input"
        />
        <Label htmlFor="diary-private">
          Private entry (only visible to staff)
        </Label>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Create Entry'}
        </Button>
      </DialogFooter>
    </form>
  );
}
