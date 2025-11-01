import React, { useMemo, useCallback } from 'react';
import { useAppContext } from '@/hooks/useAppContext';

const ContributionGraph: React.FC = () => {
  const { todos } = useAppContext();

  // Helper to format a date object into a 'YYYY-MM-DD' string key based on UTC.
  // Using useCallback to ensure function identity is stable.
  const toUTCDateKey = useCallback((date: Date): string => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const contributionData = useMemo(() => {
    const data = new Map<string, number>();
    todos.forEach(todo => {
      if (todo.completed && todo.completedAt) {
        // completedAt is an ISO string (UTC), so new Date() parses it correctly.
        const completedDate = new Date(todo.completedAt);
        const dateKey = toUTCDateKey(completedDate);
        data.set(dateKey, (data.get(dateKey) || 0) + 1);
      }
    });
    return data;
  }, [todos, toUTCDateKey]);

  const { days, monthLabels, maxCount } = useMemo(() => {
    const WEEKS_TO_SHOW = 26; // Approx 6 months
    
    const now = new Date();
    // Get today's date at midnight UTC to prevent timezone shifts.
    const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const endDate = new Date(todayUTC);
    // Align end date to the end of the week (Saturday, which is 6 in UTC days) for a full grid.
    endDate.setUTCDate(endDate.getUTCDate() + (6 - endDate.getUTCDay()));

    const startDate = new Date(endDate);
    startDate.setUTCDate(endDate.getUTCDate() - (WEEKS_TO_SHOW * 7) + 1);

    const days = [];
    const tempMonthLabels = [];
    let currentDate = new Date(startDate);
    let lastMonth = -1;
    let currentMax = 0;

    for (let i = 0; i < WEEKS_TO_SHOW * 7; i++) {
        const dateKey = toUTCDateKey(currentDate);
        const count = contributionData.get(dateKey) || 0;
        if (count > currentMax) {
          currentMax = count;
        }
        
        // Mark future days with count -1 to render them as empty.
        days.push({ 
            date: dateKey, 
            count: currentDate > todayUTC ? -1 : count 
        });

        // Track month labels based on UTC month to display correctly above the grid.
        const currentUTCMonth = currentDate.getUTCMonth();
        if (currentUTCMonth !== lastMonth) {
            tempMonthLabels.push({
                month: currentDate.toLocaleString('default', { month: 'short', timeZone: 'UTC' }),
                index: Math.floor(i / 7),
            });
            lastMonth = currentUTCMonth;
        }
        
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }
    
    // Clean up month labels to prevent crowding on smaller views.
    const monthLabels = tempMonthLabels.filter((label, i, arr) => {
        if (i === 0) return true;
        return label.index - arr[i-1].index > 3;
    });

    return { days, monthLabels, maxCount: Math.max(1, currentMax) };
  }, [contributionData, toUTCDateKey]);

  const getColorForCount = (count: number) => {
    if (count < 0) return 'opacity-0'; // Future day
    if (count === 0) return ''; // Day with no completions, uses default from CSS

    // If the max count is low (e.g., less than 5), use absolute counts for levels.
    // This provides better visual feedback for early/low activity users.
    if (maxCount < 5) {
        if (count === 1) return 'color-level-1';
        if (count === 2) return 'color-level-2';
        if (count === 3) return 'color-level-3';
        return 'color-level-4'; // for 4 or more
    }

    // Ratio-based logic for higher activity levels.
    const ratio = count / maxCount;
    if (ratio <= 0.25) return 'color-level-1';
    if (ratio <= 0.5) return 'color-level-2';
    if (ratio <= 0.75) return 'color-level-3';
    return 'color-level-4';
  };

  const getDayTitle = (dateKey: string, count: number) => {
    if (count < 0) return '';
    // Append 'T00:00:00Z' to parse the date string as UTC, ensuring the tooltip shows the correct date.
    const date = new Date(`${dateKey}T00:00:00Z`);
    const dateString = date.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
    });
    return `${count} tasks on ${dateString}`;
  };

  return (
    <div className="flex flex-col text-[rgba(var(--foreground-secondary-rgb))] text-xs">
        <div className="overflow-x-auto pb-2">
            <div className="relative" style={{ paddingLeft: '30px' }}>
                 <div className="absolute left-0 top-0 flex flex-col justify-between h-[82px] text-right">
                     <span>Mon</span>
                     <span>Wed</span>
                     <span>Fri</span>
                </div>
                
                <div className="flex" style={{ paddingLeft: '8px', marginBottom: '4px' }}>
                    {monthLabels.map(({ month, index }) => (
                        <div key={month + index} className="absolute" style={{ left: `${30 + index * 15}px`, top: '-18px' }}>
                            {month}
                        </div>
                    ))}
                </div>

                <div className="contribution-grid">
                {days.map((day, index) => (
                    <div
                        key={index}
                        className={`day-cell ${getColorForCount(day.count)}`}
                        title={getDayTitle(day.date, day.count)}
                    />
                ))}
                </div>
            </div>
        </div>
         <div className="flex items-center justify-end mt-2 text-xs space-x-2">
            <span>Less</span>
            <div className="day-cell"></div>
            <div className="day-cell color-level-1"></div>
            <div className="day-cell color-level-2"></div>
            <div className="day-cell color-level-3"></div>
            <div className="day-cell color-level-4"></div>
            <span>More</span>
        </div>
    </div>
  );
};

export default ContributionGraph;