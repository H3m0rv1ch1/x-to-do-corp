import React, { useMemo, useState } from 'react';
import { HiSearch, HiStar, HiOutlineStar } from 'react-icons/hi';
import { MdOutlineKeyboard } from 'react-icons/md';
import { useAppContext } from '@/hooks/useAppContext';
import { DeveloperPromo } from '@/components/ui';

const RightSidebar: React.FC = () => {
  const { todos, setPage, setFilter, searchQuery, setSearchQuery, openShortcutsModal } = useAppContext();

  const [showAllPriorityTasks, setShowAllPriorityTasks] = useState(false);

  const { allPriorityTasks, tasksToShow } = useMemo(() => {
    const importantPending = todos.filter(t => t.isImportant && !t.completed);
    const otherPending = todos.filter(t => !t.isImportant && !t.completed);
    const combined = [...importantPending, ...otherPending];
    return {
      allPriorityTasks: combined,
      tasksToShow: showAllPriorityTasks ? combined : combined.slice(0, 2),
    };
  }, [todos, showAllPriorityTasks]);

  const handleShowMore = () => {
    setFilter('all');
    setPage('home');
  }

  const toggleShowAll = () => setShowAllPriorityTasks(prev => !prev);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if(e.target.value.trim() !== ''){
        setPage('home'); // Switch to home view to show search results
    }
  }

  return (
    <aside className="sticky top-0 h-screen hidden xl:flex flex-col space-y-4 py-2 px-4 ml-4 w-[380px] flex-shrink-0 bg-[rgba(var(--background-primary-rgb))]">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <HiSearch className="w-5 h-5 text-[rgba(var(--foreground-secondary-rgb))]" />
        </div>
        <input
          id="global-search-input"
          type="text"
          placeholder="Search Tasks"
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full bg-[rgba(var(--background-primary-rgb))] border border-[rgba(var(--border-primary-rgb))] text-[rgba(var(--foreground-primary-rgb))] rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-[rgba(var(--accent-rgb))]"
        />
      </div>

      <div className="bg-[rgba(var(--background-primary-rgb))] border border-[rgba(var(--border-primary-rgb))] rounded-xl p-4">
        <h2 className="text-xl font-bold text-[rgba(var(--foreground-primary-rgb))] mb-4">Task Priority</h2>
        <div className="space-y-4">
          {tasksToShow.length > 0 ? (
            tasksToShow.map((task) => (
              <div key={task.id} className="group cursor-pointer rounded-lg -m-2 p-2 hover:bg-[rgba(var(--foreground-primary-rgb),0.05)] transition-colors duration-200" onClick={handleShowMore}>
                <div className="flex justify-between items-center">
                    <p className="text-[rgba(var(--foreground-secondary-rgb))] text-sm">{task.isImportant ? 'High Priority' : 'Upcoming'}</p>
                    {task.isImportant && <HiStar className="w-4 h-4 text-[rgba(var(--warning-rgb))]" />}
                </div>
                <p className="font-bold text-[rgba(var(--foreground-primary-rgb))] group-hover:underline truncate">{task.text}</p>
              </div>
            ))
          ) : (
            <p className="text-[rgba(var(--foreground-secondary-rgb))] text-sm">No pending tasks. Add one to get started!</p>
          )}
        </div>
        {allPriorityTasks.length > 2 && (
          <div className="mt-4 flex items-center justify-between">
            <button onClick={toggleShowAll} className="text-[rgba(var(--accent-rgb))] hover:underline text-sm p-2 -m-2">
              {showAllPriorityTasks ? 'Show less' : `Show more (${allPriorityTasks.length - 2})`}
            </button>
            <button onClick={handleShowMore} className="text-[rgba(var(--foreground-secondary-rgb))] hover:underline text-xs p-2 -m-2">
              View all
            </button>
          </div>
        )}
      </div>

      <button
        onClick={openShortcutsModal}
        className="w-full text-left p-3 rounded-xl bg-[rgba(var(--background-primary-rgb))] border border-[rgba(var(--border-primary-rgb))] hover:bg-[rgba(var(--background-tertiary-rgb))] transition-colors flex items-center space-x-3"
      >
        <MdOutlineKeyboard className="w-5 h-5 text-[rgba(var(--foreground-secondary-rgb))]" />
        <span className="font-semibold text-[rgba(var(--foreground-primary-rgb))]">Keyboard shortcuts</span>
      </button>

      <DeveloperPromo />
      
       <footer className="text-xs text-[rgba(var(--foreground-secondary-rgb))] mt-4 space-x-2">
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Cookie Policy</a>
            <a href="#" className="hover:underline">Accessibility</a>
            <a href="#" className="hover:underline">Ads info</a>
            <span>© {new Date().getFullYear()} X To-Do Corp</span>
        </footer>
    </aside>
  );
};

export default RightSidebar;