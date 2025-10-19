
import React from 'react';
import { Home as HomeIcon, Bell as BellIcon, User as UserIcon, MoreHorizontal as MoreIcon, BadgeCheck as VerifiedIcon, Trophy as TrophyIcon, Calendar as CalendarIcon, Star as StarIcon, StickyNote as NoteIcon, Settings as SettingsIcon } from 'lucide-react';
import { Avatar } from './Avatar';
import { useAppContext } from '../hooks/useAppContext';

const LeftSidebar: React.FC = () => {
    const { page, setPage, filter, setFilter, userProfile, openAddTaskModal } = useAppContext();

    const navItems = [
        { icon: HomeIcon, text: 'Home', page: 'home' as const, filter: 'all' as const },
        { icon: StarIcon, text: 'Important', page: 'home' as const, filter: 'important' as const },
        { icon: BellIcon, text: 'Pending', page: 'home' as const, filter: 'pending' as const },
        { icon: NoteIcon, text: 'Notes', page: 'notes' as const },
        { icon: TrophyIcon, text: 'Achievements', page: 'achievements' as const },
        { icon: CalendarIcon, text: 'Calendar', page: 'calendar' as const },
        { icon: UserIcon, text: 'Profile', page: 'profile' as const },
        { icon: SettingsIcon, text: 'Settings', page: 'settings' as const },
    ];

    return (
        <aside className="sticky top-0 h-screen hidden md:flex flex-col w-[275px] flex-shrink-0 items-end">
            <div className="h-full flex flex-col justify-between p-2 pr-4">
                <div>
                    <div className="p-3 w-fit">
                        <XLogo className="w-7 h-7 text-[rgba(var(--foreground-primary-rgb))]" />
                    </div>
                    <nav>
                        <ul>
                            {navItems.map((item, index) => {
                                const isActive = page === item.page && (item.page !== 'home' || !('filter' in item) || item.filter === filter);
                                const Icon = item.icon;
                                const iconProps = {
                                    className: "w-7 h-7",
                                } as React.SVGProps<SVGSVGElement>;

                                return (
                                    <li key={index}>
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              setPage(item.page);
                                              if ('filter' in item && item.filter) {
                                                setFilter(item.filter as 'all' | 'pending' | 'completed' | 'important');
                                              }
                                            }}
                                            className="flex items-center space-x-5 p-3 rounded-full transition-colors duration-200 hover:bg-[rgba(var(--foreground-primary-rgb),0.1)] w-fit"
                                        >
                                            <div>
                                                <Icon {...iconProps} />
                                            </div>
                                            <span className={`text-xl ${isActive ? 'font-bold' : ''} text-[rgba(var(--foreground-primary-rgb))] w-32`}>{item.text}</span>
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                    <button 
                        onClick={openAddTaskModal}
                        className="mt-4 w-full bg-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-on-accent-rgb))] font-bold py-4 rounded-full transition-opacity duration-200 hover:opacity-90 text-[17px]"
                    >
                        Add Task
                    </button>
                </div>
                <div className="p-3 w-full">
                    <div 
                        onClick={() => setPage('profile')}
                        className="flex items-center space-x-3 p-3 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))] transition-colors duration-200 cursor-pointer w-full"
                    >
                        <div className="w-10 h-10 flex-shrink-0">
                            <Avatar imageUrl={userProfile.avatarUrl} />
                        </div>
                        <div className="hidden md:block flex-1 min-w-0">
                            <div className="flex items-center space-x-1">
                                <p className="font-bold text-[rgba(var(--foreground-primary-rgb))] truncate">{userProfile.name}</p>
                                {userProfile.verificationType === 'user' && <VerifiedIcon className="w-4 h-4 text-[rgba(var(--accent-rgb))] flex-shrink-0" />}
                                {userProfile.verificationType === 'business' && <VerifiedIcon className="w-4 h-4 text-[rgba(var(--warning-rgb))] flex-shrink-0" />}
                            </div>
                            <p className="text-[rgba(var(--foreground-secondary-rgb))] truncate">{userProfile.username}</p>
                        </div>
                        <MoreIcon className="w-5 h-5 ml-auto text-[rgba(var(--foreground-primary-rgb))] hidden md:block flex-shrink-0"/>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default LeftSidebar;

const XLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 1200 1227" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-label="X" role="img" {...props}>
    <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6902H306.615L611.412 515.685L658.88 583.579L1055.08 1150.31H892.476L569.165 687.854V687.828Z" />
  </svg>
);