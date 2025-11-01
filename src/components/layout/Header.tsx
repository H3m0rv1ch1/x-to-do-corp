import React, { useState, useRef, useEffect } from 'react';
import { FaXTwitter } from 'react-icons/fa6';
import { HiDotsHorizontal, HiSparkles, HiSearch, HiArrowLeft } from 'react-icons/hi';
import { useAppContext } from '@/hooks/useAppContext';
import useClickOutside from '@/hooks/useClickOutside';
import HeaderMenu from './HeaderMenu';
import { Tooltip } from '@/components/ui';

const Header: React.FC = () => {
  const { page, pageTitle, searchQuery, setSearchQuery } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useClickOutside(menuRef, () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  });

  useEffect(() => {
    if (isSearchActive) {
        searchInputRef.current?.focus();
    }
  }, [isSearchActive]);
  
  const handleCloseSearch = () => {
      setIsSearchActive(false);
      setSearchQuery('');
  }

  // Only show the more button on the home page where sorting/clearing is relevant
  const canShowMore = page === 'home';

  if (isSearchActive) {
    return (
        <header className="sticky top-0 z-20 bg-[rgba(var(--background-primary-rgb),0.8)] backdrop-blur-md border-b border-[rgba(var(--border-primary-rgb))] animate-fade-in">
             <div className="flex items-center justify-between px-4 h-14 md:h-16 mx-auto">
                 <Tooltip text="Go back">
                    <button onClick={handleCloseSearch} className="p-2 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))] transition-colors duration-200" aria-label="Go back">
                        <HiArrowLeft className="w-5 h-5 text-[rgba(var(--foreground-primary-rgb))]" />
                    </button>
                 </Tooltip>
                <div className="relative flex-grow mx-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <HiSearch className="w-5 h-5 text-[rgba(var(--foreground-secondary-rgb))]" />
                    </div>
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search Tasks"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[rgba(var(--background-primary-rgb))] border border-[rgba(var(--border-primary-rgb))] text-[rgba(var(--foreground-primary-rgb))] rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-[rgba(var(--accent-rgb))]"
                    />
                </div>
            </div>
        </header>
    )
  }

  return (
    <header className="sticky top-0 z-20 bg-[rgba(var(--background-primary-rgb),0.8)] backdrop-blur-md border-b border-[rgba(var(--border-primary-rgb))]">
      <div className="flex items-center justify-between px-4 h-14 md:h-16 mx-auto">
        <div className="flex items-center space-x-4">
            <div className="md:hidden">
              <FaXTwitter className="w-7 h-7 text-[rgba(var(--foreground-primary-rgb))]" />
            </div>
            <h1 className="text-[20px] font-bold text-[rgba(var(--foreground-primary-rgb))]">{pageTitle}</h1>
        </div>
         <div className="flex items-center space-x-2">
            <Tooltip text="Search">
              <button onClick={() => setIsSearchActive(true)} className="p-2 xl:hidden rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))] transition-colors duration-200" aria-label="Search">
                  <HiSearch className="w-5 h-5 text-[rgba(var(--foreground-primary-rgb))]" />
              </button>
            </Tooltip>
            <Tooltip text="View options (Coming soon!)">
              <button className="p-2 md:hidden rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))] transition-colors duration-200" aria-label="Top Tweets">
                  <HiSparkles className="w-6 h-6 text-[rgba(var(--foreground-primary-rgb))]" />
              </button>
            </Tooltip>
            {canShowMore && (
              <div className="relative" ref={menuRef}>
                <Tooltip text="More options">
                  <button 
                    onClick={() => setIsMenuOpen(prev => !prev)} 
                    className="p-2 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))] transition-colors duration-200" 
                    aria-label="More options"
                    aria-haspopup="true"
                    aria-expanded={isMenuOpen}
                  >
                      <HiDotsHorizontal className="w-6 h-6 text-[rgba(var(--foreground-primary-rgb))]" />
                  </button>
                </Tooltip>
                <HeaderMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
              </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;