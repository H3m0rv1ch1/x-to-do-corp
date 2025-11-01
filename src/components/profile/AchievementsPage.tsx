
import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { ContributionGraph } from '@/components/calendar';
import AchievementBadge from './AchievementBadge';
import { Header } from '@/components/layout';
import { type Achievement } from '@/types';
import SpotlightAchievement from './SpotlightAchievement';

const AchievementsPage: React.FC = () => {
  const { allAchievements, unlockedAchievements, todos, notes } = useAppContext();
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const unlockedIds = useMemo(() => new Set(unlockedAchievements.map(a => a.achievementId)), [unlockedAchievements]);

  const { filteredAndGroupedAchievements, unlockedCount } = useMemo(() => {
    const unlockedCount = unlockedIds.size;
    
    let achievementsToDisplay = allAchievements;
    if (filter === 'unlocked') {
        achievementsToDisplay = allAchievements.filter(a => unlockedIds.has(a.id));
    } else if (filter === 'locked') {
        achievementsToDisplay = allAchievements.filter(a => !unlockedIds.has(a.id));
    }

    const grouped = achievementsToDisplay.reduce<Record<string, Achievement[]>>((acc, achievement) => {
        const category = achievement.category;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(achievement);
        return acc;
    }, {});

    return { filteredAndGroupedAchievements: grouped, unlockedCount };
  }, [allAchievements, unlockedIds, filter]);
  
  const totalCount = allAchievements.length;
  const progress = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  const FilterButton: React.FC<{ value: typeof filter, label: string }> = ({ value, label }) => (
    <button
        onClick={() => setFilter(value)}
        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${filter === value ? 'bg-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-on-accent-rgb))]' : 'bg-[rgba(var(--background-tertiary-rgb))] text-[rgba(var(--foreground-secondary-rgb))] hover:bg-[rgba(var(--border-secondary-rgb))]'}`}
    >
        {label}
    </button>
  );

  return (
    <div>
      <Header />
      <div className="p-4 sm:p-6">
        <div className="border-b border-[rgba(var(--border-primary-rgb))] pb-6 mb-6">
          <h2 className="text-2xl font-bold text-[rgba(var(--foreground-primary-rgb))] mb-2">Your Productivity</h2>
          <p className="text-[rgba(var(--foreground-secondary-rgb))] mb-6">A look at your task completions over the last six months. Darker squares mean more tasks were completed on that day.</p>
          
          <ContributionGraph />
        </div>

        <SpotlightAchievement />

        <div>
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-2xl font-bold text-[rgba(var(--foreground-primary-rgb))]">Achievements</h2>
                    <span className="font-semibold text-[rgba(var(--foreground-secondary-rgb))]">{unlockedCount} / {totalCount}</span>
                </div>
                 <div className="w-full bg-[rgba(var(--background-tertiary-rgb))] rounded-full h-2.5">
                    <div className="bg-[rgba(var(--accent-rgb))] h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>

            <div className="flex items-center space-x-2 mb-6">
                <FilterButton value="all" label="All" />
                <FilterButton value="unlocked" label="Unlocked" />
                <FilterButton value="locked" label="Locked" />
            </div>

            <div className="space-y-8">
                {Object.keys(filteredAndGroupedAchievements).length > 0 ? (
                  // Fix: Refactored to use Object.keys().map for iterating over achievements.
                  // This resolves a type inference issue with Object.entries() where the achievements
                  // array was being typed as 'unknown', causing the '.map' property to be inaccessible.
                  Object.keys(filteredAndGroupedAchievements).map((category) => {
                    const achievements = filteredAndGroupedAchievements[category];
                    return (
                      <div key={category}>
                          <h3 className="text-xl font-bold text-[rgba(var(--foreground-primary-rgb))] mb-4 border-b border-[rgba(var(--border-primary-rgb))] pb-2">{category}</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                              {achievements.map(achievement => (
                                  <AchievementBadge
                                      key={achievement.id}
                                      achievement={achievement}
                                      isUnlocked={unlockedIds.has(achievement.id)}
                                      unlockedAt={unlockedAchievements.find(ua => ua.achievementId === achievement.id)?.unlockedAt}
                                  />
                              ))}
                          </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 text-[rgba(var(--foreground-secondary-rgb))]">
                    <p>No achievements match the current filter.</p>
                  </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsPage;