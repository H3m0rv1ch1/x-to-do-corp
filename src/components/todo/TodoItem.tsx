import React, { useState, useRef, useEffect, useMemo } from 'react';
import { type Todo, type Subtask, Priority } from '@/types';
import { HiCheck, HiTrash, HiPencil, HiStar, HiOutlineStar, HiCalendar, HiPlay, HiFlag } from 'react-icons/hi';
import { useAppContext } from '@/hooks/useAppContext';
import { linkify } from '@/utils/textParser';
import { PriorityPicker, Tooltip, TagBadge } from '@/components/ui';
import useClickOutside from '@/hooks/useClickOutside';

interface TodoItemProps {
  todo: Todo;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onEditTodo: (id: string, newText: string) => void;
  onToggleImportant: (id: string) => void;
  onToggleSubtask: (todoId: string, subtaskId: string) => void;
  onEditSubtask: (todoId: string, subtaskId: string, newText: string) => void;
}

const priorityStyles: Record<Priority, string> = {
    high: 'bg-[rgba(var(--danger-rgb))]',
    medium: 'bg-[rgba(var(--warning-rgb))]',
    low: 'bg-[rgba(var(--accent-rgb))]',
    none: 'bg-transparent',
};

const priorityIconColor: Record<Priority, string> = {
    high: 'text-[rgba(var(--danger-rgb))]',
    medium: 'text-[rgba(var(--warning-rgb))]',
    low: 'text-[rgba(var(--accent-rgb))]',
    none: 'text-[rgba(var(--foreground-secondary-rgb))]',
};


const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggleTodo, onDeleteTodo, onEditTodo, onToggleImportant, onToggleSubtask, onEditSubtask }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [isMounted, setIsMounted] = useState(false);
  const [isPriorityPickerOpen, setIsPriorityPickerOpen] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState<{ id: string, text: string } | null>(null);
  
  const { 
    handleSetPriority,
    startFocusSession, 
    openLightbox,
    handleTagClick
  } = useAppContext();

  const inputRef = useRef<HTMLInputElement>(null);
  const subtaskInputRef = useRef<HTMLInputElement>(null);
  const priorityPickerRef = useRef<HTMLDivElement>(null);

  useClickOutside(priorityPickerRef, () => setIsPriorityPickerOpen(false));

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
    if (editingSubtask && subtaskInputRef.current) {
        subtaskInputRef.current.focus();
    }
  }, [editingSubtask]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editText.trim() !== '') {
      onEditTodo(todo.id, editText.trim());
    }
    setIsEditing(false);
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
    setEditingSubtask({ id: subtask.id, text: subtask.text });
  };

  const handleSaveSubtask = () => {
    if (editingSubtask && editingSubtask.text.trim()) {
        onEditSubtask(todo.id, editingSubtask.id, editingSubtask.text.trim());
    }
    setEditingSubtask(null);
  };
  
  const handleSubtaskKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSaveSubtask();
    if (e.key === 'Escape') setEditingSubtask(null);
  };
  
  const { isOverdue, isToday, formattedDueDate } = useMemo(() => {
    if (!todo.dueDate) {
      return { isOverdue: false, isToday: false, formattedDueDate: null };
    }
    const dueDate = new Date(todo.dueDate);
    const today = new Date();
    const todayAtUTCMidnight = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const isTaskOverdue = dueDate.getTime() < todayAtUTCMidnight.getTime();
    const isTaskToday = dueDate.getTime() === todayAtUTCMidnight.getTime();
    const formatted = new Date(todo.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    return { isOverdue: isTaskOverdue && !todo.completed, isToday: isTaskToday && !todo.completed, formattedDueDate: formatted };
  }, [todo.dueDate, todo.completed]);

  return (
    <div className={`group relative border-b border-[rgba(var(--border-primary-rgb))] hover:bg-[rgba(var(--background-secondary-rgb),0.5)] transition-all duration-300 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {todo.priority !== 'none' && (
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1.5 rounded-r-full ${priorityStyles[todo.priority]}`}></div>
      )}
      <div className="flex items-start p-4">
        <button
          onClick={() => onToggleTodo(todo.id)}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mr-4 mt-1 transition-colors duration-200 ${
            todo.completed
              ? 'border-[rgba(var(--accent-rgb))] bg-[rgba(var(--accent-rgb))]'
              : 'border-[rgba(var(--border-secondary-rgb))] group-hover:border-[rgba(var(--accent-rgb))]'
          }`}
          aria-label={todo.completed ? `Mark as not complete: ${todo.text}` : `Mark as complete: ${todo.text}`}
        >
          {todo.completed && <HiCheck className="w-4 h-4 text-white" />}
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
              className="w-full bg-transparent text-base text-[rgba(var(--foreground-primary-rgb))] focus:outline-none"
            />
          ) : (
            <>
              <p className={`text-[15px] leading-5 break-words ${todo.completed ? 'text-[rgba(var(--foreground-secondary-rgb))] line-through' : 'text-[rgba(var(--foreground-primary-rgb))]'}`}>
                {linkify(todo.text)}
              </p>
              
              {todo.imageUrl && (
                <div className="mt-3" onClick={() => openLightbox(todo.imageUrl!)}>
                  <img src={todo.imageUrl} alt="Task attachment" className="rounded-2xl border border-[rgba(var(--border-primary-rgb))] max-h-72 w-auto cursor-pointer" />
                </div>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                {formattedDueDate && (
                  <div className={`flex items-center space-x-1.5 text-[13px] ${
                    isOverdue ? 'text-[rgba(var(--danger-rgb))]' : isToday ? 'text-[rgba(var(--accent-rgb))]' : 'text-[rgba(var(--foreground-secondary-rgb))]'
                  }`}>
                      <HiCalendar className="w-3.5 h-3.5" />
                      <span>{isToday ? 'Today' : formattedDueDate}</span>
                  </div>
                )}
                {todo.tags.length > 0 && (
                  <div className="flex items-center flex-wrap gap-1.5">
                    {todo.tags.map(tag => (
                      <TagBadge key={tag} tagName={tag} onClick={(e) => { e.stopPropagation(); handleTagClick(tag); }}/>
                    ))}
                  </div>
                )}
              </div>
              
              {todo.subtasks && todo.subtasks.length > 0 && (
                <div className="mt-3 pl-2 border-l-2 border-[rgba(var(--border-secondary-rgb))] space-y-2">
                  {todo.subtasks.map(subtask => (
                    <div key={subtask.id} className="flex items-center group/subtask">
                      <button
                        onClick={() => onToggleSubtask(todo.id, subtask.id)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mr-3 transition-colors duration-200 ${
                          subtask.completed
                            ? 'border-[rgba(var(--accent-rgb))] bg-[rgba(var(--accent-rgb))]'
                            : 'border-[rgba(var(--border-secondary-rgb))] group-hover/subtask:border-[rgba(var(--accent-rgb))]'
                        }`}
                        aria-label={subtask.completed ? `Mark subtask as not complete: ${subtask.text}` : `Mark subtask as complete: ${subtask.text}`}
                      >
                        {subtask.completed && <HiCheck className="w-3 h-3 text-white" />}
                      </button>
                      
                      <div className="flex-grow">
                        {editingSubtask?.id === subtask.id ? (
                           <input
                            ref={subtaskInputRef}
                            type="text"
                            value={editingSubtask.text}
                            onChange={(e) => setEditingSubtask({...editingSubtask, text: e.target.value})}
                            onKeyDown={handleSubtaskKeyDown}
                            onBlur={handleSaveSubtask}
                            className="w-full bg-transparent text-sm text-[rgba(var(--foreground-primary-rgb))] focus:outline-none"
                           />
                        ) : (
                           <span
                            onClick={() => handleEditSubtaskClick(subtask)}
                            className={`text-sm cursor-pointer ${subtask.completed ? 'line-through text-[rgba(var(--foreground-secondary-rgb))]' : ''}`}
                           >
                            {subtask.text}
                           </span>
                        )}
                      </div>

                      {!subtask.completed && !isEditing && (
                        <div className="ml-2 opacity-0 group-hover/subtask:opacity-100 transition-opacity">
                            <Tooltip text="Edit subtask">
                                <button onClick={() => handleEditSubtaskClick(subtask)} className="p-1 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))] text-[rgba(var(--foreground-secondary-rgb))]">
                                    <HiPencil className="w-4 h-4" />
                                </button>
                            </Tooltip>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center space-x-0.5 ml-4 flex-shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity self-start mt-1">
          <div className="relative" ref={priorityPickerRef}>
            <Tooltip text="Change priority">
              <button onClick={() => setIsPriorityPickerOpen(prev => !prev)} className="p-2 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))] transition-colors duration-200">
                  <HiFlag className={`w-5 h-5 ${priorityIconColor[todo.priority]}`} />
              </button>
            </Tooltip>
            <PriorityPicker isOpen={isPriorityPickerOpen} onClose={() => setIsPriorityPickerOpen(false)} onSelect={(p) => handleSetPriority(todo.id, p)} currentPriority={todo.priority} />
          </div>
          {!todo.completed && (
             <Tooltip text="Start focus session">
               <button onClick={() => startFocusSession(todo.id)} className="p-2 rounded-full hover:bg-[rgba(var(--accent-rgb),0.1)] text-[rgba(var(--foreground-secondary-rgb))] hover:text-[rgba(var(--accent-rgb))] transition-colors">
                  <HiPlay className="w-5 h-5" />
              </button>
             </Tooltip>
          )}
          <Tooltip text={todo.isImportant ? 'Unmark as important' : 'Mark as important'}>
            <button onClick={() => onToggleImportant(todo.id)} className={`p-2 rounded-full hover:bg-[rgba(var(--warning-rgb),0.1)] transition-colors ${todo.isImportant ? 'text-[rgba(var(--warning-rgb))]' : 'text-[rgba(var(--foreground-secondary-rgb))]'}`}>
              {todo.isImportant ? <HiStar className="w-5 h-5" /> : <HiOutlineStar className="w-5 h-5" />}
            </button>
          </Tooltip>
          {!todo.completed && (
            <Tooltip text="Edit task">
              <button onClick={handleEdit} className="p-2 rounded-full hover:bg-[rgba(var(--accent-rgb),0.1)] text-[rgba(var(--foreground-secondary-rgb))] hover:text-[rgba(var(--accent-rgb))] transition-colors">
                <HiPencil className="w-5 h-5" />
              </button>
            </Tooltip>
          )}
          <Tooltip text="Delete task">
            <button onClick={() => onDeleteTodo(todo.id)} className="p-2 rounded-full hover:bg-[rgba(var(--danger-rgb),0.1)] text-[rgba(var(--foreground-secondary-rgb))] hover:text-[rgba(var(--danger-rgb))] transition-colors">
              <HiTrash className="w-5 h-5" />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default TodoItem;