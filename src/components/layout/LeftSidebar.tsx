
import React from 'react';
import { 
    HiHome, HiOutlineHome, 
    HiBell, HiOutlineBell,
    HiUser, HiOutlineUser,
    HiCalendar, HiOutlineCalendar,
    HiStar, HiOutlineStar, 
    HiDocumentText, HiOutlineDocumentText,
    HiCog, HiOutlineCog,
    HiPlus
} from 'react-icons/hi';
import { HiTrophy, HiOutlineTrophy } from 'react-icons/hi2';
import { FaXTwitter } from 'react-icons/fa6';
import { MdVerified } from 'react-icons/md';
import { Avatar } from '@/components/ui';
import { useAppContext } from '@/hooks/useAppContext';


const LeftSidebar: React.FC = () => {
    const { page, setPage, filter, setFilter, userProfile, openAddTaskModal } = useAppContext();

    const navItems = [
        { icon: HiHome, outlineIcon: HiOutlineHome, text: 'Home', page: 'home' as const, filter: 'all' as const },
        { icon: HiStar, outlineIcon: HiOutlineStar, text: 'Important', page: 'home' as const, filter: 'important' as const },
        { icon: HiBell, outlineIcon: HiOutlineBell, text: 'Pending', page: 'home' as const, filter: 'pending' as const },
        { icon: HiDocumentText, outlineIcon: HiOutlineDocumentText, text: 'Notes', page: 'notes' as const },
        { icon: HiTrophy, outlineIcon: HiOutlineTrophy, text: 'Achievements', page: 'achievements' as const },
        { icon: HiCalendar, outlineIcon: HiOutlineCalendar, text: 'Calendar', page: 'calendar' as const },
        { icon: HiUser, outlineIcon: HiOutlineUser, text: 'Profile', page: 'profile' as const },
        { icon: HiCog, outlineIcon: HiOutlineCog, text: 'Settings', page: 'settings' as const },
    ];

    return (
        <aside className="sticky top-0 h-screen hidden md:flex flex-col md:w-[88px] md:min-w-[88px] lg:w-[275px] lg:min-w-[275px] flex-shrink-0">
            <div className="h-full w-full flex flex-col justify-between py-1 px-4">
                <div className="w-full">
                    <div className="p-3 w-fit">
                        <FaXTwitter className="w-[30px] h-[30px] text-[rgba(var(--foreground-primary-rgb))]" />
                    </div>
                    <nav>
                        <ul>
                            {navItems.map((item, index) => {
                                const isActive = page === item.page && (item.page !== 'home' || !('filter' in item) || item.filter === filter);
                                // When active, show filled icon; when inactive, show outline icon
                                const Icon = isActive ? item.icon : item.outlineIcon;

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
                                            className="flex items-center md:justify-center lg:justify-start md:space-x-0 lg:space-x-5 py-3 md:px-0 lg:px-3 rounded-full transition-colors duration-200 hover:bg-[rgba(var(--background-hover-rgb))] w-full"
                                        >
                                            <div>
                                                <Icon className="w-[26px] h-[26px]" />
                                            </div>
                                            <span className={`hidden lg:inline text-[20px] ${isActive ? 'font-bold' : ''} text-[rgba(var(--foreground-primary-rgb))]`}>{item.text}</span>
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                    <button 
                        onClick={openAddTaskModal}
                        className="hidden lg:flex mt-4 w-full bg-[rgba(var(--button-primary-bg-rgb))] text-[rgba(var(--button-primary-text-rgb))] font-bold py-3 rounded-full transition-opacity duration-200 hover:opacity-90 text-[15px] items-center justify-center"
                    >
                        Add Task
                    </button>
                </div>
                <div className="w-full pb-3">
                    <div 
                        onClick={() => setPage('profile')}
                        className="flex items-center md:justify-center lg:justify-start md:space-x-0 lg:space-x-3 p-3 rounded-full hover:bg-[rgba(var(--background-hover-rgb))] transition-colors duration-200 cursor-pointer"
                    >
                        <div className="w-10 h-10 flex-shrink-0">
                            <Avatar imageUrl={userProfile.avatarUrl} />
                        </div>
                        <div className="hidden lg:block flex-1 overflow-visible">
                            <div className="flex items-center space-x-1">
                                <p className="font-bold text-[15px] text-[rgba(var(--foreground-primary-rgb))]">{userProfile.name}</p>
                                {userProfile.verificationType === 'user' && <MdVerified className="w-4 h-4 text-[rgba(var(--accent-rgb))] flex-shrink-0" />}
                                {userProfile.verificationType === 'business' && <MdVerified className="w-4 h-4 text-[rgba(var(--warning-rgb))] flex-shrink-0" />}
                                {userProfile.organizationAvatarUrl && (
                                     <a href="#" title={userProfile.organization || 'Organization'} className="flex items-center flex-shrink-0" onClick={(e) => e.preventDefault()}>
                                        <img src={userProfile.organizationAvatarUrl} alt={`${userProfile.organization || 'Organization'} logo`} className="w-4 h-4 rounded-sm object-cover" />
                                    </a>
                                )}
                            </div>
                            <p className="hidden lg:block text-[rgba(var(--foreground-secondary-rgb))] text-[15px]">{userProfile.username}</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default LeftSidebar;
