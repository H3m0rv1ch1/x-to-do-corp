import React, { useMemo, useState, useEffect, useRef } from 'react';
import { HiX } from 'react-icons/hi';
import { type Todo } from '@/types';
import TodoItem from './TodoItem';
import { useAppContext } from '@/hooks/useAppContext';
import AddTodoForm from './AddTodoForm';
import TodoItemSkeleton from './TodoItemSkeleton';
import { TagBadge } from '@/components/ui';
import { WelcomeGuide } from '@/components/modals';

interface TodoListProps {}

const EmptyState: React.FC<{filter: string, searchQuery: string}> = ({ filter, searchQuery }) => {
  if (searchQuery) {
    return (
        <div className="text-center p-8 text-[rgba(var(--foreground-secondary-rgb))]">
            <div className="max-w-xs mx-auto">
                <h2 className="text-2xl font-bold text-[rgba(var(--foreground-primary-rgb))] mb-2">No results for "{searchQuery}"</h2>
                <p>Try searching for something else, or check your spelling.</p>
            </div>
        </div>
    )
  }

  const messages = {
    all: {
      title: "All clear!",
      body: "Looks like your to-do list is empty. Add a new task to get started!",
    },
    pending: {
      title: "Nothing pending",
      body: "You've completed all your tasks. Great job!",
    },
    completed: {
      title: "No completed tasks yet",
      body: "Get started on your list and check some items off!",
    },
    important: {
        title: "No important tasks",
        body: "Click the star on a task to mark it as important.",
    }
  };
  const {title, body} = messages[filter] || messages.all;

  return (
    <div className="text-center p-8 text-[rgba(var(--foreground-secondary-rgb))]">
      <div className="max-w-xs mx-auto">
        <h2 className="text-2xl font-bold text-[rgba(var(--foreground-primary-rgb))] mb-2">{title}</h2>
        <p>{body}</p>
      </div>
    </div>
  )
}

const TodoList: React.FC<TodoListProps> = () => {
  const { 
    isLoading,
    todos,
    filteredTodos, 
    filter, 
    setFilter,
    handleToggleTodo, 
    handleDeleteTodo, 
    handleEditTodo, 
    handleToggleImportant,
    handleAddTodo,
    userProfile,
    handleToggleSubtask,
    handleEditSubtask,
    handleUpdateTodo,
    activeTag,
    clearActiveTag,
    searchQuery,
    setSearchQuery,
    openAddTaskModal,
  } = useAppContext();

  const [isWelcomeVisible, setIsWelcomeVisible] = useState(false);
  const [composerEditId, setComposerEditId] = useState<string | null>(null);
  const composerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasDismissedWelcome = localStorage.getItem('hasDismissedWelcomeGuide');
    if (!hasDismissedWelcome && todos.length === 0) {
        setIsWelcomeVisible(true);
    } else if (hasDismissedWelcome && isWelcomeVisible) {
        // Hide if it was dismissed in another tab
        setIsWelcomeVisible(false);
    }
  }, [todos.length]);
  
  // Auto-hide welcome guide when first task is added
  useEffect(() => {
    if (todos.length > 0 && isWelcomeVisible) {
        handleDismissWelcome();
    }
  }, [todos.length, isWelcomeVisible]);

  const handleDismissWelcome = () => {
    localStorage.setItem('hasDismissedWelcomeGuide', 'true');
    setIsWelcomeVisible(false);
  };

  const handleGetStarted = () => {
    handleDismissWelcome();
    openAddTaskModal();
  };

  const isSearching = searchQuery.trim() !== '';
  
  // Smooth-scroll composer into view when entering edit mode
  useEffect(() => {
    if (composerEditId && composerRef.current) {
      composerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [composerEditId]);
  
  const visuallySortedTodos = useMemo(() => {
    // Move completed tasks to the bottom for 'all' and 'important' filters
    // to keep focus on what's pending.
    if (filter === 'all' || filter === 'important') {
        return [...filteredTodos].sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            return 0; // Keep original sort order from context within groups
        });
    }
    return filteredTodos;
  }, [filteredTodos, filter]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div>
          <TodoItemSkeleton />
          <TodoItemSkeleton />
          <TodoItemSkeleton />
          <TodoItemSkeleton />
        </div>
      );
    }
    if (filteredTodos.length === 0) {
        if (isWelcomeVisible && filter === 'all' && !searchQuery) {
            return <WelcomeGuide onDismiss={handleDismissWelcome} onGetStarted={handleGetStarted} />;
        }
        return <EmptyState filter={filter} searchQuery={searchQuery} />;
    }
    return (
      <div>
        {visuallySortedTodos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggleTodo={handleToggleTodo}
            onDeleteTodo={handleDeleteTodo}
            onEditTodo={handleEditTodo}
            onToggleImportant={handleToggleImportant}
            onToggleSubtask={handleToggleSubtask}
            onEditSubtask={handleEditSubtask}
            onOpenComposerEdit={(id) => setComposerEditId(id)}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Track the last added todo to auto-open its edit mode */}
      {/** Local state to store last added todo id */}
      
    {!isSearching && (
        <div className="sticky top-16 bg-[rgba(var(--background-primary-rgb),0.8)] backdrop-blur-md z-10 border-b border-[rgba(var(--border-primary-rgb))]">
          <div className="overflow-x-auto no-scrollbar">
            <div className="flex justify-center md:justify-start w-full">
              <button onClick={() => setFilter('all')} className={`p-4 text-center whitespace-nowrap px-4 sm:flex-1 hover:bg-[rgba(var(--background-tertiary-rgb))] transition-colors duration-200 ${filter === 'all' ? 'font-bold border-b-2 border-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-primary-rgb))]' : 'text-[rgba(var(--foreground-secondary-rgb))]'}`}>All</button>
              <button onClick={() => setFilter('important')} className={`p-4 text-center whitespace-nowrap px-4 sm:flex-1 hover:bg-[rgba(var(--background-tertiary-rgb))] transition-colors duration-200 ${filter === 'important' ? 'font-bold border-b-2 border-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-primary-rgb))]' : 'text-[rgba(var(--foreground-secondary-rgb))]'}`}>Important</button>
              <button onClick={() => setFilter('pending')} className={`p-4 text-center whitespace-nowrap px-4 sm:flex-1 hover:bg-[rgba(var(--background-tertiary-rgb))] transition-colors duration-200 ${filter === 'pending' ? 'font-bold border-b-2 border-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-primary-rgb))]' : 'text-[rgba(var(--foreground-secondary-rgb))]'}`}>Pending</button>
              <button onClick={() => setFilter('completed')} className={`p-4 text-center whitespace-nowrap px-4 sm:flex-1 hover:bg-[rgba(var(--background-tertiary-rgb))] transition-colors duration-200 ${filter === 'completed' ? 'font-bold border-b-2 border-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-primary-rgb))]' : 'text-[rgba(var(--foreground-secondary-rgb))]'}`}>Completed</button>
            </div>
          </div>
        </div>
      )}
      {activeTag && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-[rgba(var(--border-primary-rgb))] bg-[rgba(var(--background-secondary-rgb),0.5)] animate-fade-in">
          <div className="flex items-center space-x-2">
            <span className="text-[rgba(var(--foreground-secondary-rgb))] text-sm">
              Filtered by:
            </span>
            <TagBadge tagName={activeTag} />
          </div>
          <button
            onClick={clearActiveTag}
            className="p-1 rounded-full text-[rgba(var(--foreground-secondary-rgb))] hover:bg-[rgba(var(--background-tertiary-rgb))] hover:text-[rgba(var(--foreground-primary-rgb))] transition-colors"
            aria-label="Clear tag filter"
          >
            <HiX className="w-4 h-4" />
          </button>
        </div>
      )}
      {isSearching && (
         <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(var(--border-primary-rgb))] bg-[rgba(var(--background-secondary-rgb),0.5)] animate-fade-in">
            <p className="text-[rgba(var(--foreground-secondary-rgb))] text-sm truncate">
                Showing results for: <span className="font-bold text-[rgba(var(--foreground-primary-rgb))]">"{searchQuery}"</span>
            </p>
            <button
                onClick={() => setSearchQuery('')}
                className="text-sm font-semibold text-[rgba(var(--accent-rgb))] hover:underline whitespace-nowrap ml-4"
            >
                Clear
            </button>
         </div>
      )}
      <div ref={composerRef} className="border-b border-[rgba(var(--border-primary-rgb))] hidden md:block">
        <AddTodoForm 
          onAddTodo={handleAddTodo} 
          userProfile={userProfile}
          onTaskAdded={(id) => setComposerEditId(id)}
          editingTodo={composerEditId ? todos.find(t => t.id === composerEditId) || null : null}
          onUpdateTodo={handleUpdateTodo}
          onEditCancel={() => setComposerEditId(null)}
        />
      </div>
      {renderContent()}
    </>
  );
};

export default TodoList;