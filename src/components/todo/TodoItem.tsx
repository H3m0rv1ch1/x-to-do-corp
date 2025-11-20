import React, { useState, useRef, useEffect, useMemo, useId } from 'react';
import { type Todo, type Subtask, Priority, type RecurrenceType } from '@/types';
import { HiCheck, HiTrash, HiPencil, HiStar, HiOutlineStar, HiCalendar, HiPlay, HiPause, HiOutlinePhotograph, HiOutlineBell, HiDotsHorizontal, HiOutlineHashtag, HiHashtag, HiX } from 'react-icons/hi';
import { HiArrowPath, HiOutlineFlag, HiFlag } from 'react-icons/hi2';
import { useAppContext } from '@/hooks/useAppContext';
import { linkify } from '@/utils/textParser';
import { Tooltip, TagBadge, DatePicker, RecurrencePicker, ReminderPicker, PriorityPicker } from '@/components/ui';
import PortalMenu from '@/components/ui/PortalMenu';
import useClickOutside from '@/hooks/useClickOutside';
import { useAuth } from '@/hooks/useAuth';
import { uploadImage } from '@/services/imageUpload';

interface TodoItemProps {
  todo: Todo;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onEditTodo: (id: string, newText: string) => void;
  onToggleImportant: (id: string) => void;
  onToggleSubtask: (todoId: string, subtaskId: string) => void;
  onEditSubtask: (todoId: string, subtaskId: string, newText: string) => void;
  autoEdit?: boolean;
  onOpenComposerEdit?: (id: string) => void;
}

const priorityStyles: Record<Priority, string> = {
  high: 'bg-[rgba(var(--danger-rgb))]',
  medium: 'bg-[rgba(var(--warning-rgb))]',
  low: 'bg-[rgba(var(--accent-rgb))]',
  none: 'bg-transparent',
};

// Priority icon color removed as the priority button/picker is no longer rendered.


const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggleTodo, onDeleteTodo, onEditTodo, onToggleImportant, onToggleSubtask, onEditSubtask, autoEdit, onOpenComposerEdit }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const [isMounted, setIsMounted] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState<{ id: string, text: string } | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(todo.imageUrl);
  const [dueDate, setDueDate] = useState<string | null>(todo.dueDate);
  const [priority, setPriority] = useState<Priority>(todo.priority);
  const [recurrenceRule, setRecurrenceRule] = useState<{ type: RecurrenceType } | null>(todo.recurrenceRule);
  const [reminderOffset, setReminderOffset] = useState<number | null>(todo.reminderOffset);
  const [imageError, setImageError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>(todo.tags || []);
  const [currentTag, setCurrentTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  const {
    startFocusSession,
    openFocusModal,
    focusSession,
    openLightbox,
    handleTagClick,
    handleUpdateTodo
  } = useAppContext();

  const inputRef = useRef<HTMLInputElement>(null);
  const subtaskInputRef = useRef<HTMLInputElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const priorityPickerRef = useRef<HTMLDivElement>(null);
  const recurrencePickerRef = useRef<HTMLDivElement>(null);
  const reminderPickerRef = useRef<HTMLDivElement>(null);
  const moreOptionsRef = useRef<HTMLDivElement>(null);
  const moreOptionsButtonRef = useRef<HTMLButtonElement>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isPriorityPickerOpen, setIsPriorityPickerOpen] = useState(false);
  const [isRecurrencePickerOpen, setIsRecurrencePickerOpen] = useState(false);
  const [isReminderPickerOpen, setIsReminderPickerOpen] = useState(false);
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);

  useClickOutside(datePickerRef, () => setIsDatePickerOpen(false));
  useClickOutside(priorityPickerRef, () => setIsPriorityPickerOpen(false));
  useClickOutside(recurrencePickerRef, () => setIsRecurrencePickerOpen(false));
  useClickOutside(reminderPickerRef, () => setIsReminderPickerOpen(false));
  useClickOutside(moreOptionsRef, () => setIsMoreOptionsOpen(false));

  const uniqueId = useId();
  const imageUploadId = `todo-item-image-${uniqueId}`;


  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 10);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Auto-edit flag no longer enters local edit; composer handles editing.
  useEffect(() => {
    // Keep hook for future effects; no local edit toggle.
  }, [autoEdit]);

  useEffect(() => {
    if (editingSubtask && subtaskInputRef.current) {
      subtaskInputRef.current.focus();
    }
  }, [editingSubtask]);

  const handleEdit = () => {
    if (onOpenComposerEdit) {
      onOpenComposerEdit(todo.id);
      return;
    }
    // Fallback to local edit if composer callback not provided
    setIsEditing(true);
  };

  const handleSave = () => {
    const newText = editText.trim();
    if (!newText) {
      setIsEditing(false);
      return;
    }
    // Text-only save per request
    onEditTodo(todo.id, newText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    const targetDate = isEditing ? dueDate : todo.dueDate;
    if (!targetDate) {
      return { isOverdue: false, isToday: false, formattedDueDate: null };
    }
    const parsedDueDate = new Date(targetDate);
    const today = new Date();
    const todayAtUTCMidnight = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const isTaskOverdue = parsedDueDate.getTime() < todayAtUTCMidnight.getTime();
    const isTaskToday = parsedDueDate.getTime() === todayAtUTCMidnight.getTime();
    const formatted = new Date(targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    return { isOverdue: isTaskOverdue && !todo.completed, isToday: isTaskToday && !todo.completed, formattedDueDate: formatted };
  }, [todo.completed, dueDate]);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_FILE_SIZE) {
        setImageError('File is too large (max 5MB).');
        e.target.value = '';
        return;
      }

      if (!user?.id) {
        setImageError('You must be logged in to upload images.');
        return;
      }

      try {
        setImageError('Compressing and uploading...');

        // Compress and upload to Supabase Storage
        const publicUrl = await uploadImage(file, user.id, 'todos');

        // Set the URL
        setImageUrl(publicUrl);
        setImageError(null);
      } catch (error: any) {
        console.error('Image upload failed:', error);
        setImageError(error.message || 'Failed to upload image.');
        e.target.value = '';
      }
    }
  };

  const handleDateSelect = (date: Date) => {
    setDueDate(date.toISOString().split('T')[0]);
    setIsDatePickerOpen(false);
  };

  const formattedLongDueDate = dueDate ? new Date(dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleAddTag = () => {
    const newTag = currentTag.trim().replace(/[^a-zA-Z0-9]/g, '');
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    setCurrentTag('');
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setTags(tags.filter(tag => tag !== tagToDelete));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className={`group relative border-b border-[rgba(var(--border-primary-rgb))] hover:bg-[rgba(var(--background-secondary-rgb),0.5)] transition-all duration-300 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {todo.priority !== 'none' && (
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1.5 rounded-r-full ${priorityStyles[todo.priority]}`}></div>
      )}
      <div className="flex items-start p-4">
        <button
          onClick={() => onToggleTodo(todo.id)}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mr-4 mt-1 transition-colors duration-200 ${todo.completed
            ? 'border-[rgba(var(--accent-rgb))] bg-[rgba(var(--accent-rgb))]'
            : 'border-[rgba(var(--border-secondary-rgb))] group-hover:border-[rgba(var(--accent-rgb))]'
            }`}
          aria-label={todo.completed ? `Mark as not complete: ${todo.text}` : `Mark as complete: ${todo.text}`}
        >
          {todo.completed && <HiCheck className="w-4 h-4 text-white" />}
        </button>

        <div className="flex-grow min-w-0">
          {isEditing ? (
            <>
              <textarea
                ref={inputRef as any}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={2}
                className="w-full bg-transparent text-base text-[rgba(var(--foreground-primary-rgb))] focus:outline-none resize-none"
              />
              <div className="flex items-center justify-end space-x-3 pt-2 border-t border-[rgba(var(--border-primary-rgb))] mt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="bg-[rgba(var(--button-primary-bg-rgb))] text-[rgba(var(--button-primary-text-rgb))] font-bold px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="border border-[rgba(var(--border-secondary-rgb))] text-[rgba(var(--foreground-primary-rgb))] px-4 py-1.5 rounded-full hover:bg-[rgba(var(--foreground-primary-rgb),0.05)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p className={`text-[15px] leading-5 break-words ${todo.completed ? 'text-[rgba(var(--foreground-secondary-rgb))] line-through' : 'text-[rgba(var(--foreground-primary-rgb))]'}`}>
                {linkify(todo.text)}
              </p>

              {todo.imageUrl && (
                <div className="mt-3">
                  <img
                    src={todo.imageUrl}
                    alt="Task attachment"
                    className="rounded-2xl border border-[rgba(var(--border-primary-rgb))] max-h-72 w-auto cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); openLightbox(todo.imageUrl!); }}
                  />
                </div>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                {formattedDueDate && (
                  <div className={`flex items-center space-x-1.5 text-[13px] ${isOverdue ? 'text-[rgba(var(--danger-rgb))]' : isToday ? 'text-[rgba(var(--accent-rgb))]' : 'text-[rgba(var(--foreground-secondary-rgb))]'
                    }`}>
                    <HiCalendar className="w-3.5 h-3.5" />
                    <span>{isToday ? 'Today' : formattedDueDate}</span>
                  </div>
                )}
                {focusSession.todoId === todo.id && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); openFocusModal(); }}
                    className={`flex items-center space-x-1.5 text-[13px] px-2 py-0.5 rounded-full transition-colors ${focusSession.isActive ? 'bg-[rgba(var(--accent-rgb),0.18)] text-[rgba(var(--accent-rgb))]' : 'bg-[rgba(var(--background-tertiary-rgb))] text-[rgba(var(--foreground-secondary-rgb))]'}`}
                    title={focusSession.isActive ? 'Focus running' : 'Focus paused'}
                  >
                    {focusSession.isActive ? <HiPlay className="w-3.5 h-3.5" /> : <HiPause className="w-3.5 h-3.5" />}
                    <span>{formatTime(focusSession.timeRemaining)}</span>
                    {focusSession.cycles > 0 && <span className="opacity-70">• Cycle {focusSession.cycles}</span>}
                  </button>
                )}
                {todo.tags.length > 0 && (
                  <div className="flex items-center flex-wrap gap-1.5">
                    {todo.tags.map(tag => (
                      <TagBadge key={tag} tagName={tag} onClick={(e) => { e.stopPropagation(); handleTagClick(tag); }} />
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
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mr-3 transition-colors duration-200 ${subtask.completed
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
                            onChange={(e) => setEditingSubtask({ ...editingSubtask, text: e.target.value })}
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

        <div className={`flex items-center space-x-0.5 ml-4 flex-shrink-0 transition-opacity self-start mt-1 ${isMoreOptionsOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'}`}>
          <Tooltip text={todo.isImportant ? 'Unmark as important' : 'Mark as important'}>
            <button onClick={() => onToggleImportant(todo.id)} className={`p-2 rounded-full hover:bg-[rgba(var(--warning-rgb),0.1)] transition-colors ${todo.isImportant ? 'text-[rgba(var(--warning-rgb))]' : 'text-[rgba(var(--foreground-secondary-rgb))]'}`}>
              {todo.isImportant ? <HiStar className="w-5 h-5" /> : <HiOutlineStar className="w-5 h-5" />}
            </button>
          </Tooltip>
          <div className="relative" ref={moreOptionsRef}>
            <Tooltip text="More options">
              <button
                ref={moreOptionsButtonRef}
                onMouseDown={(e) => { e.stopPropagation(); }}
                onClick={() => setIsMoreOptionsOpen(prev => !prev)}
                className="p-2 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))] text-[rgba(var(--foreground-secondary-rgb))] hover:text-[rgba(var(--foreground-primary-rgb))] transition-colors"
                aria-label="More options"
                aria-haspopup="true"
                aria-expanded={isMoreOptionsOpen}
              >
                <HiDotsHorizontal className="w-5 h-5" />
              </button>
            </Tooltip>
            <PortalMenu anchorRef={moreOptionsButtonRef} isOpen={isMoreOptionsOpen}>
              <div className="w-56 bg-[rgba(var(--background-primary-rgb))] rounded-xl shadow-lg border border-[rgba(var(--border-primary-rgb))] py-1 animate-fade-in">
                {!todo.completed && (
                  <button
                    type="button"
                    onClick={() => { handleEdit(); setIsMoreOptionsOpen(false); }}
                    className="w-full text-left flex items-center space-x-3 px-3 py-2 text-sm text-[rgba(var(--foreground-primary-rgb))] hover:bg-[rgba(var(--foreground-primary-rgb),0.05)] transition-colors"
                  >
                    <HiPencil className="w-5 h-5" />
                    <span>Edit task</span>
                  </button>
                )}
                {!todo.completed && (
                  <button
                    type="button"
                    onClick={() => {
                      if (focusSession.todoId === todo.id && focusSession.isActive) {
                        openFocusModal();
                      } else {
                        startFocusSession(todo.id);
                      }
                      setIsMoreOptionsOpen(false);
                    }}
                    className="w-full text-left flex items-center space-x-3 px-3 py-2 text-sm text-[rgba(var(--foreground-primary-rgb))] hover:bg-[rgba(var(--foreground-primary-rgb),0.05)] transition-colors"
                  >
                    <HiPlay className="w-5 h-5" />
                    <span>Start focus session</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { onDeleteTodo(todo.id); setIsMoreOptionsOpen(false); }}
                  className="w-full text-left flex items-center space-x-3 px-3 py-2 text-sm text-[rgba(var(--foreground-primary-rgb))] hover:bg-[rgba(var(--foreground-primary-rgb),0.05)] transition-colors"
                >
                  <HiTrash className="w-5 h-5" />
                  <span>Delete task</span>
                </button>
              </div>
            </PortalMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TodoItem);