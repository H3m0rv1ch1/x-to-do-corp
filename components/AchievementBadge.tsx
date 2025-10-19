import React from 'react';
import { type Achievement } from '../types';
import { Lock as LockIcon } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';

interface AchievementBadgeProps {
  achievement: Achievement;
  isUnlocked: boolean;
  unlockedAt?: string;
}

const tierStyles = {
    Bronze: {
        unlocked: 'border-amber-600/50 text-amber-400 shadow-lg shadow-amber-900/40 badge-gradient-bronze',
        icon: 'bg-amber-500/10 text-amber-400',
    },
    Silver: {
        unlocked: 'border-slate-400/50 text-slate-300 shadow-lg shadow-slate-800/40 badge-gradient-silver',
        icon: 'bg-slate-500/10 text-slate-300',
    },
    Gold: {
        unlocked: 'border-yellow-400/50 text-yellow-300 shadow-lg shadow-yellow-800/40 badge-gradient-gold',
        icon: 'bg-yellow-400/10 text-yellow-300',
    }
}


const AchievementBadge: React.FC<AchievementBadgeProps> = ({ achievement, isUnlocked, unlockedAt }) => {
  const { todos, notes } = useAppContext();
  const Icon = achievement.icon;

  const formattedDate = unlockedAt
    ? new Date(unlockedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  const styles = tierStyles[achievement.tier];
  
  let progress = { current: 0, target: 1, percentage: 0 };
  if (!isUnlocked && achievement.progress) {
    const p = achievement.progress({ todos, notes });
    progress = { ...p, percentage: Math.min((p.current / p.target) * 100, 100) };
  }


  return (
    <div
      className={`
        relative flex flex-col items-center justify-start text-center p-4 border rounded-2xl transition-all duration-300 transform hover:-translate-y-1 h-48 overflow-hidden
        ${isUnlocked ? styles.unlocked : 'border-[rgba(var(--border-primary-rgb))] bg-[rgba(var(--background-secondary-rgb),0.2)] badge-locked'}
      `}
      title={isUnlocked && formattedDate ? `Unlocked on ${formattedDate}` : `${achievement.description}${!isUnlocked && achievement.progress ? ` (${progress.current}/${progress.target})` : ''}`}
    >
      <div
        className={`
          w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all duration-300 flex-shrink-0
          ${isUnlocked ? styles.icon : 'bg-[rgba(var(--background-tertiary-rgb))] text-[rgba(var(--foreground-secondary-rgb))]'}
        `}
      >
        {isUnlocked ? <Icon className="w-8 h-8" /> : <LockIcon className="w-8 h-8" />}
      </div>
      <h3
        className={`
          font-bold text-base transition-colors duration-300
          ${isUnlocked ? 'text-[rgba(var(--foreground-primary-rgb))]' : 'text-[rgba(var(--foreground-secondary-rgb))]'}
        `}
      >
        {achievement.title}
      </h3>
      <p
        className={`
          text-xs mt-1 transition-colors duration-300 flex-grow
          ${isUnlocked ? 'text-[rgba(var(--foreground-secondary-rgb))]' : 'text-[rgba(var(--foreground-secondary-rgb),0.7)]'}
        `}
      >
        {achievement.description}
      </p>

      {!isUnlocked && achievement.progress && progress.percentage > 0 && (
         <div className="badge-progress-bar">
            <div className="badge-progress-bar-inner" style={{ width: `${progress.percentage}%` }}></div>
        </div>
      )}
    </div>
  );
};

export default AchievementBadge;