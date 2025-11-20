import React, { useState, useRef, useEffect } from 'react';
import { FaXTwitter } from 'react-icons/fa6';
import { HiDotsHorizontal, HiSearch, HiArrowLeft, HiMinus, HiX } from 'react-icons/hi';
import { useAppContext } from '@/hooks/useAppContext';
import { useAuth } from '@/hooks/useAuth';
import useClickOutside from '@/hooks/useClickOutside';
import HeaderMenu from './HeaderMenu';
import { Tooltip, Avatar } from '@/components/ui';
import InstallBanner from '@/components/ui/InstallBanner';
import NotificationPrompt from '@/components/ui/NotificationPrompt';
import PortalMenu from '@/components/ui/PortalMenu';

const Header: React.FC = () => {
  const { page, pageTitle, searchQuery, setSearchQuery, userProfile, setPage } = useAppContext();
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useClickOutside(menuRef, () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  });
  useClickOutside(profileMenuRef, () => {
    if (isProfileMenuOpen) {
      setIsProfileMenuOpen(false);
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
  const isTauriEnv = typeof window !== 'undefined' && (window as any).__TAURI__ !== undefined;

  const handleMinimize = async () => {
    if (!isTauriEnv) return;
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const win = getCurrentWindow();
      await win.minimize();
    } catch (e) { }
  };

  const handleMaximize = async () => {
    if (!isTauriEnv) return;
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const win = getCurrentWindow();
      await win.toggleMaximize();
    } catch (e) { }
  };

  const handleClose = async () => {
    if (!isTauriEnv) return;
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const win = getCurrentWindow();
      await win.close();
    } catch (e) { }
  };

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
          {/* AI sparkles button removed per request */}
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
              <HeaderMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} anchorRef={menuRef} />
            </div>
          )}
          {isTauriEnv && (
            <div className="flex items-center ml-2">
              <Tooltip text="Minimize">
                <button onClick={handleMinimize} className="px-2 py-2 rounded hover:bg-[rgba(var(--background-tertiary-rgb))]" aria-label="Minimize">
                  <HiMinus className="w-5 h-5 text-[rgba(var(--foreground-primary-rgb))]" />
                </button>
              </Tooltip>
              <Tooltip text="Maximize">
                <button onClick={handleMaximize} className="px-2 py-2 rounded hover:bg-[rgba(var(--background-tertiary-rgb))]" aria-label="Maximize">
                  <span className="block w-3 h-3 border border-[rgba(var(--foreground-primary-rgb))]" />
                </button>
              </Tooltip>
              <Tooltip text="Close">
                <button onClick={handleClose} className="px-2 py-2 rounded hover:bg-[rgba(var(--danger-rgb))] hover:text-white" aria-label="Close">
                  <HiX className="w-5 h-5" />
                </button>
              </Tooltip>
            </div>
          )}
          {/* Mobile Profile Avatar (furthest right) */}
          <div className="relative md:hidden" ref={profileMenuRef}>
            <Tooltip text="Account">
              <button
                onClick={() => setIsProfileMenuOpen(prev => !prev)}
                className="p-1.5 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))] transition-colors duration-200"
                aria-label="Account"
                aria-haspopup="true"
                aria-expanded={isProfileMenuOpen}
              >
                <div className="w-8 h-8">
                  <Avatar imageUrl={userProfile?.avatarUrl || null} />
                </div>
              </button>
            </Tooltip>
            <PortalMenu
              anchorRef={profileMenuRef}
              isOpen={isProfileMenuOpen}
              onClose={() => setIsProfileMenuOpen(false)}
              preferredPosition="bottom-right"
              offset={8}
            >
              <div className="w-44 bg-[rgba(var(--background-primary-rgb))] rounded-xl shadow-[0_8px_30px_rgba(var(--foreground-primary-rgb),0.12)] border border-[rgba(var(--border-primary-rgb))] py-2 overflow-hidden">
                <ul>
                  <li>
                    <button
                      onClick={() => { setPage('profile'); setIsProfileMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-base text-[rgba(var(--foreground-primary-rgb))] hover:bg-[rgba(var(--foreground-primary-rgb),0.1)]"
                    >
                      Profile
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { setPage('settings'); setIsProfileMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-base text-[rgba(var(--foreground-primary-rgb))] hover:bg-[rgba(var(--foreground-primary-rgb),0.1)]"
                    >
                      Settings
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => { logout(); setPage('login'); setIsProfileMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-base text-[rgba(var(--danger-rgb))] hover:bg-[rgba(var(--danger-rgb),0.1)]"
                    >
                      Sign out
                    </button>
                  </li>
                </ul>
              </div>
            </PortalMenu>
          </div>
        </div>
      </div>
      {/* Inline banners below header bar */}
      <InstallBanner />
      <NotificationPrompt />
    </header>
  );
};

export default Header;