
import React from 'react';
import { Home as HomeIcon, StickyNote as NoteIcon, User as UserIcon, Trophy as TrophyIcon, Settings as SettingsIcon, Calendar as CalendarIcon } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';

const BottomNavbar: React.FC = () => {
    const { page, setPage, filter, setFilter } = useAppContext();

    const navItems = [
        { icon: HomeIcon, page: 'home' as const, filter: 'all' as const, label: 'Home' },
        { icon: CalendarIcon, page: 'calendar' as const, label: 'Calendar' },
        { icon: TrophyIcon, page: 'achievements' as const, label: 'Achievements' },
        { icon: NoteIcon, page: 'notes' as const, label: 'Notes' },
        { icon: UserIcon, page: 'profile' as const, label: 'Profile' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[rgba(var(--background-primary-rgb),0.8)] backdrop-blur-md border-t border-[rgba(var(--border-primary-rgb))] md:hidden z-30">
            <nav className="flex justify-around items-center h-16">
                {navItems.map((item, index) => {
                    // Special check for settings icon replacement
                    if (index === 2 && (page === 'settings' || page === 'achievements')) {
                        // This logic swaps the icon on the nav bar based on the current page,
                        // keeping the nav bar compact but still providing access.
                        const dynamicItem = page === 'settings' ?
                           { icon: TrophyIcon, page: 'achievements' as const, label: 'Achievements' } :
                           { icon: SettingsIcon, page: 'settings' as const, label: 'Settings' };
                        
                        const isActive = page === dynamicItem.page;
                        const Icon = dynamicItem.icon;
                        const iconProps = { className: "w-7 h-7" } as React.SVGProps<SVGSVGElement>;

                        return (
                            <button
                                key={dynamicItem.page}
                                onClick={() => setPage(dynamicItem.page)}
                                className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${isActive ? 'text-[rgba(var(--accent-rgb))]' : 'text-[rgba(var(--foreground-secondary-rgb))] hover:text-[rgba(var(--accent-rgb))]'}`}
                            >
                               <Icon {...iconProps} />
                            </button>
                        );
                    }


                    const isActive = page === item.page && (item.page !== 'home' || item.filter === filter);
                    const Icon = item.icon;
                    
                    const iconProps = {
                        className: "w-7 h-7",
                    } as React.SVGProps<SVGSVGElement>;

                    return (
                        <button
                            key={index}
                            onClick={() => {
                                setPage(item.page);
                                if (item.filter) {
                                    setFilter(item.filter);
                                }
                            }}
                            className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${isActive ? 'text-[rgba(var(--accent-rgb))]' : 'text-[rgba(var(--foreground-secondary-rgb))] hover:text-[rgba(var(--accent-rgb))]'}`}
                        >
                           <Icon {...iconProps} />
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default BottomNavbar;