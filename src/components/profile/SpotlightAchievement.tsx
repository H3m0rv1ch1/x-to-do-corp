
import React, { useMemo } from 'react';
import { TbTarget } from 'react-icons/tb';
import { useAppContext } from '@/hooks/useAppContext';
import { type Achievement } from '@/types';

const SpotlightAchievement: React.FC = () => {
    const { allAchievements, unlockedAchievements, todos, notes } = useAppContext();

    const nextAchievement = useMemo(() => {
        const unlockedIds = new Set(unlockedAchievements.map(a => a.achievementId));
        const lockedAchievements = allAchievements.filter(a => !unlockedIds.has(a.id) && a.progress);

        if (lockedAchievements.length === 0) {
            return null;
        }

        let bestCandidate: Achievement | null = null;
        let highestProgress = -1;

        for (const achievement of lockedAchievements) {
            if (achievement.progress) {
                const { current, target } = achievement.progress({ todos, notes });
                if (current >= target) continue; // Skip if already met but not yet awarded
                
                const progressPercentage = (current / target);

                if (progressPercentage > highestProgress) {
                    highestProgress = progressPercentage;
                    bestCandidate = achievement;
                }
            }
        }
        return bestCandidate;
    }, [allAchievements, unlockedAchievements, todos, notes]);

    if (!nextAchievement || !nextAchievement.progress) {
        return null;
    }

    const { current, target } = nextAchievement.progress({ todos, notes });
    const progressPercentage = Math.min((current / target) * 100, 100);
    const Icon = nextAchievement.icon;

    return (
        <div className="border border-[rgba(var(--accent-rgb),0.3)] bg-[rgba(var(--background-secondary-rgb),0.5)] rounded-2xl p-4 mb-6 animate-fade-in">
            <div className="flex items-center space-x-3 mb-3">
                <TbTarget className="w-6 h-6 text-[rgba(var(--accent-rgb))]" />
                <h3 className="text-lg font-bold text-[rgba(var(--accent-rgb))]">Next Up</h3>
            </div>

            <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-[rgba(var(--background-tertiary-rgb))] text-[rgba(var(--foreground-secondary-rgb))] rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon className="w-8 h-8" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-[rgba(var(--foreground-primary-rgb))] truncate">{nextAchievement.title}</p>
                    <p className="text-sm text-[rgba(var(--foreground-secondary-rgb))] truncate">{nextAchievement.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                        <div className="w-full bg-[rgba(var(--border-secondary-rgb))] rounded-full h-2">
                            <div
                                className="bg-[rgba(var(--accent-rgb))] h-2 rounded-full transition-all duration-500"
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>
                        <span className="text-xs font-mono text-[rgba(var(--foreground-secondary-rgb))]">{Math.min(current, target)}/{target}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpotlightAchievement;