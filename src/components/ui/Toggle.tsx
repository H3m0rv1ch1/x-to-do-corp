import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  className?: string;
  id?: string;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label, className = '', id }) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onChange(!checked);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`relative inline-flex h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent-rgb))] ${checked ? 'bg-[rgba(var(--accent-rgb))]' : 'bg-[rgba(var(--border-primary-rgb))]'} `}
      >
        <span
          className={`absolute left-0.5 top-0.5 inline-block h-5 w-5 rounded-full bg-[rgba(var(--foreground-on-accent-rgb))] shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
      {label && (
        <label htmlFor={id} className="text-sm text-[rgba(var(--foreground-secondary-rgb))] cursor-pointer" onClick={() => onChange(!checked)}>
          {label}
        </label>
      )}
    </div>
  );
};

export default Toggle;