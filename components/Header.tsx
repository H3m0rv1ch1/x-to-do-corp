import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal as MoreIcon, Sparkles as SparkleIcon, Search as SearchIcon, ArrowLeft as ArrowLeftIcon } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';
import useClickOutside from '../hooks/useClickOutside';
import HeaderMenu from './HeaderMenu';

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
             <div className="flex items-center justify-between p-2 h-16 mx-auto">
                 <button onClick={handleCloseSearch} className="p-2 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))] transition-colors duration-200" aria-label="Go back">
                    <ArrowLeftIcon className="w-5 h-5 text-[rgba(var(--foreground-primary-rgb))]" />
                </button>
                <div className="relative flex-grow mx-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="w-5 h-5 text-[rgba(var(--foreground-secondary-rgb))]" />
                    </div>
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search Tasks"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[rgba(var(--background-secondary-rgb))] border border-[rgba(var(--border-secondary-rgb))] text-[rgba(var(--foreground-primary-rgb))] rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-[rgba(var(--accent-rgb))]"
                    />
                </div>
            </div>
        </header>
    )
  }

  return (
    <header className="sticky top-0 z-20 bg-[rgba(var(--background-primary-rgb),0.8)] backdrop-blur-md border-b border-[rgba(var(--border-primary-rgb))]">
      <div className="flex items-center justify-between p-4 h-16 mx-auto">
        <div className="flex items-center space-x-4">
            <div className="md:hidden">
              <XLogo className="w-7 h-7 text-[rgba(var(--foreground-primary-rgb))]" />
            </div>
            <h1 className="text-xl font-bold text-[rgba(var(--foreground-primary-rgb))]">{pageTitle}</h1>
        </div>
         <div className="flex items-center space-x-2">
            <button onClick={() => setIsSearchActive(true)} className="p-2 xl:hidden rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))] transition-colors duration-200" aria-label="Search">
                <SearchIcon className="w-5 h-5 text-[rgba(var(--foreground-primary-rgb))]" />
            </button>
            <button className="p-2 md:hidden rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))] transition-colors duration-200" aria-label="Top Tweets">
                <SparkleIcon className="w-6 h-6 text-[rgba(var(--foreground-primary-rgb))]" />
            </button>
            {canShowMore && (
              <div className="relative" ref={menuRef}>
                <button 
                  onClick={() => setIsMenuOpen(prev => !prev)} 
                  className="p-2 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))] transition-colors duration-200" 
                  aria-label="More options"
                  aria-haspopup="true"
                  aria-expanded={isMenuOpen}
                >
                    <MoreIcon className="w-6 h-6 text-[rgba(var(--foreground-primary-rgb))]" />
                </button>
                <HeaderMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
              </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;

const XLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 1200 1227" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-label="X" role="img" {...props}>
    <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6902H306.615L611.412 515.685L658.88 583.579L1055.08 1150.31H892.476L569.165 687.854V687.828Z" />
  </svg>
);