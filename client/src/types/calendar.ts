export type EventType = 'TERM_DATE' | 'HOLIDAY' | 'TRAINING' | 'PARENT_EVENT' | 'TRIP' | 'MEETING' | 'OTHER';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  allDay: boolean;
  eventType: EventType;
  isRecurring: boolean;
  recurrenceRule: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  TERM_DATE: 'Term Date',
  HOLIDAY: 'Holiday',
  TRAINING: 'Training',
  PARENT_EVENT: 'Parent Event',
  TRIP: 'Trip',
  MEETING: 'Meeting',
  OTHER: 'Other',
};

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  TERM_DATE: 'bg-blue-100 text-blue-800 border-blue-200',
  HOLIDAY: 'bg-green-100 text-green-800 border-green-200',
  TRAINING: 'bg-purple-100 text-purple-800 border-purple-200',
  PARENT_EVENT: 'bg-pink-100 text-pink-800 border-pink-200',
  TRIP: 'bg-orange-100 text-orange-800 border-orange-200',
  MEETING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  OTHER: 'bg-gray-100 text-gray-800 border-gray-200',
};
