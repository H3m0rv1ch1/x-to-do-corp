
import React from 'react';
import { HiTrash, HiCheck } from 'react-icons/hi';
import { useAppContext } from '@/hooks/useAppContext';
import { type SortOrder } from '@/contexts/AppContext';
import PortalMenu from '@/components/ui/PortalMenu';

interface HeaderMenuProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement>;
}

const HeaderMenu: React.FC<HeaderMenuProps> = ({ isOpen, onClose, anchorRef }) => {
  const { sortOrder, setSortOrder, handleClearCompletedTodos } = useAppContext();

  const handleSortChange = (order: SortOrder) => {
    setSortOrder(order);
    onClose();
  };

  const handleClear = () => {
    handleClearCompletedTodos();
    onClose();
  }

  const sortOptions: { key: SortOrder; label: string }[] = [
    { key: 'newest', label: 'Sort by Newest' },
    { key: 'oldest', label: 'Sort by Oldest' },
    { key: 'dueDate', label: 'Sort by Due Date' },
    { key: 'priority', label: 'Sort by Priority' },
  ];

  return (
    <PortalMenu
      anchorRef={anchorRef}
      isOpen={isOpen}
      onClose={onClose}
      preferredPosition="bottom-right"
      offset={8}
    >
      <div className="w-60 bg-[rgba(var(--background-primary-rgb))] rounded-xl shadow-[0_8px_30px_rgba(var(--foreground-primary-rgb),0.12)] border border-[rgba(var(--border-primary-rgb))] py-2 overflow-hidden">
        <ul>
          <li className="px-4 py-2 text-sm text-[rgba(var(--foreground-secondary-rgb))] font-semibold">Sort Options</li>
          {sortOptions.map(option => (
            <li key={option.key}>
              <button
                onClick={() => handleSortChange(option.key)}
                className="w-full text-left flex items-center justify-between px-4 py-2 text-base text-[rgba(var(--foreground-primary-rgb))] hover:bg-[rgba(var(--foreground-primary-rgb),0.1)]"
              >
                <span>{option.label}</span>
                {sortOrder === option.key && <HiCheck className="w-4 h-4 text-[rgba(var(--accent-rgb))]" />}
              </button>
            </li>
          ))}
          <div className="my-2 border-t border-[rgba(var(--border-primary-rgb))]" />
          <li>
            <button
              onClick={handleClear}
              className="w-full text-left flex items-center space-x-3 px-4 py-2 text-base text-[rgba(var(--danger-rgb))] hover:bg-[rgba(var(--danger-rgb),0.1)]"
            >
              <HiTrash className="w-5 h-5" />
              <span>Clear Completed</span>
            </button>
          </li>
        </ul>
      </div>
    </PortalMenu>
  );
};

export default HeaderMenu;