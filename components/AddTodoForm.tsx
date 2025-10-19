import React, { useState, useRef, useId } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Avatar } from './Avatar';
import { Sparkles as SparkleIcon, Image as ImageIcon, Calendar as CalendarIcon, Bell as BellIcon, Repeat as RepeatIcon, X as CloseIcon, ListTodo as SubtaskIcon, Hash as HashIcon, Flag as FlagIcon } from 'lucide-react';
import { type UserProfile, type RecurrenceType, type Priority } from '../types';

import DatePicker from './DatePicker';
import RecurrencePicker from './RecurrencePicker';
import ReminderPicker from './ReminderPicker';
import useClickOutside from '../hooks/useClickOutside';

import PriorityPicker from './PriorityPicker';

interface AddTodoFormProps {
  onAddTodo: (todoData: { text: string; imageUrl: string | null; dueDate: string | null; priority: Priority; subtasks: string[], tags: string[], recurrenceRule: { type: RecurrenceType } | null, reminderOffset: number | null }) => void;
  userProfile: UserProfile;
  onTaskAdded?: () => void;
}

const AddTodoForm: React.FC<AddTodoFormProps> = ({ onAddTodo, userProfile, onTaskAdded }) => {
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority>('medium');
  const [recurrenceRule, setRecurrenceRule] = useState<{ type: RecurrenceType } | null>(null);
  const [reminderOffset, setReminderOffset] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  useClickOutside(datePickerRef, () => setIsDatePickerOpen(false));
  useClickOutside(priorityPickerRef, () => setIsPriorityPickerOpen(false));
  useClickOutside(recurrencePickerRef, () => setIsRecurrencePickerOpen(false));
  useClickOutside(reminderPickerRef, () => setIsReminderPickerOpen(false));


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
      if (e.key === 'Enter' || e.key === ' ') {
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
      setPriority('medium');
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

  const handleSuggestTask = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      const prompt = 'Suggest one simple, common, and actionable to-do list item for personal productivity. For example: "Organize my desk" or "Read a chapter of a book". Be concise.';
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const suggestedText = response.text.trim().replace(/^"|"$/g, '');
      
      if (suggestedText) {
        setText(suggestedText);
      } else {
        setError('Could not generate a suggestion.');
      }
    } catch (e) {
      console.error(e);
      setError('Failed to get suggestion from AI. Please check your API key and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    setDueDate(date.toISOString().split('T')[0]);
    setIsDatePickerOpen(false);
  };

  const formattedDueDate = dueDate ? new Date(dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : null;


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
                              <CloseIcon className="w-2.5 h-2.5 text-[rgba(var(--foreground-secondary-rgb))]" />
                            </button>
                          </div>
                        ))}
                    </div>
                )}
                <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Type a tag and press Space or Enter"
                    className="w-full bg-[rgba(var(--background-secondary-rgb))] border border-[rgba(var(--border-secondary-rgb))] rounded-full py-1.5 px-4 text-[rgba(var(--foreground-primary-rgb))] placeholder-[rgba(var(--foreground-secondary-rgb))] focus:outline-none focus:ring-1 focus:ring-[rgba(var(--accent-rgb))] focus:border-[rgba(var(--accent-rgb))]"
                />
             </div>
          )}

          {showSubtaskInput && (
            <div className="my-3 border-t border-[rgba(var(--border-primary-rgb))] pt-3 animate-fade-in">
              <div className="space-y-2 mb-3">
                {subtasks.map((subtask, index) => (
                  <div key={index} className="flex items-center justify-between text-sm bg-[rgba(var(--background-secondary-rgb))] py-1.5 px-3 rounded-full group">
                    <span className="text-[rgba(var(--foreground-primary-rgb))]">{subtask}</span>
                    <button type="button" onClick={() => handleDeleteSubtask(index)} aria-label={`Remove subtask: ${subtask}`} className="p-1 -mr-1 rounded-full opacity-50 group-hover:opacity-100 hover:bg-[rgba(var(--background-tertiary-rgb))]">
                      <CloseIcon className="w-3 h-3 text-[rgba(var(--foreground-secondary-rgb))]" />
                    </button>
                  </div>
                ))}
              </div>
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
                <CloseIcon className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
           {formattedDueDate && (
            <div className="mt-2 text-sm text-[rgba(var(--accent-rgb))] bg-[rgba(var(--accent-rgb),0.1)] px-2 py-1 rounded-full inline-flex items-center space-x-2">
              <span>Due: {formattedDueDate}</span>
               <button type="button" onClick={() => setDueDate(null)} aria-label="Clear date">
                  <CloseIcon className="w-3 h-3 text-[rgba(var(--accent-rgb))]" />
              </button>
            </div>
          )}
          {imageError && <p className="text-[rgba(var(--danger-rgb))] text-sm mt-2">{imageError}</p>}
          {error && <p className="text-[rgba(var(--danger-rgb))] text-sm mt-2">{error}</p>}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-[rgba(var(--border-primary-rgb))] mt-2">
            <div className="flex items-center space-x-1">
               <label htmlFor={imageUploadId} className="p-2 rounded-full text-[rgba(var(--accent-rgb))] hover:bg-[rgba(var(--accent-rgb),0.1)] transition-colors duration-200 cursor-pointer" aria-label="Add image" title="Add image">
                  <ImageIcon className="w-5 h-5" />
              </label>
               <input type="file" id={imageUploadId} accept="image/*" onChange={handleImageSelect} className="sr-only" />
               <div className="relative" ref={datePickerRef}>
                <button
                  type="button"
                  onClick={() => setIsDatePickerOpen(prev => !prev)}
                  className="p-2 rounded-full text-[rgba(var(--accent-rgb))] hover:bg-[rgba(var(--accent-rgb),0.1)] transition-colors duration-200 cursor-pointer"
                  title="Set due date"
                  aria-haspopup="true"
                  aria-expanded={isDatePickerOpen}
                >
                    <CalendarIcon className="w-5 h-5" />
                </button>
                 <DatePicker 
                    isOpen={isDatePickerOpen}
                    onClose={() => setIsDatePickerOpen(false)}
                    onSelectDate={handleDateSelect}
                    selectedDate={dueDate ? new Date(dueDate) : null}
                    minDate={new Date()}
                 />
               </div>
              <div className="relative" ref={recurrencePickerRef}>
                <button
                  type="button"
                  onClick={() => setIsRecurrencePickerOpen(prev => !prev)}
                  className={`p-2 rounded-full hover:bg-[rgba(var(--accent-rgb),0.1)] transition-colors duration-200 ${recurrenceRule ? 'text-[rgba(var(--accent-rgb))] bg-[rgba(var(--accent-rgb),0.1)]' : 'text-[rgba(var(--accent-rgb))]'}`}
                  title="Set recurrence"
                  aria-haspopup="true"
                  aria-expanded={isRecurrencePickerOpen}
                >
                  <RepeatIcon className="w-5 h-5" />
                </button>
                <RecurrencePicker
                  isOpen={isRecurrencePickerOpen}
                  onClose={() => setIsRecurrencePickerOpen(false)}
                  onSelect={setRecurrenceRule}
                  currentRule={recurrenceRule}
                />
              </div>
              <div className="relative" ref={reminderPickerRef}>
                <button
                  type="button"
                  onClick={() => setIsReminderPickerOpen(prev => !prev)}
                  className={`p-2 rounded-full hover:bg-[rgba(var(--accent-rgb),0.1)] transition-colors duration-200 ${reminderOffset !== null ? 'text-[rgba(var(--accent-rgb))] bg-[rgba(var(--accent-rgb),0.1)]' : 'text-[rgba(var(--accent-rgb))]'} disabled:opacity-50 disabled:cursor-not-allowed`}
                  title="Set reminder"
                  aria-haspopup="true"
                  aria-expanded={isReminderPickerOpen}
                  disabled={!dueDate}
                >
                  <BellIcon className="w-5 h-5" />
                </button>
                <ReminderPicker
                  isOpen={isReminderPickerOpen}
                  onClose={() => setIsReminderPickerOpen(false)}
                  onSelect={setReminderOffset}
                  currentOffset={reminderOffset}
                />
              </div>
              <div className="relative" ref={priorityPickerRef}>
                  <button
                      type="button"
                      onClick={() => setIsPriorityPickerOpen(prev => !prev)}
                      className="p-2 rounded-full text-[rgba(var(--accent-rgb))] hover:bg-[rgba(var(--accent-rgb),0.1)] transition-colors duration-200 cursor-pointer"
                      title="Set priority"
                      aria-haspopup="true"
                      aria-expanded={isPriorityPickerOpen}
                  >
                      <FlagIcon className="w-5 h-5" />
                  </button>
                  <PriorityPicker
                      isOpen={isPriorityPickerOpen}
                      onClose={() => setIsPriorityPickerOpen(false)}
                      onSelect={setPriority}
                      currentPriority={priority}
                  />
              </div>
              <button
                type="button"
                onClick={() => setShowTagInput(!showTagInput)}
                className={`p-2 rounded-full hover:bg-[rgba(var(--accent-rgb),0.1)] transition-colors duration-200 ${showTagInput ? 'text-[rgba(var(--accent-rgb))] bg-[rgba(var(--accent-rgb),0.1)]' : 'text-[rgba(var(--accent-rgb))]'}`}
                aria-label="Add tags"
                title="Add tags"
                aria-pressed={showTagInput}
              >
                <HashIcon className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setShowSubtaskInput(!showSubtaskInput)}
                className={`p-2 rounded-full hover:bg-[rgba(var(--accent-rgb),0.1)] transition-colors duration-200 ${showSubtaskInput ? 'text-[rgba(var(--accent-rgb))] bg-[rgba(var(--accent-rgb),0.1)]' : 'text-[rgba(var(--accent-rgb))]'}`}
                aria-label="Add subtasks"
                title="Add subtasks"
                aria-pressed={showSubtaskInput}
              >
                <SubtaskIcon className="w-5 h-5" />
              </button>
              <button 
                type="button" 
                onClick={handleSuggestTask} 
                disabled={isLoading}
                className="p-2 rounded-full hover:bg-[rgba(var(--accent-rgb),0.1)] text-[rgba(var(--accent-rgb))] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Suggest a task with AI"
                title="Suggest a task with AI"
              >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-[rgba(var(--accent-rgb))] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <SparkleIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-end space-x-4 mt-3 sm:mt-0">
              <span className={`text-sm font-medium ${charsLeft <= 0 ? 'text-[rgba(var(--danger-rgb))]' : charsLeft < 20 ? 'text-[rgba(var(--warning-rgb))]' : 'text-[rgba(var(--foreground-secondary-rgb))]'}`}>
                {charsLeft}
              </span>
              <button 
                type="submit" 
                className="bg-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-on-accent-rgb))] font-bold px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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