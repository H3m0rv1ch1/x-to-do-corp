
import React from 'react';

interface ReminderPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (offset: number | null) => void;
  currentOffset: number | null;
}

interface ReminderOption {
    offset: number | null;
    label: string;
}

const ReminderPicker: React.FC<ReminderPickerProps> = ({ isOpen, onClose, onSelect, currentOffset }) => {
  if (!isOpen) {
    return null;
  }

  const options: ReminderOption[] = [
    { offset: null, label: 'No reminder' },
    { offset: 0, label: 'At time of due date' },
    { offset: 5, label: '5 minutes before' },
    { offset: 15, label: '15 minutes before' },
    { offset: 60, label: '1 hour before' },
    { offset: 1440, label: '1 day before' },
  ];

  const handleSelect = (offset: number | null) => {
    onSelect(offset);
    onClose();
  };

  return (
    <div className="absolute top-full left-0 mt-2 w-56 bg-[rgba(var(--background-primary-rgb))] rounded-lg shadow-lg border border-[rgba(var(--border-primary-rgb))] p-2 z-30 animate-fade-in">
      <ul className="space-y-1">
        {options.map((option, index) => (
          <li key={index}>
            <button
              type="button"
              onClick={() => handleSelect(option.offset)}
              className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${
                currentOffset === option.offset
                  ? 'bg-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-on-accent-rgb))]'
                  : 'text-[rgba(var(--foreground-primary-rgb))] hover:bg-[rgba(var(--background-tertiary-rgb))]'
              }`}
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReminderPicker;