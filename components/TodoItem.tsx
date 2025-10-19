import React, { useState, useRef, useEffect, useMemo } from 'react';
import { type Todo, type Subtask, RecurrenceType, Priority } from '../types';
import { Check as CheckIcon, Trash2 as TrashIcon, Pencil as EditIcon, Star as StarIcon, Calendar as CalendarIcon, Repeat as RepeatIcon, Bell as BellIcon } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';
import { linkify } from '../utils/textParser';
import TagBadge from './TagBadge';
import { Play as PlayIcon, Pause as PauseIcon, Square as StopIcon, Maximize as FullScreenIcon, Flag as FlagIcon } from 'lucide-react';
import PriorityPicker from './PriorityPicker';
import useClickOutside from '../hooks/useClickOutside';

interface TodoItemProps {
  todo: Todo;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onEditTodo: (id: string, newText: string) => void;
  onToggleImportant: (id: string) => void;
  onToggleSubtask: (todoId: string, subtaskId: string) => void;
  onEditSubtask: (todoId: string, subtaskId: string, newText: string) => void;
}

const getReminderText = (offset: number | null): string => {
  if (offset === null) return '';
  if (offset === 0) return 'At time of due date';
  if (offset === 5) return '5 minutes before';
  if (offset === 15) return '15 minutes before';
  if (offset === 60) return '1 hour before';
  if (offset === 1440) return '1 day before';
  return `${offset} minutes before`;
};

const priorityStyles: Record<Priority, string> = {
    high: 'bg-[rgba(var(--danger-rgb))]',
    medium: 'bg-[rgba(var(--warning-rgb))]',
    low: 'bg-[rgba(var(--accent-rgb))]',
};

const priorityIconColor: Record<Priority, string> = {
    high: 'text-[rgba(var(--danger-rgb))]',
    medium: 'text-[rgba(var(--warning-rgb))]',
    low: 'text-[rgba(var(--accent-rgb))]',
};


const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggleTodo, onDeleteTodo, onEditTodo, onToggleImportant, onToggleSubtask, onEditSubtask }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [isMounted, setIsMounted] = useState(false);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskText, setEditingSubtaskText] = useState('');
  const [isPriorityPickerOpen, setIsPriorityPickerOpen] = useState(false);
  
  const { 
    openLightbox, 
    handleTagClick, 
    handleSetPriority,
    startFocusSession, 
    focusSession,
    toggleFocusSessionActive,
    stopFocusSession,
    openFocusModal,
  } = useAppContext();

  const inputRef = useRef<HTMLInputElement>(null);
  const subtaskInputRef = useRef<HTMLInputElement>(null);
  const priorityPickerRef = useRef<HTMLDivElement>(null);

  useClickOutside(priorityPickerRef, () => setIsPriorityPickerOpen(false));

  const isFocusingThisTodo = focusSession.todoId === todo.id;
  
  // Timer related calculations for inline view
  const { mode, timeRemaining, initialDuration, isActive } = focusSession;
  const progress = initialDuration > 0 ? ((initialDuration - timeRemaining) / initialDuration) * 100 : 0;
  
  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const modeText = {
      focus: 'Focus',
      shortBreak: 'Short Break',
      longBreak: 'Long Break',
  }[mode];


  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 10);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);
  
  useEffect(() => {
    if (editingSubtaskId && subtaskInputRef.current) {
        subtaskInputRef.current.focus();
    }
  }, [editingSubtaskId]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editText.trim() !== '') {
      onEditTodo(todo.id, editText.trim());
      setIsEditing(false);
    } else {
        handleCancel();
    }
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleEditSubtaskClick = (subtask: Subtask) => {
    setEditingSubtaskId(subtask.id);
    setEditingSubtaskText(subtask.text);
  };

  const handleSaveSubtask = () => {
    if (editingSubtaskId && editingSubtaskText.trim()) {
      onEditSubtask(todo.id, editingSubtaskId, editingSubtaskText.trim());
    }
    setEditingSubtaskId(null);
    setEditingSubtaskText('');
  };
  
  const handleCancelSubtaskEdit = () => {
    setEditingSubtaskId(null);
    setEditingSubtaskText('');
  };
  
  const handleSubtaskKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveSubtask();
    } else if (e.key === 'Escape') {
      handleCancelSubtaskEdit();
    }
  };
  
  const { isOverdue, isToday, formattedDueDate } = useMemo(() => {
    if (!todo.dueDate) {
      return { isOverdue: false, isToday: false, formattedDueDate: null };
    }
    
    // The input 'YYYY-MM-DD' is treated as UTC midnight by new Date().
    // We compare it with today's date at UTC midnight to avoid timezone issues.
    const dueDate = new Date(todo.dueDate); // e.g., 2024-07-25T00:00:00.000Z

    const today = new Date();
    const todayAtUTCMidnight = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

    const isTaskOverdue = dueDate.getTime() < todayAtUTCMidnight.getTime();
    const isTaskToday = dueDate.getTime() === todayAtUTCMidnight.getTime();
    
    const formatted = new Date(todo.dueDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      timeZone: 'UTC' 
    });

    return { 
      isOverdue: isTaskOverdue && !todo.completed, 
      isToday: isTaskToday && !todo.completed, 
      formattedDueDate: formatted 
    };
  }, [todo.dueDate, todo.completed]);

  const { subtaskProgress, completedSubtasks } = useMemo(() => {
    if (!todo.subtasks || todo.subtasks.length === 0) {
      return { subtaskProgress: null, completedSubtasks: 0 };
    }
    const completedCount = todo.subtasks.filter(st => st.completed).length;
    return {
      subtaskProgress: (completedCount / todo.subtasks.length) * 100,
      completedSubtasks: completedCount,
    }
  }, [todo.subtasks]);

  return (
    <div className={`relative pl-5 pr-4 py-4 border-b border-[rgba(var(--border-primary-rgb))] hover:bg-[rgba(var(--background-secondary-rgb),0.5)] transition-all duration-300 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${isFocusingThisTodo ? 'bg-[rgba(var(--accent-rgb),0.05)]' : ''}`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${priorityStyles[todo.priority]}`}></div>
      <div className="flex items-start">
        <button
          onClick={() => onToggleTodo(todo.id)}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mr-4 mt-1 transition-colors duration-200 ${
            todo.completed
              ? 'border-[rgba(var(--accent-rgb))] bg-[rgba(var(--accent-rgb))]'
              : 'border-[rgba(var(--border-secondary-rgb))] hover:border-[rgba(var(--accent-rgb))]'
          }`}
        >
          {todo.completed && <CheckIcon className="w-4 h-4 text-white" />}
        </button>

        <div className="flex-grow min-w-0">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              className="w-full bg-transparent text-[rgba(var(--foreground-primary-rgb))] text-lg focus:outline-none"
            />
          ) : (
            <>
              <p
                className={`text-lg break-words ${
                  todo.completed ? 'text-[rgba(var(--foreground-secondary-rgb))] line-through' : 'text-[rgba(var(--foreground-primary-rgb))]'
                }`}
              >
                {linkify(todo.text)}
              </p>
               {todo.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {todo.tags.map(tag => (
                    <TagBadge 
                      key={tag}
                      tagName={tag}
                      onClick={(e) => { e.stopPropagation(); handleTagClick(tag); }}
                    />
                  ))}
                </div>
              )}
               {todo.imageUrl && (
                <div 
                  className="mt-3 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); openLightbox(todo.imageUrl!); }}
                >
                    <img src={todo.imageUrl} alt="Task attachment" className="rounded-2xl border border-[rgba(var(--border-secondary-rgb))] max-h-80 w-auto" />
                </div>
              )}
              
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {formattedDueDate && (
                  <div className={`flex items-center space-x-1 text-sm ${
                    isOverdue ? 'text-[rgba(var(--danger-rgb))]' : isToday ? 'text-[rgba(var(--accent-rgb))]' : 'text-[rgba(var(--foreground-secondary-rgb))]'
                  }`}>
                      <CalendarIcon className="w-4 h-4" />
                      <span>{isToday ? 'Today' : formattedDueDate}</span>
                  </div>
                )}
                {todo.recurrenceRule && (
                  <div className="flex items-center space-x-1 text-sm text-[rgba(var(--foreground-secondary-rgb))] capitalize">
                      <RepeatIcon className="w-4 h-4" />
                      <span>{todo.recurrenceRule.type}</span>
                  </div>
                )}
                 {todo.reminderOffset !== null && todo.dueDate && (
                  <div className="flex items-center space-x-1 text-sm text-[rgba(var(--foreground-secondary-rgb))]">
                      <BellIcon className="w-4 h-4" />
                      <span>{getReminderText(todo.reminderOffset)}</span>
                  </div>
                )}
              </div>

              {subtaskProgress !== null && (
                <div className="mt-3">
                  <div className="w-full bg-[rgba(var(--border-secondary-rgb))] rounded-full h-1.5">
                    <div 
                      className="bg-[rgba(var(--accent-rgb))] h-1.5 rounded-full transition-all duration-300" 
                      style={{ width: `${subtaskProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-[rgba(var(--foreground-secondary-rgb))] mt-1.5">
                    {completedSubtasks} of {todo.subtasks?.length} subtasks completed
                  </p>
                </div>
              )}
              {todo.subtasks && todo.subtasks.length > 0 && (
                <div className="mt-3 space-y-2">
                    {todo.subtasks.map(subtask => (
                      <div key={subtask.id} className="flex items-center group">
                        <button
                          onClick={() => onToggleSubtask(todo.id, subtask.id)}
                          className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0 mr-3 transition-colors duration-200 ${
                            subtask.completed ? 'border-[rgba(var(--accent-rgb))] bg-[rgba(var(--accent-rgb))]' : 'border-[rgba(var(--border-secondary-rgb))] hover:border-[rgba(var(--accent-rgb))]'
                          }`}
                        >
                          {subtask.completed && <CheckIcon className="w-2.5 h-2.5 text-white" />}
                        </button>
                        
                        {editingSubtaskId === subtask.id ? (
                           <input
                              ref={subtaskInputRef}
                              type="text"
                              value={editingSubtaskText}
                              onChange={(e) => setEditingSubtaskText(e.target.value)}
                              onKeyDown={handleSubtaskKeyDown}
                              onBlur={handleSaveSubtask}
                              className="w-full bg-transparent text-sm text-[rgba(var(--foreground-primary-rgb))] focus:outline-none"
                            />
                        ) : (
                          <span 
                            onClick={() => handleEditSubtaskClick(subtask)}
                            className={`text-sm cursor-pointer ${subtask.completed ? 'text-[rgba(var(--foreground-secondary-rgb))] line-through' : 'text-[rgba(var(--foreground-primary-rgb))]'}`}>
                            {subtask.text}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Action buttons are hidden during focus mode here */}
        {!isFocusingThisTodo && (
        <div className="flex items-center space-x-1 ml-4 flex-shrink-0">
          <div className="relative" ref={priorityPickerRef}>
            <button
                onClick={() => setIsPriorityPickerOpen(prev => !prev)}
                className="p-2 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))] transition-colors duration-200"
                aria-label={`Change priority for: ${todo.text}`}
                title="Change priority"
            >
                <FlagIcon className={`w-5 h-5 ${priorityIconColor[todo.priority]}`} />
            </button>
            <PriorityPicker
                isOpen={isPriorityPickerOpen}
                onClose={() => setIsPriorityPickerOpen(false)}
                onSelect={(p) => handleSetPriority(todo.id, p)}
                currentPriority={todo.priority}
            />
          </div>
          {!todo.completed && (
             <button onClick={() => startFocusSession(todo.id)} className="p-2 rounded-full hover:bg-[rgba(var(--accent-rgb),0.1)] text-[rgba(var(--foreground-secondary-rgb))] hover:text-[rgba(var(--accent-rgb))] transition-colors duration-200" aria-label={`Start focus session for: ${todo.text}`} title="Start focus session">
                <PlayIcon className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => onToggleImportant(todo.id)}
            className={`p-2 rounded-full hover:bg-[rgba(var(--warning-rgb),0.1)] transition-colors duration-200 ${todo.isImportant ? 'text-[rgba(var(--warning-rgb))]' : 'text-[rgba(var(--foreground-secondary-rgb))]'}`}
            aria-label={todo.isImportant ? `Unmark as important: ${todo.text}` : `Mark as important: ${todo.text}`}
            title={todo.isImportant ? 'Unmark as important' : 'Mark as important'}
          >
            <StarIcon className="w-5 h-5" fill={todo.isImportant ? 'currentColor' : 'none'} />
          </button>
          {!todo.completed && (
            <button onClick={handleEdit} className="p-2 rounded-full hover:bg-[rgba(var(--accent-rgb),0.1)] text-[rgba(var(--foreground-secondary-rgb))] hover:text-[rgba(var(--accent-rgb))] transition-colors duration-200" aria-label={`Edit task: ${todo.text}`} title="Edit task">
              <EditIcon className="w-5 h-5" />
            </button>
          )}
          <button onClick={() => onDeleteTodo(todo.id)} className="p-2 rounded-full hover:bg-[rgba(var(--danger-rgb),0.1)] text-[rgba(var(--foreground-secondary-rgb))] hover:text-[rgba(var(--danger-rgb))] transition-colors duration-200" aria-label={`Delete task: ${todo.text}`} title="Delete task">
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
        )}
      </div>
      {isFocusingThisTodo && (
          <div className="mt-4 pt-4 border-t border-[rgba(var(--border-primary-rgb))] w-full">
              <div className="w-full bg-[rgba(var(--border-primary-rgb))] rounded-full h-1.5 mb-3">
                  <div className="bg-[rgba(var(--accent-rgb))] h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  {/* Left side: Timer controls */}
                  <div className="flex items-center space-x-2">
                      <button onClick={toggleFocusSessionActive} className="p-2 rounded-full hover:bg-[rgba(var(--accent-rgb),0.1)] text-[rgba(var(--foreground-secondary-rgb))] hover:text-[rgba(var(--accent-rgb))] transition-colors" aria-label={isActive ? 'Pause timer' : 'Resume timer'}>
                          {isActive ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                      </button>
                      <span className="text-lg font-mono font-bold text-[rgba(var(--foreground-primary-rgb))]">{formatTime(timeRemaining)}</span>
                      <span className="text-xs font-bold text-[rgba(var(--accent-rgb))] bg-[rgba(var(--accent-rgb),0.1)] px-2 py-1 rounded-full uppercase">{modeText}</span>
                       <button onClick={stopFocusSession} className="p-2 rounded-full hover:bg-[rgba(var(--danger-rgb),0.1)] text-[rgba(var(--foreground-secondary-rgb))] hover:text-[rgba(var(--danger-rgb))] transition-colors" aria-label="Stop focus session">
                          <StopIcon className="w-5 h-5" />
                      </button>
                      <button onClick={openFocusModal} className="p-2 rounded-full hover:bg-[rgba(var(--accent-rgb),0.1)] text-[rgba(var(--foreground-secondary-rgb))] hover:text-[rgba(var(--accent-rgb))] transition-colors" aria-label="Expand focus view">
                          <FullScreenIcon className="w-5 h-5" />
                      </button>
                  </div>
                  {/* Right side: Task actions */}
                  <div className="flex items-center space-x-1 self-end sm:self-center">
                      <div className="relative" ref={priorityPickerRef}>
                        <button
                            onClick={() => setIsPriorityPickerOpen(prev => !prev)}
                            className="p-2 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))] transition-colors duration-200"
                            aria-label={`Change priority for: ${todo.text}`}
                            title="Change priority"
                        >
                            <FlagIcon className={`w-5 h-5 ${priorityIconColor[todo.priority]}`} />
                        </button>
                        <PriorityPicker
                            isOpen={isPriorityPickerOpen}
                            onClose={() => setIsPriorityPickerOpen(false)}
                            onSelect={(p) => handleSetPriority(todo.id, p)}
                            currentPriority={todo.priority}
                        />
                      </div>
                      <button
                        onClick={() => onToggleImportant(todo.id)}
                        className={`p-2 rounded-full hover:bg-[rgba(var(--warning-rgb),0.1)] transition-colors duration-200 ${todo.isImportant ? 'text-[rgba(var(--warning-rgb))]' : 'text-[rgba(var(--foreground-secondary-rgb))]'}`}
                        aria-label={todo.isImportant ? `Unmark as important: ${todo.text}` : `Mark as important: ${todo.text}`}
                        title={todo.isImportant ? 'Unmark as important' : 'Mark as important'}
                      >
                        <StarIcon className="w-5 h-5" fill={todo.isImportant ? 'currentColor' : 'none'} />
                      </button>
                      {!todo.completed && (
                        <button onClick={handleEdit} className="p-2 rounded-full hover:bg-[rgba(var(--accent-rgb),0.1)] text-[rgba(var(--foreground-secondary-rgb))] hover:text-[rgba(var(--accent-rgb))] transition-colors duration-200" aria-label={`Edit task: ${todo.text}`} title="Edit task">
                          <EditIcon className="w-5 h-5" />
                        </button>
                      )}
                      <button onClick={() => onDeleteTodo(todo.id)} className="p-2 rounded-full hover:bg-[rgba(var(--danger-rgb),0.1)] text-[rgba(var(--foreground-secondary-rgb))] hover:text-[rgba(var(--danger-rgb))] transition-colors duration-200" aria-label={`Delete task: ${todo.text}`} title="Delete task">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

// Fix: Add default export to make it importable in other files.
export default TodoItem;