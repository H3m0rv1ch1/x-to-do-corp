// Fix: Add useMemo to react import.
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { type Note } from '../types';
import { ArrowLeft as ArrowLeftIcon, Trash2 as TrashIcon, Sparkles as SparkleIcon, Pin as PinIcon, Bold as BoldIcon, Italic as ItalicIcon, List as ListUlIcon, ListOrdered as ListOlIcon, Quote as QuoteIcon, Code as CodeIcon } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';
import { parseMarkdown } from '../utils/textParser';
import { useDebounce } from '../hooks/useDebounce';

interface NoteEditorProps {
  note: Note;
  onSave: (noteData: { title: string; content: string }) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

const NoteToolbar: React.FC<{ textareaRef: React.RefObject<HTMLTextAreaElement>, onContentChange: (newContent: string) => void }> = ({ textareaRef, onContentChange }) => {
    const handleInsert = (syntax: { prefix: string, suffix: string, placeholder: string }) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        const newText = `${textarea.value.substring(0, start)}${syntax.prefix}${selectedText || syntax.placeholder}${syntax.suffix}${textarea.value.substring(end)}`;

        onContentChange(newText);

        setTimeout(() => {
            const currentTextarea = textareaRef.current;
            // Fix: Check if the textarea is still mounted before trying to focus it.
            // This prevents the "Element is not connected" error if the component unmounts
            // between the click and the timeout execution.
            if (!currentTextarea || !currentTextarea.isConnected) return;

            if (selectedText) {
                currentTextarea.selectionStart = currentTextarea.selectionEnd = start + syntax.prefix.length + selectedText.length + syntax.suffix.length;
            } else {
                currentTextarea.selectionStart = start + syntax.prefix.length;
                currentTextarea.selectionEnd = start + syntax.prefix.length + syntax.placeholder.length;
            }
            currentTextarea.focus();
        }, 0);
    };

    const tools = [
        { icon: BoldIcon, title: 'Bold', action: () => handleInsert({ prefix: '**', suffix: '**', placeholder: 'bold text' }) },
        { icon: ItalicIcon, title: 'Italic', action: () => handleInsert({ prefix: '*', suffix: '*', placeholder: 'italic text' }) },
        { icon: QuoteIcon, title: 'Blockquote', action: () => handleInsert({ prefix: '> ', suffix: '', placeholder: 'Quote' }) },
        { icon: CodeIcon, title: 'Code', action: () => handleInsert({ prefix: '`', suffix: '`', placeholder: 'code' }) },
        { icon: ListUlIcon, title: 'Unordered List', action: () => handleInsert({ prefix: '- ', suffix: '', placeholder: 'List item' }) },
        { icon: ListOlIcon, title: 'Ordered List', action: () => handleInsert({ prefix: '1. ', suffix: '', placeholder: 'List item' }) },
    ];

    return (
        <div className="flex items-center space-x-1 p-2 border-b border-[rgba(var(--border-primary-rgb))]">
            {tools.map((tool, index) => (
                <button
                    key={index}
                    onClick={tool.action}
                    title={tool.title}
                    className="p-2 rounded-md text-[rgba(var(--foreground-secondary-rgb))] hover:bg-[rgba(var(--background-tertiary-rgb))] hover:text-[rgba(var(--foreground-primary-rgb))] transition-colors"
                >
                    <tool.icon className="w-5 h-5" />
                </button>
            ))}
        </div>
    );
};

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onBack, onDelete }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [view, setView] = useState<'write' | 'preview'>('write');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const { handleSummarizeNote, handlePinNote, handleUpdateNote } = useAppContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const debouncedTitle = useDebounce(title, 1000);
  const debouncedContent = useDebounce(content, 1000);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setView('write'); // Reset to write view on note change
  }, [note]);
  
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

  const handleSummarize = async () => {
    if (!note.id || !content.trim()) return;
    setIsSummarizing(true);
    if (content !== note.content || title !== note.title) {
        onSave({ title, content });
    }
    await handleSummarizeNote(note.id);
    setIsSummarizing(false);
  };
  
  const renderedPreview = useMemo(() => parseMarkdown(content), [content]);

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
              <ArrowLeftIcon className="w-5 h-5 text-[rgba(var(--foreground-primary-rgb))]" />
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
              <PinIcon className="w-5 h-5" />
            </button>
            {isSummarizing ? (
                <div className="p-2 flex items-center justify-center w-9 h-9">
                    <div className="w-5 h-5 border-2 border-[rgba(var(--accent-rgb))] border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <button 
                    onClick={handleSummarize}
                    disabled={!content.trim()}
                    className="p-2 rounded-full hover:bg-[rgba(var(--accent-rgb),0.1)] text-[rgba(var(--accent-rgb))] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Generate title with AI"
                    title="Generate title with AI"
                >
                    <SparkleIcon className="w-5 h-5" />
                </button>
            )}
            <button 
                onClick={handleDelete}
                className="p-2 rounded-full hover:bg-[rgba(var(--danger-rgb),0.1)] text-[rgba(var(--danger-rgb))] transition-colors duration-200"
                aria-label="Delete note"
            >
                <TrashIcon className="w-5 h-5" />
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
        
        <div className="p-2 border-b border-[rgba(var(--border-primary-rgb))]">
           <div className="flex items-center space-x-2">
                <button onClick={() => setView('write')} className={`px-4 py-1.5 text-sm font-semibold rounded-md ${view === 'write' ? 'bg-[rgba(var(--background-tertiary-rgb))] text-[rgba(var(--foreground-primary-rgb))]' : 'text-[rgba(var(--foreground-secondary-rgb))] hover:bg-[rgba(var(--background-tertiary-rgb),0.5)]'}`}>Write</button>
                <button onClick={() => setView('preview')} className={`px-4 py-1.5 text-sm font-semibold rounded-md ${view === 'preview' ? 'bg-[rgba(var(--background-tertiary-rgb))] text-[rgba(var(--foreground-primary-rgb))]' : 'text-[rgba(var(--foreground-secondary-rgb))] hover:bg-[rgba(var(--background-tertiary-rgb),0.5)]'}`}>Preview</button>
           </div>
        </div>

        {view === 'write' ? (
            <div className="flex flex-col flex-grow min-h-0">
                <NoteToolbar textareaRef={textareaRef} onContentChange={setContent} />
                <textarea
                    ref={textareaRef}
                    placeholder="Start writing your note with Markdown..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="flex-grow w-full h-full bg-transparent text-lg text-[rgba(var(--foreground-primary-rgb))] placeholder-[rgba(var(--foreground-secondary-rgb))] focus:outline-none resize-none p-4"
                />
            </div>
        ) : (
            <div 
                className="flex-grow p-4 prose prose-invert prose-lg max-w-none overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: renderedPreview }}
            />
        )}
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