import React from 'react';
import { HiFlag } from 'react-icons/hi';
import { type Priority } from '@/types';

interface PriorityPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (priority: Priority) => void;
  currentPriority: Priority;
}

const priorityOptions: { value: Priority; label: string; colorClass: string }[] = [
    { value: 'none', label: 'No Priority', colorClass: 'text-[rgba(var(--foreground-secondary-rgb))]' },
    { value: 'high', label: 'High', colorClass: 'text-[rgba(var(--danger-rgb))]' },
    { value: 'medium', label: 'Medium', colorClass: 'text-[rgba(var(--warning-rgb))]' },
    { value: 'low', label: 'Low', colorClass: 'text-[rgba(var(--accent-rgb))]' },
];

const PriorityPicker: React.FC<PriorityPickerProps> = ({ isOpen, onClose, onSelect, currentPriority }) => {
  if (!isOpen) {
    return null;
  }

  const handleSelect = (priority: Priority) => {
    onSelect(priority);
    onClose();
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-48 bg-[rgba(var(--background-primary-rgb))] rounded-lg shadow-lg border border-[rgba(var(--border-primary-rgb))] p-2 z-30 animate-fade-in">
      <ul className="space-y-1">
        {priorityOptions.map((option) => (
          <li key={option.value}>
            <button
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full text-left px-3 py-1.5 text-sm rounded-md flex items-center transition-colors ${
                currentPriority === option.value
                  ? 'bg-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-on-accent-rgb))]'
                  : 'text-[rgba(var(--foreground-primary-rgb))] hover:bg-[rgba(var(--background-tertiary-rgb))]'
              }`}
            >
              <HiFlag className={`w-4 h-4 mr-3 ${option.colorClass} ${currentPriority === option.value ? 'text-[rgba(var(--foreground-on-accent-rgb))]' : ''}`} />
              <span>{option.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PriorityPicker;