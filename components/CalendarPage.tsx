import React, { useState, useMemo } from 'react';
import Header from './Header';
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { useAppContext } from '../hooks/useAppContext';
import { type Todo, type Note } from '../types';
import TodoItem from './TodoItem';
import { StickyNote as NoteIcon } from 'lucide-react';

interface CalendarDayProps {
  date: Date | null;
  isToday: boolean;
  isCurrentMonth: boolean;
  tasks: Todo[];
  notes: Note[];
  onClick: () => void;
}

const CalendarDay: React.FC<CalendarDayProps> = ({ date, isToday, isCurrentMonth, tasks, notes, onClick }) => {
  if (!date) {
    return <div className="border-t border-l border-[rgba(var(--border-primary-rgb))]"></div>;
  }
  
  const dayNumber = date.getDate();
  const hasItems = tasks.length > 0 || notes.length > 0;

  return (
    <div 
      className={`border-t border-l border-[rgba(var(--border-primary-rgb))] p-1 sm:p-2 flex flex-col h-24 sm:h-32 transition-colors duration-200 ${isCurrentMonth ? 'bg-transparent' : 'bg-[rgba(var(--background-secondary-rgb),0.5)]'} ${hasItems ? 'cursor-pointer hover:bg-[rgba(var(--background-tertiary-rgb))]' : ''}`}
      onClick={hasItems ? onClick : undefined}
    >
      <div className="flex justify-between items-center">
        {notes.length > 0 && (
            <NoteIcon className="w-3 h-3 text-[rgba(var(--foreground-secondary-rgb))]" title={`${notes.length} note(s) created`}/>
        )}
        <div 
          className={`w-6 h-6 flex items-center justify-center rounded-full text-sm ml-auto ${isToday ? 'bg-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-on-accent-rgb))] font-bold' : isCurrentMonth ? 'text-[rgba(var(--foreground-primary-rgb))]' : 'text-[rgba(var(--foreground-secondary-rgb))]'}`}
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

// Helper to reliably format a date object into a 'YYYY-MM-DD' string key
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
        openDayDetailModal,
        handleToggleTodo,
        handleDeleteTodo,
        handleEditTodo,
        handleToggleImportant,
        handleToggleSubtask,
        handleEditSubtask,
    } = useAppContext();
    const [currentDate, setCurrentDate] = useState(new Date());
    
    const today = useMemo(() => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    }, []);

    const calendarData = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = (new Date(year, month, 1).getDay() + 6) % 7; // Monday is 0
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const grid: (Date | null)[] = Array(firstDayOfMonth).fill(null);

        for (let i = 1; i <= daysInMonth; i++) {
            grid.push(new Date(year, month, i));
        }

        const tasksByDate = new Map<string, Todo[]>();
        todos.forEach(todo => {
            if (todo.dueDate) {
                // Use the dueDate string directly as the key. It's already in the 'YYYY-MM-DD' format
                // and this avoids all timezone conversion issues.
                const dateKey = todo.dueDate;
                if (!tasksByDate.has(dateKey)) {
                    tasksByDate.set(dateKey, []);
                }
                tasksByDate.get(dateKey)!.push(todo);
            }
        });
        
        const notesByDate = new Map<string, Note[]>();
        notes.forEach(note => {
            const dateKey = new Date(note.createdAt).toISOString().split('T')[0];
            if (!notesByDate.has(dateKey)) {
                notesByDate.set(dateKey, []);
            }
            notesByDate.get(dateKey)!.push(note);
        });

        return { grid, tasksByDate, notesByDate };
    }, [currentDate, todos, notes]);

    const upcomingTasks = useMemo(() => {
        const todayForFilter = new Date();
        todayForFilter.setHours(0, 0, 0, 0);

        const tasksWithDueDate = todos
            .filter(todo => todo.dueDate && new Date(todo.dueDate + 'T00:00:00') >= todayForFilter)
            .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
        
        const groupedByDate = tasksWithDueDate.reduce((acc, task) => {
            const dateKey = task.dueDate!;
            if (!acc[dateKey]) {
                acc[dateKey] = [];
            }
            acc[dateKey].push(task);
            return acc;
        }, {} as Record<string, Todo[]>);

        return groupedByDate;
    }, [todos]);

    const handlePrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };
    
    const handleSetToday = () => {
        setCurrentDate(new Date());
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
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))]">
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 border-b border-r border-[rgba(var(--border-primary-rgb))]">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                        <div key={day} className="text-center py-2 text-sm font-bold text-[rgba(var(--foreground-secondary-rgb))] border-t border-l border-[rgba(var(--border-primary-rgb))]">
                            <span className="hidden sm:inline">{day}</span>
                            <span className="sm:hidden">{day.charAt(0)}</span>
                        </div>
                    ))}
                    {calendarData.grid.map((date, index) => {
                       // Use the reliable helper function to generate the key for lookup
                       const dateKey = date ? toDateKey(date) : '';
                       const tasks = calendarData.tasksByDate.get(dateKey) || [];
                       const notes = calendarData.notesByDate.get(dateKey) || [];
                       return (
                         <CalendarDay
                            key={date ? date.toISOString() : `empty-${index}`}
                            date={date}
                            isToday={date ? isSameDay(date, today) : false}
                            isCurrentMonth={date ? date.getMonth() === currentDate.getMonth() : false}
                            tasks={tasks}
                            notes={notes}
                            onClick={() => date && openDayDetailModal(date, tasks, notes)}
                         />
                       );
                    })}
                </div>
            </div>

            <div className="p-4 mt-4 border-t border-[rgba(var(--border-primary-rgb))]">
                <h2 className="text-2xl font-bold mb-4">Upcoming Agenda</h2>
                {Object.keys(upcomingTasks).length > 0 ? (
                    <div className="space-y-4">
                        {/* Fix: Refactored to use Object.keys to avoid type inference issues with Object.entries. */}
                        {Object.keys(upcomingTasks).map((date) => (
                            <div key={date}>
                                <h3 className="font-bold text-lg mb-2 sticky top-16 bg-[rgba(var(--background-primary-rgb))] py-3 border-b border-[rgba(var(--border-secondary-rgb))] z-10">
                                    {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </h3>
                                <div>
                                    {upcomingTasks[date].map(todo => (
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
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-8 text-[rgba(var(--foreground-secondary-rgb))]">
                        <p>No upcoming tasks with due dates.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalendarPage;