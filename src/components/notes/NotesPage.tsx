
import React, { useState, useMemo, useRef } from 'react';
import { HiPencil, HiDocumentText, HiSearch, HiDotsHorizontal, HiTrash, HiCheck } from 'react-icons/hi';
import { MdPushPin } from 'react-icons/md';
import { type Note } from '@/types';
import NoteEditor from './NoteEditor';
import { useAppContext } from '@/hooks/useAppContext';
import { NotesSortOrder } from '@/contexts/AppContext';
import useClickOutside from '@/hooks/useClickOutside';

interface NoteCardProps { 
  note: Note; 
  onSelect: () => void;
  isSelected: boolean;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onSelect, isSelected }) => {
  const lastUpdated = new Date(note.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  const contentSnippet = useMemo(() => {
    const strippedContent = note.content.replace(/#+\s/g, '').replace(/[*_`>]/g, '');
    return strippedContent.substring(0, 100) + (strippedContent.length > 100 ? '...' : '');
  }, [note.content]);

  return (
    <div 
      className={`p-4 border-b border-[rgba(var(--border-primary-rgb))] hover:bg-[rgba(var(--background-secondary-rgb),0.5)] transition-colors duration-200 cursor-pointer ${isSelected ? 'bg-[rgba(var(--accent-rgb),0.1)]' : ''} ${note.isPinned ? 'bg-[rgba(var(--background-secondary-rgb),0.3)]' : ''}`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-lg text-[rgba(var(--foreground-primary-rgb))] truncate pr-2">{note.title || 'Untitled Note'}</h3>
        {note.isPinned && <MdPushPin className="w-4 h-4 text-[rgba(var(--accent-rgb))] flex-shrink-0 mt-1" />}
      </div>
      <p className="text-[rgba(var(--foreground-secondary-rgb))] mt-1 text-sm">{contentSnippet || 'No content'}</p>
      <p className="text-xs text-[rgba(var(--foreground-secondary-rgb),0.7)] mt-2">{lastUpdated}</p>
    </div>
  );
};

const MemoizedNoteCard = React.memo(NoteCard);

const NoteEditorPlaceholder: React.FC = () => (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[rgba(var(--foreground-secondary-rgb))]">
        <HiDocumentText className="w-16 h-16 mb-4" />
        <h2 className="text-2xl font-bold text-[rgba(var(--foreground-primary-rgb))] mb-2">Select a note</h2>
        <p>Choose a note from the list on the left to view or edit it, or create a new one.</p>
    </div>
);


const NotesPage: React.FC = () => {
  const { 
    filteredNotes, 
    handleAddNote, 
    handleUpdateNote, 
    handleDeleteNote,
    notesSearchQuery,
    setNotesSearchQuery,
    notesSortOrder,
    setNotesSortOrder,
    handleDeleteAllNotes,
    selectedNoteId,
    setSelectedNoteId,
  } = useAppContext();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  useClickOutside(moreMenuRef, () => setIsMoreMenuOpen(false));

  const selectedNote = useMemo(() => {
    return filteredNotes.find(note => note.id === selectedNoteId) || null;
  }, [filteredNotes, selectedNoteId]);

  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId);
  };

  const handleAddNew = async () => {
    const newNoteId = await handleAddNote({ title: '', content: '' });
    setSelectedNoteId(newNoteId);
  };
  
  const handleUpdate = (noteData: { title: string, content: string }) => {
      if (!selectedNote) return;
      handleUpdateNote({ ...selectedNote, ...noteData });
  };
  
  const handleDelete = (id: string) => {
      handleDeleteNote(id);
      setSelectedNoteId(null);
  }

  const handleDeleteAll = () => {
    handleDeleteAllNotes();
    setIsMoreMenuOpen(false);
  }

  const handleBack = () => {
    setSelectedNoteId(null);
  };

  const sortOptions: { key: NotesSortOrder; label: string }[] = [
    { key: 'updatedAt', label: 'Last updated' },
    { key: 'createdAt', label: 'Date created' },
    { key: 'alphabetical', label: 'Alphabetical' },
  ];

  return (
    <div className="flex h-full">
      {/* Note List Pane */}
      <div className={`
        w-full md:w-2/5 md:flex flex-col border-r border-[rgba(var(--border-primary-rgb))]
        ${selectedNoteId && 'hidden md:flex'}
      `}>
         <header className="sticky top-0 z-20 bg-[rgba(var(--background-primary-rgb),0.8)] backdrop-blur-md border-b border-[rgba(var(--border-primary-rgb))]">
            <div className="flex items-center justify-between p-4 h-16">
              <h1 className="text-xl font-bold text-[rgba(var(--foreground-primary-rgb))]">Notes</h1>
              <div className="flex items-center space-x-2">
                <div className="relative" ref={moreMenuRef}>
                   <button 
                    onClick={() => setIsMoreMenuOpen(prev => !prev)}
                    className="p-2 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))] transition-colors duration-200" 
                    aria-label="More options"
                   >
                     <HiDotsHorizontal className="w-6 h-6 text-[rgba(var(--foreground-primary-rgb))]" />
                   </button>
                   {isMoreMenuOpen && (
                     <div className="absolute top-full right-0 mt-2 w-56 bg-[rgba(var(--background-primary-rgb))] rounded-lg shadow-lg border border-[rgba(var(--border-primary-rgb))] z-10 py-1 animate-fade-in">
                       <div className="px-3 py-2 text-sm text-[rgba(var(--foreground-secondary-rgb))] font-semibold">Sort Options</div>
                       {sortOptions.map(opt => (
                         <button 
                            key={opt.key}
                            onClick={() => { setNotesSortOrder(opt.key); setIsMoreMenuOpen(false); }}
                            className="w-full text-left flex items-center justify-between px-3 py-2 text-sm text-[rgba(var(--foreground-primary-rgb))] hover:bg-[rgba(var(--foreground-primary-rgb),0.1)]"
                         >
                           <span>{opt.label}</span>
                           {notesSortOrder === opt.key && <HiCheck className="w-4 h-4 text-[rgba(var(--accent-rgb))]" />}
                         </button>
                       ))}
                       <div className="my-1 border-t border-[rgba(var(--border-primary-rgb))]" />
                       <button
                          onClick={handleDeleteAll}
                          className="w-full text-left flex items-center space-x-3 px-3 py-2 text-base text-[rgba(var(--danger-rgb))] hover:bg-[rgba(var(--danger-rgb),0.1)]"
                        >
                          <HiTrash className="w-5 h-5" />
                          <span>Delete All Notes</span>
                        </button>
                     </div>
                   )}
                </div>
                <button 
                  onClick={handleAddNew}
                  className="p-2 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))] transition-colors duration-200" 
                  aria-label="Add new note"
                >
                  <HiPencil className="w-6 h-6 text-[rgba(var(--foreground-primary-rgb))]" />
                </button>
              </div>
            </div>
            <div className="px-4 pb-2 border-b border-[rgba(var(--border-primary-rgb))]">
               <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiSearch className="w-5 h-5 text-[rgba(var(--foreground-secondary-rgb))]" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search Notes"
                    value={notesSearchQuery}
                    onChange={(e) => setNotesSearchQuery(e.target.value)}
                    className="w-full bg-[rgba(var(--background-primary-rgb))] border border-[rgba(var(--border-primary-rgb))] text-[rgba(var(--foreground-primary-rgb))] rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-[rgba(var(--accent-rgb))]"
                  />
                </div>
            </div>
        </header>
        <div className="overflow-y-auto flex-1">
            {filteredNotes.length > 0 ? (
                <div>
                    {filteredNotes.map(note => (
                        <MemoizedNoteCard 
                            key={note.id} 
                            note={note} 
                            onSelect={() => handleSelectNote(note.id)} 
                            isSelected={selectedNoteId === note.id}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center p-8 text-[rgba(var(--foreground-secondary-rgb))]">
                    <div className="max-w-xs mx-auto">
                      <h2 className="text-2xl font-bold text-[rgba(var(--foreground-primary-rgb))] mb-2">{notesSearchQuery ? 'No Results Found' : 'No Notes Yet'}</h2>
                      <p>{notesSearchQuery ? 'Try a different search term.' : <>Click the <HiPencil className="w-4 h-4 inline-block -mt-1"/> icon to create your first note.</>}</p>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Note Editor Pane */}
      <div className={`
        w-full md:w-3/5 flex-col
        ${!selectedNoteId ? 'hidden md:flex' : 'flex'}
      `}>
        {selectedNote ? (
            <NoteEditor
                note={selectedNote}
                onSave={handleUpdate}
                onDelete={handleDelete}
                onBack={handleBack}
            />
        ) : (
            <NoteEditorPlaceholder />
        )}
      </div>
    </div>
  );
};

export default NotesPage;