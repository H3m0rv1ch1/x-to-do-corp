
import React from 'react';
import { HiX, HiDocumentText } from 'react-icons/hi';
import { type Todo, type Note } from '@/types';
import { useAppContext } from '@/hooks/useAppContext';
import { TodoItem } from '@/components/todo';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  tasks: Todo[];
  notes: Note[];
}

const NoteListItem: React.FC<{ note: Note }> = ({ note }) => {
    const { setPage, setSelectedNoteId, closeDayDetailModal } = useAppContext();

    const handleClick = () => {
        closeDayDetailModal();
        setSelectedNoteId(note.id);
        setPage('notes');
    };

    return (
        <div 
            onClick={handleClick}
            className="flex items-start p-4 border-b border-[rgba(var(--border-primary-rgb))] hover:bg-[rgba(var(--background-secondary-rgb),0.5)] transition-colors duration-200 cursor-pointer"
        >
            <HiDocumentText className="w-5 h-5 text-[rgba(var(--foreground-secondary-rgb))] mr-4 mt-1 flex-shrink-0" />
            <div className="flex-grow">
                <p className="font-semibold text-[rgba(var(--foreground-primary-rgb))]">{note.title || 'Untitled Note'}</p>
                <p className="text-sm text-[rgba(var(--foreground-secondary-rgb))]">
                    Created at {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </div>
    );
};

const DayDetailModal: React.FC<DayDetailModalProps> = ({ isOpen, onClose, date, tasks, notes }) => {
    const {
      handleToggleTodo,
      handleDeleteTodo,
      handleEditTodo,
      handleToggleImportant,
      handleToggleSubtask,
      handleEditSubtask,
    } = useAppContext();

    if (!isOpen) {
        return null;
    }
    
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-40 flex justify-center items-center animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-[rgba(var(--background-primary-rgb))] rounded-2xl shadow-lg w-full max-w-2xl mx-4 text-[rgba(var(--foreground-primary-rgb))] transform transition-all animate-scale-in max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-[rgba(var(--border-primary-rgb))] flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold">Details for</h2>
                        <p className="text-base text-[rgba(var(--foreground-secondary-rgb))]">{formattedDate}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))]">
                        <HiX className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto">
                    {tasks.length === 0 && notes.length === 0 ? (
                        <p className="p-8 text-center text-[rgba(var(--foreground-secondary-rgb))]">No tasks or notes for this day.</p>
                    ) : (
                        <>
                            {tasks.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold uppercase text-[rgba(var(--foreground-secondary-rgb))] px-4 pt-4 pb-2">Tasks</h3>
                                    {tasks.map(todo => (
                                        <TodoItem
                                            key={todo.id}
                                            todo={todo}
                                            onToggleTodo={handleToggleTodo}
                                            onDeleteTodo={handleDeleteTodo}
                                            onEditTodo={handleEditTodo}
                                            onToggleImportant={handleToggleImportant}
                                            onToggleSubtask={handleToggleSubtask}
                                            onEditSubtask={handleEditSubtask}
                                        />
                                    ))}
                                </div>
                            )}
                            {notes.length > 0 && (
                                <div>
                                     <h3 className="text-sm font-bold uppercase text-[rgba(var(--foreground-secondary-rgb))] px-4 pt-4 pb-2">Notes</h3>
                                     {notes.map(note => (
                                         <NoteListItem key={note.id} note={note} />
                                     ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DayDetailModal;
