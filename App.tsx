import React, { useEffect } from 'react';
import Header from './components/Header';
import TodoList from './components/TodoList';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import ProfilePage from './components/ProfilePage';
import NotesPage from './components/NotesPage';
import AchievementsPage from './components/AchievementsPage';
import SettingsPage from './components/SettingsPage';
import CalendarPage from './components/CalendarPage';
import BottomNavbar from './components/BottomNavbar';
import AddTaskFab from './components/AddTaskFab';
import { AppProvider } from './contexts/AppContext';
import { useAppContext } from './hooks/useAppContext';
import AddTaskModal from './components/AddTaskModal';
import ConfirmationModal from './components/ConfirmationModal';
import ImageLightbox from './components/ImageLightbox';
import ToastContainer from './components/ToastContainer';
import DayDetailModal from './components/DayTasksModal';
import FocusModeModal from './components/FocusModeModal';
import ShortcutsModal from './components/ShortcutsModal';


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
  
  const renderPage = () => {
    switch(page) {
      case 'home':
        return (
          <>
            <Header />
            <TodoList />
          </>
        );
      case 'profile':
        return (
          <ProfilePage 
            userProfile={userProfile}
            setPage={setPage}
          />
        );
      case 'notes':
         return (
            <NotesPage />
        );
      case 'achievements':
        return <AchievementsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'calendar':
        return <CalendarPage />;
      default:
        return null;
    }
  }

  const handleConfirm = () => {
    confirmationState.onConfirm();
    hideConfirmation();
  };

  return (
    <div className="bg-[rgba(var(--background-primary-rgb))] min-h-screen text-[rgba(var(--foreground-primary-rgb))] font-sans">
      <div className="container mx-auto flex justify-center">
        <LeftSidebar />
        <div className="w-full" style={{ maxWidth: '990px' }}>
            <div className="flex justify-between">
                <main className="w-full xl:max-w-[600px] border-l border-r border-[rgba(var(--border-primary-rgb))] pb-16 md:pb-0" style={{ minWidth: 0, minHeight: '100vh' }}>
                {renderPage()}
                </main>
                <RightSidebar />
            </div>
        </div>
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
        <DayDetailModal
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
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;