import React, { useEffect, lazy, Suspense } from 'react';
import { Header, LeftSidebar, RightSidebar, BottomNavbar } from '@/components/layout';
import { TodoList, AddTaskFab } from '@/components/todo';
import { AddTaskModal, ConfirmationModal, ImageLightbox, FocusModeModal, ShortcutsModal, DayTasksModal } from '@/components/modals';
import { ToastContainer } from '@/components/ui';
import { AppProvider } from '@/contexts/AppContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import ForgotPasswordPage from '@/components/auth/ForgotPasswordPage';
import LandingPage from '@/components/auth/LandingPage';
import { useAppContext } from '@/hooks/useAppContext';
import { FaXTwitter } from 'react-icons/fa6';

// Lazy load heavy pages for better initial load performance
const ProfilePage = lazy(() => import('@/components/profile/ProfilePage'));
const AchievementsPage = lazy(() => import('@/components/profile/AchievementsPage'));
const NotesPage = lazy(() => import('@/components/notes/NotesPage'));
const SettingsPage = lazy(() => import('@/components/settings/SettingsPage'));
const CalendarPage = lazy(() => import('@/components/calendar/CalendarPage'));


const AppContent: React.FC = () => {
  const {
    page,
    userProfile,
    setPage,
    setFilter,
    confirmationState,
    hideConfirmation,
    lightboxImageUrl,
    closeLightbox,
    toasts,
    dayDetail,
    closeDayDetailModal,
    isAddTaskModalOpen,
    openAddTaskModal,
    closeAddTaskModal,
    isFocusModalOpen,
    closeFocusModal,
    isShortcutsModalOpen,
    openShortcutsModal,
    closeShortcutsModal,
  } = useAppContext();
  const { isAuthenticated, isLoading } = useAuth();

  // CRITICAL: All hooks must be called before any conditional returns!
  // Redirect logic
  useEffect(() => {
    if (!isAuthenticated) {
      // Gate the app behind the Login page for unauthenticated users
      if (page !== 'forgot' && page !== 'landing') {
        setPage('landing');
      }
    } else {
      // Redirect authenticated users away from auth pages
      if (page === 'forgot' || page === 'landing') {
        setPage('home');
      }
    }
  }, [isAuthenticated, setPage, page]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow shortcuts in inputs only for specific keys like Escape
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        if (e.key === 'Escape') {
          // Allow escape to blur the element and close modals
          (e.target as HTMLElement).blur();
        } else if (e.key !== '/') {
          return;
        }
      }

      // Close Modals with Escape
      if (e.key === 'Escape') {
        if (lightboxImageUrl) return closeLightbox();
        if (isShortcutsModalOpen) return closeShortcutsModal();
        if (isFocusModalOpen) return closeFocusModal();
        if (confirmationState.isOpen) return hideConfirmation();
        if (isAddTaskModalOpen) return closeAddTaskModal();
        if (dayDetail) return closeDayDetailModal();
      }

      // Prevent default for single-key shortcuts that might conflict with typing
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        switch (e.key) {
          case 'a':
          case 'n':
            e.preventDefault();
            openAddTaskModal();
            break;
          case '/':
            e.preventDefault();
            document.getElementById('global-search-input')?.focus();
            break;
          case '?':
            e.preventDefault();
            openShortcutsModal();
            break;
          case 'h': setPage('home'); setFilter('all'); break;
          case 'p': setPage('profile'); break;
          case 'c': setPage('calendar'); break;
          case 'o': setPage('notes'); break; // 'o' for nOtes
          case 's': setPage('settings'); break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    }
  }, [
    lightboxImageUrl, isShortcutsModalOpen, isFocusModalOpen, confirmationState.isOpen,
    isAddTaskModalOpen, dayDetail, closeLightbox, closeShortcutsModal,
    closeFocusModal, hideConfirmation, closeAddTaskModal, closeDayDetailModal,
    openAddTaskModal, openShortcutsModal, setPage, setFilter
  ]);

  // Loading screen AFTER all hooks (React Rules of Hooks requirement)
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[rgba(var(--background-primary-rgb))]">
        <div className="flex flex-col items-center justify-center text-center">
          <FaXTwitter className="w-24 h-24 text-white mb-6 animate-pulse" />
          <h1 className="text-3xl font-extrabold text-white">X To-Do Corp</h1>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    // Simple loading fallback for lazy-loaded pages
    const PageLoader = () => (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-[rgba(var(--foreground-secondary-rgb))]">Loading...</div>
      </div>
    );

    switch (page) {
      case 'home':
        return (
          <>
            <Header />
            <TodoList />
          </>
        );
      case 'profile':
        return (
          <Suspense fallback={<PageLoader />}>
            <ProfilePage
              userProfile={userProfile}
              setPage={setPage}
            />
          </Suspense>
        );
      case 'notes':
        return (
          <Suspense fallback={<PageLoader />}>
            <NotesPage />
          </Suspense>
        );
      case 'achievements':
        return (
          <Suspense fallback={<PageLoader />}>
            <AchievementsPage />
          </Suspense>
        );
      case 'settings':
        return (
          <Suspense fallback={<PageLoader />}>
            <SettingsPage />
          </Suspense>
        );
      case 'calendar':
        return (
          <Suspense fallback={<PageLoader />}>
            <Header />
            <CalendarPage />
          </Suspense>
        );
      case 'landing':
        return <LandingPage />;
      case 'forgot':
        return <ForgotPasswordPage />;
      default:
        return null;
    }
  }

  const handleConfirm = () => {
    confirmationState.onConfirm();
    hideConfirmation();
  };

  // Render minimal layout for auth pages to avoid sidebars/nav
  if (!isAuthenticated && (page === 'landing' || page === 'forgot')) {
    return (
      <div className="bg-[rgba(var(--background-primary-rgb))] min-h-screen text-[rgba(var(--foreground-primary-rgb))] font-sans">
        {renderPage()}
        <ToastContainer toasts={toasts} />
      </div>
    );
  }

  return (
    <div className="bg-[rgba(var(--background-primary-rgb))] min-h-screen text-[rgba(var(--foreground-primary-rgb))] font-sans">
      <div className="flex justify-center mx-auto" style={{ maxWidth: '1350px' }}>
        <LeftSidebar />
        <main className="w-full md:w-full lg:w-[580px] border-l border-r border-[rgba(var(--border-primary-rgb))] pb-16 md:pb-0" style={{ minWidth: 0, minHeight: '100vh' }}>
          {renderPage()}
        </main>
        <RightSidebar />
      </div>
      <AddTaskFab />
      <BottomNavbar />
      <AddTaskModal />
      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        onClose={hideConfirmation}
        onConfirm={handleConfirm}
        title={confirmationState.title}
        message={confirmationState.message}
      />
      <ImageLightbox imageUrl={lightboxImageUrl} onClose={closeLightbox} />
      <ToastContainer toasts={toasts} />
      {dayDetail && (
        <DayTasksModal
          date={dayDetail.date}
          tasks={dayDetail.tasks}
          notes={dayDetail.notes}
          isOpen={!!dayDetail}
          onClose={closeDayDetailModal}
        />
      )}
      <FocusModeModal />
      <ShortcutsModal isOpen={isShortcutsModalOpen} onClose={closeShortcutsModal} />
    </div>
  );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
