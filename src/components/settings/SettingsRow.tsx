
import React from 'react';

interface SettingsRowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionComponent: React.ReactNode;
}

const SettingsRow: React.FC<SettingsRowProps> = ({ icon, title, description, actionComponent }) => {
  return (
    <div className="flex items-center p-4 hover:bg-[rgba(var(--foreground-primary-rgb),0.03)] transition-colors duration-200">
      <div className="mr-4 text-[rgba(var(--foreground-secondary-rgb))]">
        {icon}
      </div>
      <div className="flex-grow">
        <p className="font-semibold text-[rgba(var(--foreground-primary-rgb))]">{title}</p>
        <p className="text-sm text-[rgba(var(--foreground-secondary-rgb))]">{description}</p>
      </div>
      <div className="flex-shrink-0">
        {actionComponent}
      </div>
    </div>
  );
};

export default SettingsRow;