// Fix: Add useMemo to react import.
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HiArrowLeft, HiTrash } from 'react-icons/hi';
import { MdPushPin } from 'react-icons/md';
import { type Note } from '@/types';
import { useAppContext } from '@/hooks/useAppContext';
import { useDebounce } from '@/hooks/useDebounce';

interface NoteEditorProps {
  note: Note;
  onSave: (noteData: { title: string; content: string }) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onBack, onDelete }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const { handlePinNote, handleUpdateNote } = useAppContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const debouncedTitle = useDebounce(title, 1000);
  const debouncedContent = useDebounce(content, 1000);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note.id]);
  
  // Auto-save logic
  useEffect(() => {
    // Only save if the debounced value has changed from the original note prop,
    // and also check against the current state to avoid saving on initial load.
    const hasChanged = debouncedTitle !== note.title || debouncedContent !== note.content;
    const isInitialLoad = title === note.title && content === note.content;

    if (hasChanged && !isInitialLoad) {
      handleUpdateNote({ ...note, title: debouncedTitle, content: debouncedContent });
    }
  }, [debouncedTitle, debouncedContent, note, handleUpdateNote]);


  const handleDelete = () => {
    onDelete(note.id);
  }
  
  const editorStats = useMemo(() => {
    const charCount = content.length;
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const readingTime = Math.ceil(wordCount / 200); // Assumes 200 WPM
    return { charCount, wordCount, readingTime };
  }, [content]);

  return (
    <div className="flex flex-col h-full bg-[rgba(var(--background-primary-rgb))]">
      <header className="sticky top-0 z-20 bg-[rgba(var(--background-primary-rgb),0.8)] backdrop-blur-md border-b border-[rgba(var(--border-primary-rgb))]">
        <div className="flex items-center justify-between p-4 h-16">
          <div className="flex items-center space-x-4">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))] transition-colors duration-200 md:hidden" aria-label="Go back">
              <HiArrowLeft className="w-5 h-5 text-[rgba(var(--foreground-primary-rgb))]" />
            </button>
            <h1 className="text-xl font-bold text-[rgba(var(--foreground-primary-rgb))] truncate">{title || 'New Note'}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePinNote(note.id)}
              className={`p-2 rounded-full hover:bg-[rgba(var(--accent-rgb),0.1)] transition-colors duration-200 ${note.isPinned ? 'text-[rgba(var(--accent-rgb))]' : 'text-[rgba(var(--foreground-secondary-rgb))] hover:text-[rgba(var(--accent-rgb))]'}`}
              aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
              title={note.isPinned ? 'Unpin note' : 'Pin note'}
            >
              <MdPushPin className="w-5 h-5" />
            </button>
            <button 
                onClick={handleDelete}
                className="p-2 rounded-full hover:bg-[rgba(var(--danger-rgb),0.1)] text-[rgba(var(--danger-rgb))] transition-colors duration-200"
                aria-label="Delete note"
            >
                <HiTrash className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-grow flex flex-col min-h-0">
        <div className="border-b border-[rgba(var(--border-primary-rgb))] p-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent text-2xl font-bold text-[rgba(var(--foreground-primary-rgb))] placeholder-[rgba(var(--foreground-secondary-rgb))] focus:outline-none"
          />
        </div>
        
        <div className="flex flex-col flex-grow min-h-0">
            <textarea
                ref={textareaRef}
                placeholder="Start writing your note with Markdown..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-grow w-full h-full bg-transparent text-lg text-[rgba(var(--foreground-primary-rgb))] placeholder-[rgba(var(--foreground-secondary-rgb))] focus:outline-none resize-none p-4"
            />
        </div>

         <div className="flex-shrink-0 border-t border-[rgba(var(--border-primary-rgb))] p-2 px-4 text-xs text-[rgba(var(--foreground-secondary-rgb))] flex items-center justify-between">
            <span>
                Last saved: {new Date(note.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="flex items-center space-x-4">
                <span>{editorStats.readingTime} min read</span>
                <span>{editorStats.wordCount} words</span>
                <span>{editorStats.charCount} characters</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;