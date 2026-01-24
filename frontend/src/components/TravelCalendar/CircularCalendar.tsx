import React, { useState, useMemo } from 'react';
import { MockEvent } from './mockEvents';
import { categories } from './TravelCalendar';
import { getCategoryById } from './TravelCalendar';
import './CircularCalendar.css';

interface CircularCalendarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  events: MockEvent[];
  selectedDate: Date | null;
  onDateClick: (day: number, month: number, year: number) => void;
}

const monthNames = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const CircularCalendar: React.FC<CircularCalendarProps> = ({
  currentDate,
  onDateChange,
  onMonthChange,
  events,
  selectedDate,
  onDateClick
}) => {
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Генерируем 12 месяцев вокруг текущего
  const months = useMemo(() => {
    const result = [];
    for (let i = -6; i <= 6; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      result.push(date);
    }
    return result;
  }, [currentDate]);

  // Получаем дни для месяца
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const startDate = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
    const days: (number | null)[] = [];
    for (let i = 0; i < startDate; i++) days.push(null);
    for (let day = 1; day <= daysInMonth; day++) days.push(day);
    return days;
  };

  // Получаем события для даты
  const getEventsForDate = (day: number | null, monthDate: Date): MockEvent[] => {
    if (!day) return [];
    const dateKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateKey);
  };

  // Обработчик клика по месяцу
  const handleMonthClick = (monthDate: Date) => {
    onMonthChange(monthDate);
    setCarouselIndex(6); // Центрируем выбранный месяц
  };

  // Обработчик клика по дню
  const handleDayClick = (day: number | null, monthDate: Date) => {
    if (!day) return;
    onDateClick(day, monthDate.getMonth(), monthDate.getFullYear());
  };

  // Вычисляем угол для позиционирования месяцев в круге
  const getMonthPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const radius = 120;
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      rotation: (angle * 180) / Math.PI + 90
    };
  };

  const currentMonth = months[carouselIndex + 6];
  const days = getDaysInMonth(currentMonth);

  return (
    <div className="circular-calendar">
      {/* Заголовок с навигацией */}
      <div className="circular-calendar-header">
        <button
          className="circular-calendar-nav-btn"
          onClick={() => {
            if (carouselIndex > -6) {
              setCarouselIndex(carouselIndex - 1);
            }
          }}
          disabled={carouselIndex <= -6}
          aria-label="Предыдущий месяц"
        >
          ←
        </button>
        <h2 className="circular-calendar-title">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <button
          className="circular-calendar-nav-btn"
          onClick={() => {
            if (carouselIndex < 6) {
              setCarouselIndex(carouselIndex + 1);
            }
          }}
          disabled={carouselIndex >= 6}
          aria-label="Следующий месяц"
        >
          →
        </button>
      </div>

      {/* Круговая карусель месяцев */}
      <div className="circular-calendar-carousel">
        <div className="circular-calendar-carousel-inner">
          {months.map((monthDate, index) => {
            const isCurrent = index === carouselIndex + 6;
            const position = getMonthPosition(index - (carouselIndex + 6), months.length);
            const monthEvents = events.filter(event => {
              const eventDate = new Date(event.date);
              return eventDate.getMonth() === monthDate.getMonth() &&
                     eventDate.getFullYear() === monthDate.getFullYear();
            });

            return (
              <div
                key={`${monthDate.getFullYear()}-${monthDate.getMonth()}`}
                className={`circular-calendar-month-card ${isCurrent ? 'active' : ''}`}
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) rotate(${position.rotation}deg)`,
                  opacity: isCurrent ? 1 : 0.6,
                  zIndex: isCurrent ? 10 : 1
                }}
                onClick={() => handleMonthClick(monthDate)}
              >
                <div className="circular-calendar-month-content">
                  <div className="circular-calendar-month-name">
                    {monthNames[monthDate.getMonth()].substring(0, 3)}
                  </div>
                  {monthEvents.length > 0 && (
                    <div className="circular-calendar-month-events">
                      {monthEvents.length}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Сетка дней текущего месяца */}
      <div className="circular-calendar-days">
        <div className="circular-calendar-weekdays">
          {weekDays.map(day => (
            <div key={day} className="circular-calendar-weekday">
              {day}
            </div>
          ))}
        </div>
        <div className="circular-calendar-days-grid">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day, currentMonth);
            const hasEvents = dayEvents.length > 0;
            const isSelected = day && selectedDate &&
              selectedDate.getDate() === day &&
              selectedDate.getMonth() === currentMonth.getMonth() &&
              selectedDate.getFullYear() === currentMonth.getFullYear();
            const isToday = day && new Date().getDate() === day &&
              new Date().getMonth() === currentMonth.getMonth() &&
              new Date().getFullYear() === currentMonth.getFullYear();

            return (
              <div
                key={index}
                className={`circular-calendar-day-item ${
                  !day ? 'empty' : ''
                } ${hasEvents ? 'has-events' : ''} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                onClick={() => handleDayClick(day, currentMonth)}
              >
                {day && (
                  <>
                    <div className="circular-calendar-day-number">{day}</div>
                    {hasEvents && (
                      <div className="circular-calendar-day-events">
                        {dayEvents.slice(0, 2).map((event, idx) => {
                          const category = getCategoryById(event.categoryId);
                          if (!category) return null;
                          const Icon = category.icon as any;
                          return (
                            <div
                              key={idx}
                              className="circular-calendar-day-event-dot"
                              style={{ backgroundColor: category.color.replace('bg-', '#') }}
                              title={event.title}
                            />
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CircularCalendar;

