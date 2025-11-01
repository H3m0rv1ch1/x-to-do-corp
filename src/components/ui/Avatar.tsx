
import React from 'react';
import { HiUser } from 'react-icons/hi';

interface AvatarProps {
  imageUrl?: string | null;
}

export const Avatar: React.FC<AvatarProps> = ({ imageUrl }) => {
  if (imageUrl) {
    return (
      <div 
        className="w-full h-full rounded-full bg-[rgba(var(--background-tertiary-rgb))] bg-cover bg-center flex-shrink-0"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
    );
  }

  return (
    <div className="w-full h-full rounded-full bg-[rgba(var(--background-tertiary-rgb))] flex items-center justify-center flex-shrink-0">
      <HiUser className="w-1/2 h-1/2 text-[rgba(var(--foreground-secondary-rgb))]" />
    </div>
  );
};