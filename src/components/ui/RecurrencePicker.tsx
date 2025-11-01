
import React from 'react';
import { type RecurrenceType } from '@/types';

interface RecurrencePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (rule: { type: RecurrenceType } | null) => void;
  currentRule: { type: RecurrenceType } | null;
}

const RecurrencePicker: React.FC<RecurrencePickerProps> = ({ isOpen, onClose, onSelect, currentRule }) => {
  if (!isOpen) {
    return null;
  }

  const options: ({ type: RecurrenceType } | null)[] = [
    null,
    { type: 'daily' },
    { type: 'weekly' },
    { type: 'monthly' },
    { type: 'yearly' },
  ];

  const handleSelect = (rule: { type: RecurrenceType } | null) => {
    onSelect(rule);
    onClose();
  };

  const getLabel = (rule: { type: RecurrenceType } | null) => {
    if (!rule) return 'Does not repeat';
    return rule.type.charAt(0).toUpperCase() + rule.type.slice(1);
  };

  return (
    <div className="absolute top-full left-0 mt-2 w-48 bg-[rgba(var(--background-primary-rgb))] rounded-lg shadow-lg border border-[rgba(var(--border-primary-rgb))] p-2 z-30 animate-fade-in">
      <ul className="space-y-1">
        {options.map((option, index) => (
          <li key={index}>
            <button
              type="button"
              onClick={() => handleSelect(option)}
              className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${
                currentRule?.type === option?.type
                  ? 'bg-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-on-accent-rgb))]'
                  : 'text-[rgba(var(--foreground-primary-rgb))] hover:bg-[rgba(var(--background-tertiary-rgb))]'
              }`}
            >
              {getLabel(option)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecurrencePicker;