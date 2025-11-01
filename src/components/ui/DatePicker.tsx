
import React, { useState, useMemo } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

interface DatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
  selectedDate: Date | null;
  minDate?: Date;
}

const DatePicker: React.FC<DatePickerProps> = ({ isOpen, onClose, onSelectDate, selectedDate, minDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const calendarGrid = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (Date | null)[] = [];
    
    // Add padding for days from previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Add days of the current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };
  
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 mt-2 w-72 bg-[rgba(var(--background-primary-rgb))] rounded-lg shadow-lg border border-[rgba(var(--border-primary-rgb))] p-4 z-30 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <button type="button" onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))]">
          <HiChevronLeft className="w-5 h-5 text-[rgba(var(--foreground-secondary-rgb))]" />
        </button>
        <span className="font-bold text-[rgba(var(--foreground-primary-rgb))]">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <button type="button" onClick={handleNextMonth} className="p-1 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))]">
          <HiChevronRight className="w-5 h-5 text-[rgba(var(--foreground-secondary-rgb))]" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <div key={day} className="text-xs font-medium text-[rgba(var(--foreground-secondary-rgb))]">{day}</div>
        ))}
        {calendarGrid.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`}></div>;
          }
          
          const isSelected = selectedDate && isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);
          const isDisabled = minDate && date < minDate && !isSameDay(date, minDate);

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onSelectDate(date)}
              disabled={isDisabled}
              className={`
                w-9 h-9 flex items-center justify-center text-sm rounded-full transition-colors duration-150
                ${isDisabled ? 'text-[rgba(var(--foreground-secondary-rgb),0.5)] cursor-not-allowed' : 'text-[rgba(var(--foreground-primary-rgb))] hover:bg-[rgba(var(--background-tertiary-rgb))]'}
                ${isToday && !isSelected ? 'ring-1 ring-[rgba(var(--accent-rgb))]' : ''}
                ${isSelected ? 'bg-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-on-accent-rgb))] hover:opacity-90' : ''}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DatePicker;