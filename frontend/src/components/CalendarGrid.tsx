// frontend/src/components/CalendarGrid.tsx
import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { ru } from 'date-fns/locale';
import { parse, startOfWeek, getDay, format } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { ru: ru };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const events = [
  {
    title: 'Поход в Карелию',
    start: new Date('2024-07-15T10:00:00'),
    end: new Date('2024-07-20T18:00:00'),
    allDay: false,
  },
];

const CalendarGrid: React.FC = () => (
  <Calendar
    localizer={localizer}
    events={events}
    startAccessor="start"
    endAccessor="end"
    style={{ height: 600 }}
  />
);

export default CalendarGrid;
