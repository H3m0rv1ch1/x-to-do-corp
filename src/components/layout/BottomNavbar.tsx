import React from 'react';
import { 
    HiHome, HiOutlineHome, 
    HiDocumentText, HiOutlineDocumentText,
    HiUser, HiOutlineUser,
    HiCog, HiOutlineCog,
    HiCalendar, HiOutlineCalendar 
} from 'react-icons/hi';
import { HiTrophy, HiOutlineTrophy } from 'react-icons/hi2';
import { useAppContext } from '@/hooks/useAppContext';

const BottomNavbar: React.FC = () => {
    const { page, setPage, filter, setFilter } = useAppContext();

    const navItems = [
        { icon: HiHome, outlineIcon: HiOutlineHome, page: 'home' as const, filter: 'all' as const, label: 'Home' },
        { icon: HiCalendar, outlineIcon: HiOutlineCalendar, page: 'calendar' as const, label: 'Calendar' },
        { icon: HiTrophy, outlineIcon: HiOutlineTrophy, page: 'achievements' as const, label: 'Achievements' },
        { icon: HiDocumentText, outlineIcon: HiOutlineDocumentText, page: 'notes' as const, label: 'Notes' },
        { icon: HiUser, outlineIcon: HiOutlineUser, page: 'profile' as const, label: 'Profile' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-[rgba(var(--background-primary-rgb),0.8)] backdrop-blur-md border-t border-[rgba(var(--border-primary-rgb))] md:hidden z-30">
            <nav className="flex justify-around items-center h-14">
                {navItems.map((item, index) => {
                    // Special check for settings icon replacement
                    if (index === 2 && (page === 'settings' || page === 'achievements')) {
                        // This logic swaps the icon on the nav bar based on the current page,
                        // keeping the nav bar compact but still providing access.
                        const dynamicItem = page === 'settings' ?
                           { icon: HiTrophy, outlineIcon: HiOutlineTrophy, page: 'achievements' as const, label: 'Achievements' } :
                           { icon: HiCog, outlineIcon: HiOutlineCog, page: 'settings' as const, label: 'Settings' };
                        
                        const isActive = page === dynamicItem.page;
                        const Icon = isActive ? dynamicItem.icon : dynamicItem.outlineIcon;

                        return (
                            <button
                                key={dynamicItem.page}
                                onClick={() => setPage(dynamicItem.page)}
                                className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${isActive ? 'text-[rgba(var(--foreground-primary-rgb))]' : 'text-[rgba(var(--foreground-secondary-rgb))] hover:bg-[rgba(var(--background-tertiary-rgb))]'}`}
                            >
                               <Icon className="w-[26px] h-[26px]" />
                            </button>
                        );
                    }


                    const isActive = page === item.page && (item.page !== 'home' || item.filter === filter);
                    // When active, show filled icon; when inactive, show outline icon
                    const Icon = isActive ? item.icon : item.outlineIcon;

                    return (
                        <button
                            key={index}
                            onClick={() => {
                                setPage(item.page);
                                if (item.filter) {
                                    setFilter(item.filter);
                                }
                            }}
                            className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${isActive ? 'text-[rgba(var(--foreground-primary-rgb))]' : 'text-[rgba(var(--foreground-secondary-rgb))] hover:bg-[rgba(var(--background-tertiary-rgb))]'}`}
                        >
                           <Icon className="w-[26px] h-[26px]" />
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default BottomNavbar;