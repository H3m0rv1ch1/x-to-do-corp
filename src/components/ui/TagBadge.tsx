
import React from 'react';
import { useAppContext } from '@/hooks/useAppContext';

interface TagBadgeProps {
  tagName: string;
  onClick?: (e: React.MouseEvent) => void;
}

const TagBadge: React.FC<TagBadgeProps> = ({ tagName, onClick }) => {
  const { tagColors } = useAppContext();
  const color = tagColors[tagName] || { background: 'rgba(var(--background-tertiary-rgb))', foreground: 'rgba(var(--foreground-secondary-rgb))' };

  const classes = `text-xs font-semibold px-2.5 py-1 rounded-full ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`;

  return (
    <span
      style={{ backgroundColor: color.background, color: color.foreground }}
      className={classes}
      onClick={onClick}
    >
      #{tagName}
    </span>
  );
};

export default React.memo(TagBadge);