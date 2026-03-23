import { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
  isWithinInterval,
} from 'date-fns';
import { toast } from 'sonner';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  Clock,
  Trash2,
  Pencil,
  X,
} from 'lucide-react';

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  useCalendarEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from '@/features/calendar/hooks/use-calendar';
import type { CalendarEvent, EventType } from '@/types/calendar';
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from '@/types/calendar';

type ViewMode = 'calendar' | 'list';

const EVENT_TYPES: EventType[] = [
  'TERM_DATE',
  'HOLIDAY',
  'TRAINING',
  'PARENT_EVENT',
  'TRIP',
  'MEETING',
  'OTHER',
];

const DEFAULT_EVENT_FORM = {
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  allDay: true,
  eventType: 'OTHER' as EventType,
  isRecurring: false,
  color: '',
};

function getEventDotColor(eventType: EventType): string {
  const dotColors: Record<EventType, string> = {
    TERM_DATE: 'bg-blue-500',
    HOLIDAY: 'bg-green-500',
    TRAINING: 'bg-purple-500',
    PARENT_EVENT: 'bg-pink-500',
    TRIP: 'bg-orange-500',
    MEETING: 'bg-yellow-500',
    OTHER: 'bg-gray-500',
  };
  return dotColors[eventType];
}

function getEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events.filter((event) => {
    const eventStart = parseISO(event.startDate);
    const eventEnd = event.endDate ? parseISO(event.endDate) : eventStart;

    if (event.allDay) {
      const startDay = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
      const endDay = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate());
      const checkDay = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      return checkDay >= startDay && checkDay <= endDay;
    }

    return isSameDay(eventStart, day) || (event.endDate && isWithinInterval(day, { start: eventStart, end: eventEnd }));
  });
}

export function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [eventForm, setEventForm] = useState(DEFAULT_EVENT_FORM);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  // UK format: week starts on Monday
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const startDate = format(calendarStart, 'yyyy-MM-dd');
  const endDate = format(calendarEnd, 'yyyy-MM-dd');

  const { data: events, isLoading } = useCalendarEvents(startDate, endDate);
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  const calendarDays = useMemo(
    () => eachDayOfInterval({ start: calendarStart, end: calendarEnd }),
    [calendarStart.getTime(), calendarEnd.getTime()],
  );

  const selectedDayEvents = useMemo(() => {
    if (!selectedDay || !events) return [];
    return getEventsForDay(events, selectedDay);
  }, [selectedDay, events]);

  const sortedEvents = useMemo(() => {
    if (!events) return [];
    return [...events].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );
  }, [events]);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  function openCreateDialog(day?: Date) {
    setEditingEvent(null);
    setEventForm({
      ...DEFAULT_EVENT_FORM,
      startDate: day ? format(day, "yyyy-MM-dd'T'HH:mm") : '',
    });
    setDialogOpen(true);
  }

  function openEditDialog(event: CalendarEvent) {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description ?? '',
      startDate: event.allDay
        ? event.startDate.slice(0, 10)
        : event.startDate.slice(0, 16),
      endDate: event.endDate
        ? event.allDay
          ? event.endDate.slice(0, 10)
          : event.endDate.slice(0, 16)
        : '',
      allDay: event.allDay,
      eventType: event.eventType,
      isRecurring: event.isRecurring,
      color: event.color ?? '',
    });
    setDialogOpen(true);
  }

  async function handleSubmitEvent() {
    if (!eventForm.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!eventForm.startDate) {
      toast.error('Start date is required');
      return;
    }

    const payload = {
      title: eventForm.title.trim(),
      description: eventForm.description.trim() || undefined,
      startDate: eventForm.allDay
        ? `${eventForm.startDate.slice(0, 10)}T00:00:00.000Z`
        : new Date(eventForm.startDate).toISOString(),
      endDate: eventForm.endDate
        ? eventForm.allDay
          ? `${eventForm.endDate.slice(0, 10)}T23:59:59.000Z`
          : new Date(eventForm.endDate).toISOString()
        : undefined,
      allDay: eventForm.allDay,
      eventType: eventForm.eventType,
      isRecurring: eventForm.isRecurring,
      color: eventForm.color || undefined,
    };

    try {
      if (editingEvent) {
        await updateEvent.mutateAsync({ id: editingEvent.id, data: payload });
        toast.success('Event updated successfully');
      } else {
        await createEvent.mutateAsync(payload);
        toast.success('Event created successfully');
      }
      setDialogOpen(false);
      setEventForm(DEFAULT_EVENT_FORM);
      setEditingEvent(null);
    } catch {
      toast.error(editingEvent ? 'Failed to update event' : 'Failed to create event');
    }
  }

  async function handleDeleteEvent(eventId: string) {
    try {
      await deleteEvent.mutateAsync(eventId);
      toast.success('Event deleted successfully');
    } catch {
      toast.error('Failed to delete event');
    }
  }

  return (
    <div>
      <PageHeader
        title="Calendar"
        description="Manage nursery events, holidays, and important dates"
        action={
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg border">
              <Button
                variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <CalendarIcon className="size-4" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="size-4" />
                List
              </Button>
            </div>
            <Button onClick={() => openCreateDialog()}>
              <Plus className="size-4" />
              Add Event
            </Button>
          </div>
        }
      />

      {/* Month Navigation */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="size-4" />
          </Button>
          <h2 className="min-w-48 text-center text-lg font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setCurrentMonth(new Date());
            setSelectedDay(new Date());
          }}
        >
          Today
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : viewMode === 'calendar' ? (
        <div className="flex gap-6">
          {/* Calendar Grid */}
          <div className="flex-1">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-px border-b pb-2">
              {weekDays.map((day) => (
                <div key={day} className="py-1 text-center text-xs font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>

            {/* Day Cells */}
            <div className="grid grid-cols-7 gap-px">
              {calendarDays.map((day) => {
                const dayEvents = events ? getEventsForDay(events, day) : [];
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isToday = isSameDay(day, new Date());
                const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`
                      min-h-24 rounded-md border p-1.5 text-left transition-colors
                      ${isCurrentMonth ? 'bg-background' : 'bg-muted/30 text-muted-foreground'}
                      ${isSelected ? 'border-primary ring-1 ring-primary/30' : 'border-transparent hover:border-border'}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`
                          flex size-6 items-center justify-center rounded-full text-xs font-medium
                          ${isToday ? 'bg-primary text-primary-foreground' : ''}
                        `}
                      >
                        {format(day, 'd')}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-[10px] text-muted-foreground">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className={`truncate rounded px-1 py-0.5 text-[10px] leading-tight ${EVENT_TYPE_COLORS[event.eventType]}`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="px-1 text-[10px] text-muted-foreground">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Detail Panel */}
          <div className="w-80 shrink-0">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {selectedDay
                      ? format(selectedDay, 'EEEE, d MMMM yyyy')
                      : 'Select a day'}
                  </CardTitle>
                  {selectedDay && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setSelectedDay(null)}
                    >
                      <X className="size-3" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!selectedDay ? (
                  <p className="text-sm text-muted-foreground">
                    Click on a day to view its events.
                  </p>
                ) : selectedDayEvents.length === 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      No events on this day.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => openCreateDialog(selectedDay)}
                    >
                      <Plus className="size-3.5" />
                      Add Event
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDayEvents.map((event) => (
                      <div key={event.id} className="rounded-lg border p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-medium leading-tight">
                              {event.title}
                            </h4>
                            <Badge
                              variant="outline"
                              className={`mt-1 text-[10px] ${EVENT_TYPE_COLORS[event.eventType]}`}
                            >
                              {EVENT_TYPE_LABELS[event.eventType]}
                            </Badge>
                          </div>
                          <div className="flex shrink-0 gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => openEditDialog(event)}
                            >
                              <Pencil className="size-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleDeleteEvent(event.id)}
                            >
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </div>
                        {event.description && (
                          <p className="mt-1.5 text-xs text-muted-foreground">
                            {event.description}
                          </p>
                        )}
                        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="size-3" />
                          {event.allDay
                            ? 'All day'
                            : `${format(parseISO(event.startDate), 'HH:mm')}${event.endDate ? ` - ${format(parseISO(event.endDate), 'HH:mm')}` : ''}`}
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => openCreateDialog(selectedDay)}
                    >
                      <Plus className="size-3.5" />
                      Add Event
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {sortedEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
              <CalendarIcon className="mb-3 size-10 text-muted-foreground" />
              <p className="text-lg font-medium">No events this month</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first event to get started.
              </p>
              <Button className="mt-4" onClick={() => openCreateDialog()}>
                <Plus className="size-4" />
                Add Event
              </Button>
            </div>
          ) : (
            sortedEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/30"
              >
                <div className={`size-3 shrink-0 rounded-full ${getEventDotColor(event.eventType)}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium">{event.title}</h4>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${EVENT_TYPE_COLORS[event.eventType]}`}
                    >
                      {EVENT_TYPE_LABELS[event.eventType]}
                    </Badge>
                  </div>
                  {event.description && (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {event.description}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm">
                    {format(parseISO(event.startDate), 'dd MMM yyyy')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {event.allDay
                      ? 'All day'
                      : format(parseISO(event.startDate), 'HH:mm')}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => openEditDialog(event)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create / Edit Event Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Event' : 'Add Event'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event-title">Title</Label>
              <Input
                id="event-title"
                value={eventForm.title}
                onChange={(e) => setEventForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Event title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-description">Description (optional)</Label>
              <Textarea
                id="event-description"
                value={eventForm.description}
                onChange={(e) =>
                  setEventForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Event description"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={eventForm.allDay}
                  onChange={(e) =>
                    setEventForm((prev) => ({ ...prev, allDay: e.target.checked }))
                  }
                  className="size-4 rounded border-input"
                />
                All day
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event-start">Start Date</Label>
                <Input
                  id="event-start"
                  type={eventForm.allDay ? 'date' : 'datetime-local'}
                  value={eventForm.startDate}
                  onChange={(e) =>
                    setEventForm((prev) => ({ ...prev, startDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-end">End Date (optional)</Label>
                <Input
                  id="event-end"
                  type={eventForm.allDay ? 'date' : 'datetime-local'}
                  value={eventForm.endDate}
                  onChange={(e) =>
                    setEventForm((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select
                value={eventForm.eventType}
                onValueChange={(val) =>
                  setEventForm((prev) => ({ ...prev, eventType: val as EventType }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      <span className="flex items-center gap-2">
                        <span className={`inline-block size-2 rounded-full ${getEventDotColor(type)}`} />
                        {EVENT_TYPE_LABELS[type]}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="event-color">Colour (optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="event-color"
                  type="color"
                  value={eventForm.color || '#3b82f6'}
                  onChange={(e) =>
                    setEventForm((prev) => ({ ...prev, color: e.target.value }))
                  }
                  className="h-8 w-12 cursor-pointer p-0.5"
                />
                <Input
                  value={eventForm.color}
                  onChange={(e) =>
                    setEventForm((prev) => ({ ...prev, color: e.target.value }))
                  }
                  placeholder="#3b82f6"
                  className="flex-1"
                />
                {eventForm.color && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setEventForm((prev) => ({ ...prev, color: '' }))}
                  >
                    <X className="size-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSubmitEvent}
              disabled={createEvent.isPending || updateEvent.isPending}
            >
              {createEvent.isPending || updateEvent.isPending
                ? 'Saving...'
                : editingEvent
                  ? 'Update Event'
                  : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
