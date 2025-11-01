import React, { useState, useMemo } from 'react';
import { HiChevronLeft, HiChevronRight, HiDocumentText } from 'react-icons/hi';
import { Header } from '@/components/layout';
import { useAppContext } from '@/hooks/useAppContext';
import { type Todo, type Note } from '@/types';
import { TodoItem } from '@/components/todo';

// Note: NoteListItem is co-located here from DayTasksModal for a self-contained, improved Calendar view.
const NoteListItem: React.FC<{ note: Note }> = ({ note }) => {
    const { setPage, setSelectedNoteId } = useAppContext();

    const handleClick = () => {
        setSelectedNoteId(note.id);
        setPage('notes');
    };

    return (
        <div 
            onClick={handleClick}
            className="flex items-start p-4 border-b border-[rgba(var(--border-primary-rgb))] hover:bg-[rgba(var(--background-secondary-rgb),0.5)] transition-colors duration-200 cursor-pointer"
        >
            <HiDocumentText className="w-5 h-5 text-[rgba(var(--foreground-secondary-rgb))] mr-4 mt-1 flex-shrink-0" />
            <div className="flex-grow min-w-0">
                <p className="font-semibold text-[rgba(var(--foreground-primary-rgb))] truncate">{note.title || 'Untitled Note'}</p>
                <p className="text-sm text-[rgba(var(--foreground-secondary-rgb))]">
                    Created at {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </div>
    );
};


interface CalendarDayProps {
  date: Date | null;
  isToday: boolean;
  isCurrentMonth: boolean;
  isSelected: boolean;
  tasks: Todo[];
  notes: Note[];
  onClick: () => void;
}

const CalendarDay: React.FC<CalendarDayProps> = ({ date, isToday, isCurrentMonth, isSelected, tasks, notes, onClick }) => {
  if (!date) {
    return <div className="border-t border-l border-[rgba(var(--border-primary-rgb))]"></div>;
  }
  
  const dayNumber = date.getDate();
  const hasItems = tasks.length > 0 || notes.length > 0;

  return (
    <div 
      className={`relative border-t border-l border-[rgba(var(--border-primary-rgb))] p-1 sm:p-2 flex flex-col h-24 sm:h-32 transition-colors duration-200 
        ${isCurrentMonth ? 'bg-transparent' : 'bg-[rgba(var(--background-secondary-rgb),0.5)]'} 
        ${hasItems ? 'cursor-pointer hover:bg-[rgba(var(--background-tertiary-rgb))]' : ''}
        ${isSelected ? 'ring-2 ring-inset ring-[rgba(var(--accent-rgb))]' : ''}`}
      onClick={hasItems || isCurrentMonth ? onClick : undefined}
    >
      <div className="flex justify-between items-center">
        {notes.length > 0 && (
            <span title={`${notes.length} note(s) created`}>
              <HiDocumentText className="w-3 h-3 text-[rgba(var(--foreground-secondary-rgb))]"/>
            </span>
        )}
        <div 
          className={`w-6 h-6 flex items-center justify-center rounded-full text-sm ml-auto transition-colors duration-200 ${isToday && !isSelected ? 'bg-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-on-accent-rgb))] font-bold' : isCurrentMonth ? 'text-[rgba(var(--foreground-primary-rgb))]' : 'text-[rgba(var(--foreground-secondary-rgb))]'}`}
        >
          {dayNumber}
        </div>
      </div>
      <div className="flex-grow overflow-hidden mt-1 space-y-1">
        {tasks.slice(0, 3).map(task => (
           <div key={task.id} className={`w-full h-1.5 rounded-full ${task.completed ? 'bg-[rgba(var(--border-secondary-rgb))]' : 'bg-[rgba(var(--accent-rgb))]'}`} title={task.text}>
           </div>
        ))}
        {tasks.length > 3 && (
            <div className="text-xs text-[rgba(var(--foreground-secondary-rgb))] font-bold">+ {tasks.length - 3} more</div>
        )}
      </div>
    </div>
  );
};

const toDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};


const CalendarPage: React.FC = () => {
    const { 
        todos,
        notes, 
        handleToggleTodo,
        handleDeleteTodo,
        handleEditTodo,
        handleToggleImportant,
        handleToggleSubtask,
        handleEditSubtask,
    } = useAppContext();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    
    const today = useMemo(() => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    }, []);

    const calendarData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const grid: (Date | null)[] = Array(firstDayOfMonth).fill(null);
        for (let i = 1; i <= daysInMonth; i++) {
            grid.push(new Date(year, month, i));
        }

        const tasksByDate = new Map<string, Todo[]>();
        todos.forEach(todo => {
            if (todo.dueDate) {
                const dateKey = todo.dueDate;
                if (!tasksByDate.has(dateKey)) tasksByDate.set(dateKey, []);
                tasksByDate.get(dateKey)!.push(todo);
            }
        });
        
        const notesByDate = new Map<string, Note[]>();
        notes.forEach(note => {
            const dateKey = new Date(note.createdAt).toISOString().split('T')[0];
            if (!notesByDate.has(dateKey)) notesByDate.set(dateKey, []);
            notesByDate.get(dateKey)!.push(note);
        });

        return { grid, tasksByDate, notesByDate };
    }, [currentDate, todos, notes]);
    
    const selectedDayData = useMemo(() => {
        const dateKey = toDateKey(selectedDate);
        return {
            tasks: calendarData.tasksByDate.get(dateKey) || [],
            notes: calendarData.notesByDate.get(dateKey) || [],
        };
    }, [selectedDate, calendarData]);

    const handlePrevMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    const handleSetToday = () => {
        const now = new Date();
        setCurrentDate(now);
        setSelectedDate(now);
    };
    
    const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

    return (
        <div>
            <Header />
            <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h2>
                    <div className="flex items-center space-x-2">
                        <button onClick={handleSetToday} className="px-3 py-1 text-sm font-semibold border border-[rgba(var(--border-secondary-rgb))] rounded-md hover:bg-[rgba(var(--background-tertiary-rgb))]">
                            Today
                        </button>
                        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))]">
                            <HiChevronLeft className="w-5 h-5" />
                        </button>
                        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))]">
                            <HiChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 border-b border-r border-[rgba(var(--border-primary-rgb))] bg-[rgba(var(--background-primary-rgb))]">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="text-center py-2 text-sm font-bold text-[rgba(var(--foreground-secondary-rgb))] border-t border-l border-[rgba(var(--border-primary-rgb))]">
                            <span className="hidden sm:inline">{day}</span>
                            <span className="sm:hidden">{day.charAt(0)}</span>
                        </div>
                    ))}
                    {calendarData.grid.map((date, index) => {
                       const dateKey = date ? toDateKey(date) : '';
                       const tasks = calendarData.tasksByDate.get(dateKey) || [];
                       const notes = calendarData.notesByDate.get(dateKey) || [];
                       return (
                         <CalendarDay
                            key={date ? date.toISOString() : `empty-${index}`}
                            date={date}
                            isToday={date ? isSameDay(date, today) : false}
                            isCurrentMonth={date ? date.getMonth() === currentDate.getMonth() : false}
                            isSelected={date ? isSameDay(date, selectedDate) : false}
                            tasks={tasks}
                            notes={notes}
                            onClick={() => date && setSelectedDate(date)}
                         />
                       );
                    })}
                </div>
            </div>

            <div key={selectedDate.toDateString()} className="p-4 border-t border-[rgba(var(--border-primary-rgb))] animate-fade-in">
                <h2 className="text-xl font-bold mb-4">
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h2>
                {selectedDayData.tasks.length === 0 && selectedDayData.notes.length === 0 ? (
                    <div className="text-center p-8 text-[rgba(var(--foreground-secondary-rgb))]">
                        <p>No tasks or notes for this day.</p>
                    </div>
                ) : (
                    <div>
                        {selectedDayData.tasks.length > 0 && (
                            <div className="mb-4">
                                <h3 className="text-sm font-bold uppercase text-[rgba(var(--foreground-secondary-rgb))] px-4 pb-2">Tasks</h3>
                                {selectedDayData.tasks.map(todo => (
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
                        {selectedDayData.notes.length > 0 && (
                            <div>
                                <h3 className="text-sm font-bold uppercase text-[rgba(var(--foreground-secondary-rgb))] px-4 pb-2">Notes</h3>
                                {selectedDayData.notes.map(note => (
                                    <NoteListItem key={note.id} note={note} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalendarPage;