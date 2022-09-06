import { ActionState } from '@store/session/models';
export interface CalendarItem {
  name: string;
  displayName?: string;
  description?: string;
  readRoles: string[];
  updateRoles: string[];
}
export interface CalendarService {
  calendars: Record<string, CalendarItem>;
  indicator?: Indicator;
}
export const defaultCalendar: CalendarItem = {
  name: '',
  displayName: '',
  description: '',
  readRoles: [],
  updateRoles: [],
};
export const CALENDAR_INIT: CalendarService = {
  calendars: null,
  indicator: {
    details: {},
  },
};
export interface Indicator {
  details?: Record<string, ActionState>;
}
