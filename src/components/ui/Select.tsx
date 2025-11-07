import React, { useEffect, useMemo, useRef, useState } from 'react';
import { HiChevronDown, HiCheck } from 'react-icons/hi';
import PortalMenu from './PortalMenu';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  value: string | number;
  options: SelectOption[];
  onChange: (value: string | number) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
}

const Select: React.FC<SelectProps> = ({
  value,
  options,
  onChange,
  placeholder = 'Select',
  className = '',
  buttonClassName = '',
  size = 'md',
  fullWidth = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuWidth, setMenuWidth] = useState<number | null>(null);

  const selected = useMemo(() => options.find(o => String(o.value) === String(value)), [options, value]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Keep menu width equal to button width for consistent sizing
  useEffect(() => {
    const updateWidth = () => {
      const el = buttonRef.current;
      if (el) setMenuWidth(el.getBoundingClientRect().width);
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const el = buttonRef.current;
      if (el) setMenuWidth(el.getBoundingClientRect().width);
    }
  }, [isOpen]);

  const baseBtn = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm';
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(v => !v)}
        className={`${widthClass} ${baseBtn} rounded-md border border-[rgba(var(--border-primary-rgb))] bg-[rgba(var(--background-primary-rgb))] text-[rgba(var(--foreground-primary-rgb))] flex items-center justify-between gap-2 hover:border-[rgba(var(--accent-rgb))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent-rgb),0.4)] ${buttonClassName}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <HiChevronDown className="w-4 h-4 opacity-70" />
      </button>
      <PortalMenu anchorRef={buttonRef} isOpen={isOpen}>
        <div className="max-h-64 overflow-auto bg-[rgba(var(--background-primary-rgb))] rounded-lg shadow-lg border border-[rgba(var(--border-primary-rgb))] p-1" style={{ width: menuWidth ?? undefined }}>
          <ul role="listbox" className="space-y-1">
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <li key={`${opt.value}`}> 
                  <button
                    type="button"
                    onClick={() => { onChange(opt.value); setIsOpen(false); }}
                    role="option"
                    aria-selected={isSelected}
                    className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors flex items-center justify-between ${isSelected ? 'bg-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-on-accent-rgb))]' : 'text-[rgba(var(--foreground-primary-rgb))] hover:bg-[rgba(var(--background-tertiary-rgb))]'}`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <HiCheck className="w-4 h-4" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </PortalMenu>
    </div>
  );
};

export default Select;