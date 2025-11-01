
import React, { useState, useRef, useId } from 'react';
import { HiOutlinePhotograph, HiOutlineCalendar, HiOutlineBell, HiX, HiDotsHorizontal, HiOutlineHashtag, HiHashtag } from 'react-icons/hi';
import { HiArrowPath, HiOutlineFlag, HiFlag } from 'react-icons/hi2';
import { HiOutlineViewList } from 'react-icons/hi';
import { Avatar, DatePicker, RecurrencePicker, ReminderPicker, PriorityPicker, Tooltip } from '@/components/ui';
import { type UserProfile, type RecurrenceType, type Priority } from '@/types';
import useClickOutside from '@/hooks/useClickOutside';

interface AddTodoFormProps {
  onAddTodo: (todoData: { text: string; imageUrl: string | null; dueDate: string | null; priority: Priority; subtasks: string[], tags: string[], recurrenceRule: { type: RecurrenceType } | null, reminderOffset: number | null }) => void;
  userProfile: UserProfile;
  onTaskAdded?: () => void;
}

const AddTodoForm: React.FC<AddTodoFormProps> = ({ onAddTodo, userProfile, onTaskAdded }) => {
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority>('none');
  const [recurrenceRule, setRecurrenceRule] = useState<{ type: RecurrenceType } | null>(null);
  const [reminderOffset, setReminderOffset] = useState<number | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [currentSubtask, setCurrentSubtask] = useState('');
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);

  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const [isPriorityPickerOpen, setIsPriorityPickerOpen] = useState(false);
  const priorityPickerRef = useRef<HTMLDivElement>(null);
  const [isRecurrencePickerOpen, setIsRecurrencePickerOpen] = useState(false);
  const recurrencePickerRef = useRef<HTMLDivElement>(null);
  const [isReminderPickerOpen, setIsReminderPickerOpen] = useState(false);
  const reminderPickerRef = useRef<HTMLDivElement>(null);
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false);
  const moreOptionsRef = useRef<HTMLDivElement>(null);

  useClickOutside(datePickerRef, () => setIsDatePickerOpen(false));
  useClickOutside(priorityPickerRef, () => setIsPriorityPickerOpen(false));
  useClickOutside(recurrencePickerRef, () => setIsRecurrencePickerOpen(false));
  useClickOutside(reminderPickerRef, () => setIsReminderPickerOpen(false));
  useClickOutside(moreOptionsRef, () => setIsMoreOptionsOpen(false));


  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const uniqueId = useId();
  const imageUploadId = `image-upload-${uniqueId}`;

  const MAX_CHARS = 280;
  const charsLeft = MAX_CHARS - text.length;
  
  const handleAddSubtask = () => {
    if (currentSubtask.trim()) {
      setSubtasks([...subtasks, currentSubtask.trim()]);
      setCurrentSubtask('');
    }
  };

  const handleDeleteSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleSubtaskKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubtask();
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !imageError) {
      onAddTodo({ text: text.trim(), imageUrl, dueDate, priority, subtasks, tags, recurrenceRule, reminderOffset });
      setText('');
      setImageUrl(null);
      setDueDate(null);
      setPriority('none');
      setRecurrenceRule(null);
      setReminderOffset(null);
      setSubtasks([]);
      setCurrentSubtask('');
      setShowSubtaskInput(false);
      setTags([]);
      setCurrentTag('');
      setShowTagInput(false);
      setImageError(null);
      if (onTaskAdded) {
        onTaskAdded();
      }
    }
  };
  
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

      if (file.size > MAX_FILE_SIZE) {
        setImageError("File is too large (max 5MB).");
        e.target.value = ""; // Reset file input
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDateSelect = (date: Date) => {
    setDueDate(date.toISOString().split('T')[0]);
    setIsDatePickerOpen(false);
  };

  const formattedDueDate = dueDate ? new Date(dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : null;
  
  const moreOptions = [
    { 
      icon: HiArrowPath, 
      label: 'Recurrence', 
      action: () => setIsRecurrencePickerOpen(true),
      isActive: !!recurrenceRule,
      ref: recurrencePickerRef,
      picker: (
        <RecurrencePicker
          isOpen={isRecurrencePickerOpen}
          onClose={() => setIsRecurrencePickerOpen(false)}
          onSelect={setRecurrenceRule}
          currentRule={recurrenceRule}
        />
      )
    },
    { 
      icon: HiOutlineBell, 
      label: 'Reminder', 
      action: () => setIsReminderPickerOpen(true),
      isActive: reminderOffset !== null,
      disabled: !dueDate,
      tooltip: !dueDate ? "Set a due date first" : "Set reminder",
      ref: reminderPickerRef,
      picker: (
        <ReminderPicker
            isOpen={isReminderPickerOpen}
            onClose={() => setIsReminderPickerOpen(false)}
            onSelect={setReminderOffset}
            currentOffset={reminderOffset}
        />
      )
    },
    { 
      icon: HiOutlineViewList, 
      label: 'Subtasks', 
      action: () => setShowSubtaskInput(prev => !prev),
      isActive: showSubtaskInput
    },
  ]


  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="flex space-x-4">
        <div className="w-12 h-12 flex-shrink-0">
          <Avatar imageUrl={userProfile.avatarUrl} />
        </div>
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full bg-transparent text-xl text-[rgba(var(--foreground-primary-rgb))] placeholder-[rgba(var(--foreground-secondary-rgb))] focus:outline-none resize-none"
            rows={2}
            maxLength={MAX_CHARS}
            autoFocus
          />
          
          {showTagInput && (
             <div className="my-3 border-t border-[rgba(var(--border-primary-rgb))] pt-3 animate-fade-in">
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {tags.map((tag) => (
                          <div key={tag} className="flex items-center justify-between text-sm bg-[rgba(var(--background-secondary-rgb))] py-1.5 pl-3 pr-2 rounded-full group">
                            <span className="text-[rgba(var(--accent-rgb))]">#{tag}</span>
                            <button type="button" onClick={() => handleDeleteTag(tag)} aria-label={`Remove tag: ${tag}`} className="ml-2 p-0.5 rounded-full opacity-50 group-hover:opacity-100 hover:bg-[rgba(var(--background-tertiary-rgb))]">
                              <HiX className="w-2.5 h-2.5 text-[rgba(var(--foreground-secondary-rgb))]" />
                            </button>
                          </div>
                        ))}
                    </div>
                )}
                 <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        placeholder="Type a tag and press Enter"
                        className="flex-1 w-full bg-[rgba(var(--background-secondary-rgb))] border border-[rgba(var(--border-secondary-rgb))] rounded-full py-1.5 px-4 text-[rgba(var(--foreground-primary-rgb))] placeholder-[rgba(var(--foreground-secondary-rgb))] focus:outline-none focus:ring-1 focus:ring-[rgba(var(--accent-rgb))] focus:border-[rgba(var(--accent-rgb))]"
                    />
                    <button
                        type="button"
                        onClick={handleAddTag}
                        className="border border-[rgba(var(--accent-rgb))] text-[rgba(var(--accent-rgb))] font-bold px-4 py-1.5 rounded-full hover:bg-[rgba(var(--accent-rgb),0.1)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!currentTag.trim()}
                    >
                        Add
                    </button>
                </div>
             </div>
          )}

          {showSubtaskInput && (
            <div className="my-3 border-t border-[rgba(var(--border-primary-rgb))] pt-3 animate-fade-in">
              {subtasks.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {subtasks.map((subtask, index) => (
                    <div key={index} className="flex items-center justify-between text-sm bg-[rgba(var(--background-secondary-rgb))] py-1.5 pl-3 pr-2 rounded-full group">
                      <span className="text-[rgba(var(--accent-rgb))]">{subtask}</span>
                      <button type="button" onClick={() => handleDeleteSubtask(index)} aria-label={`Remove subtask: ${subtask}`} className="ml-2 p-0.5 rounded-full opacity-50 group-hover:opacity-100 hover:bg-[rgba(var(--background-tertiary-rgb))]">
                        <HiX className="w-2.5 h-2.5 text-[rgba(var(--foreground-secondary-rgb))]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={currentSubtask}
                  onChange={(e) => setCurrentSubtask(e.target.value)}
                  onKeyDown={handleSubtaskKeyDown}
                  placeholder="Type a subtask and press Enter"
                  className="flex-1 w-full bg-[rgba(var(--background-secondary-rgb))] border border-[rgba(var(--border-secondary-rgb))] rounded-full py-1.5 px-4 text-[rgba(var(--foreground-primary-rgb))] placeholder-[rgba(var(--foreground-secondary-rgb))] focus:outline-none focus:ring-1 focus:ring-[rgba(var(--accent-rgb))] focus:border-[rgba(var(--accent-rgb))]"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="border border-[rgba(var(--accent-rgb))] text-[rgba(var(--accent-rgb))] font-bold px-4 py-1.5 rounded-full hover:bg-[rgba(var(--accent-rgb),0.1)] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!currentSubtask.trim()}
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {imageUrl && (
            <div className="mt-2 relative w-full max-w-xs animate-fade-in">
              <img src={imageUrl} alt="Preview" className="rounded-lg w-full h-auto border border-[rgba(var(--border-secondary-rgb))]" />
              <button 
                type="button"
                onClick={() => { setImageUrl(null); setImageError(null); }}
                className="absolute top-2 right-2 bg-black/60 rounded-full p-1 hover:bg-black/80 transition-colors"
                aria-label="Remove image"
              >
                <HiX className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
           {formattedDueDate && (
            <div className="mt-2 text-sm text-[rgba(var(--accent-rgb))] bg-[rgba(var(--accent-rgb),0.1)] px-2 py-1 rounded-full inline-flex items-center space-x-2">
              <span>Due: {formattedDueDate}</span>
               <button type="button" onClick={() => setDueDate(null)} aria-label="Clear date">
                  <HiX className="w-3 h-3 text-[rgba(var(--accent-rgb))]" />
              </button>
            </div>
          )}
          {imageError && <p className="text-[rgba(var(--danger-rgb))] text-sm mt-2">{imageError}</p>}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-[rgba(var(--border-primary-rgb))] mt-2">
            <div className="flex items-center space-x-0">
              <Tooltip text="Add image">
                <label htmlFor={imageUploadId} className="p-2 rounded-full text-[rgba(var(--accent-rgb))] hover:bg-[rgba(var(--accent-rgb),0.1)] transition-colors duration-200 cursor-pointer flex items-center justify-center" aria-label="Add image">
                    <HiOutlinePhotograph className="w-5 h-5" />
                </label>
              </Tooltip>
               <input type="file" id={imageUploadId} accept="image/*" onChange={handleImageSelect} className="sr-only" />
               <div className="relative" ref={datePickerRef}>
                <Tooltip text="Set due date">
                  <button
                    type="button"
                    onClick={() => setIsDatePickerOpen(prev => !prev)}
                    className="p-2 rounded-full text-[rgba(var(--accent-rgb))] hover:bg-[rgba(var(--accent-rgb),0.1)] transition-colors duration-200 flex items-center justify-center"
                    aria-label="Set due date"
                    aria-haspopup="true"
                    aria-expanded={isDatePickerOpen}
                  >
                      <HiOutlineCalendar className="w-5 h-5" />
                  </button>
                </Tooltip>
                 <DatePicker 
                    isOpen={isDatePickerOpen}
                    onClose={() => setIsDatePickerOpen(false)}
                    onSelectDate={handleDateSelect}
                    selectedDate={dueDate ? new Date(dueDate) : null}
                    minDate={new Date()}
                 />
               </div>
              <div className="relative" ref={priorityPickerRef}>
                  <Tooltip text="Set priority">
                    <button
                        type="button"
                        onClick={() => setIsPriorityPickerOpen(prev => !prev)}
                        className="p-2 rounded-full text-[rgba(var(--accent-rgb))] hover:bg-[rgba(var(--accent-rgb),0.1)] transition-colors duration-200 flex items-center justify-center"
                        aria-label="Set priority"
                        aria-haspopup="true"
                        aria-expanded={isPriorityPickerOpen}
                    >
                        {isPriorityPickerOpen || priority !== 'none' ? <HiFlag className="w-5 h-5" /> : <HiOutlineFlag className="w-5 h-5" />}
                    </button>
                  </Tooltip>
                  <PriorityPicker
                      isOpen={isPriorityPickerOpen}
                      onClose={() => setIsPriorityPickerOpen(false)}
                      onSelect={setPriority}
                      currentPriority={priority}
                  />
              </div>

              <Tooltip text="Add tags">
                <button
                  type="button"
                  onClick={() => setShowTagInput(prev => !prev)}
                  className={`p-2 rounded-full text-[rgba(var(--accent-rgb))] hover:bg-[rgba(var(--accent-rgb),0.1)] transition-colors duration-200 flex items-center justify-center ${showTagInput ? 'bg-[rgba(var(--accent-rgb),0.1)]' : ''}`}
                  aria-label="Add tags"
                >
                    {showTagInput ? <HiHashtag className="w-5 h-5" /> : <HiOutlineHashtag className="w-5 h-5" />}
                </button>
              </Tooltip>

              {/* More Options Dropdown */}
              <div className="relative" ref={moreOptionsRef}>
                <Tooltip text="More options">
                  <button
                    type="button"
                    onClick={() => setIsMoreOptionsOpen(prev => !prev)}
                    className="p-2 rounded-full text-[rgba(var(--accent-rgb))] hover:bg-[rgba(var(--accent-rgb),0.1)] transition-colors duration-200 flex items-center justify-center"
                    aria-label="More options"
                  >
                    <HiDotsHorizontal className="w-5 h-5" />
                  </button>
                </Tooltip>
                {isMoreOptionsOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-[rgba(var(--background-primary-rgb))] rounded-xl shadow-lg border border-[rgba(var(--border-primary-rgb))] z-30 py-1 animate-fade-in">
                    {moreOptions.map((option, index) => (
                      <div key={index} className="relative" ref={option.ref}>
                         <Tooltip text={option.tooltip || ''}>
                           <button
                             type="button"
                             onClick={() => { option.action(); if (!option.picker) setIsMoreOptionsOpen(false); }}
                             disabled={option.disabled}
                             className={`w-full text-left flex items-center space-x-3 px-3 py-2 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${option.isActive ? 'text-[rgba(var(--accent-rgb))] bg-[rgba(var(--accent-rgb),0.1)]' : 'text-[rgba(var(--foreground-primary-rgb))] hover:bg-[rgba(var(--foreground-primary-rgb),0.05)]'}`}
                           >
                             <option.icon className="w-5 h-5" />
                             <span>{option.label}</span>
                           </button>
                         </Tooltip>
                         {option.picker}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end space-x-4 mt-3 sm:mt-0">
              <span className={`text-sm font-medium ${charsLeft <= 0 ? 'text-[rgba(var(--danger-rgb))]' : charsLeft < 20 ? 'text-[rgba(var(--warning-rgb))]' : 'text-[rgba(var(--foreground-secondary-rgb))]'}`}>
                {charsLeft}
              </span>
              <button 
                type="submit" 
                className="bg-[rgba(var(--button-primary-bg-rgb))] text-[rgba(var(--button-primary-text-rgb))] font-bold px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!text.trim() || !!imageError}
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddTodoForm;