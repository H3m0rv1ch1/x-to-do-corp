import React, { createContext, useState, useEffect, useMemo, useCallback, ReactNode, useRef } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { type Todo, type UserProfile, type Note, type Subtask, type Toast, type UnlockedAchievement, type Achievement, RecurrenceType, Page, TagColorMap, Priority } from '../types';
import * as db from '../db';
import { achievementsList, checkAchievementConditions, type AchievementStats } from '../achievements';
import { parseTextForDueDate, parseTextForTags } from '../utils/textParser';

export type SortOrder = 'newest' | 'oldest' | 'dueDate' | 'priority';
export type NotesSortOrder = 'updatedAt' | 'createdAt' | 'alphabetical';

const TAG_COLORS_PALETTE: { background: string; foreground: string }[] = [
    { background: 'rgba(29, 155, 240, 0.1)', foreground: 'rgba(29, 155, 240, 1)' }, // Blue
    { background: 'rgba(249, 24, 128, 0.1)', foreground: 'rgba(249, 24, 128, 1)' }, // Pink
    { background: 'rgba(0, 186, 124, 0.1)', foreground: 'rgba(0, 186, 124, 1)' },  // Green
    { background: 'rgba(255, 212, 0, 0.1)', foreground: 'rgba(255, 212, 0, 1)' },   // Yellow
    { background: 'rgba(120, 86, 255, 0.1)', foreground: 'rgba(120, 86, 255, 1)' }, // Purple
    { background: 'rgba(255, 122, 0, 0.1)', foreground: 'rgba(255, 122, 0, 1)' },  // Orange
    { background: 'rgba(0, 199, 227, 0.1)', foreground: 'rgba(0, 199, 227, 1)' },  // Cyan
    { background: 'rgba(244, 53, 102, 0.1)', foreground: 'rgba(244, 53, 102, 1)' }, // Magenta
];

export interface FocusSettings {
    focusDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    autoStart: boolean;
    sound: string;
    volume: number;
}

export type SessionMode = 'focus' | 'shortBreak' | 'longBreak';

export interface FocusSessionState {
  todoId: string | null;
  isActive: boolean;
  mode: SessionMode;
  timeRemaining: number;
  initialDuration: number;
  cycles: number;
}

const NOTIFICATION_SOUND = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU5vdT19AQIDAQUCAwQFBAUEBQUIBgYHBwcIBwgHCAgICQkJCAkJCQoKCgoKCgoKCgoKCgwMDAwMDAwMDA0NDQ0NDQ0NDQ0NDQ4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg4ODg';


export interface AppContextType {
  todos: Todo[];
  notes: Note[];
  unlockedAchievements: UnlockedAchievement[];
  allAchievements: Achievement[];
  userProfile: UserProfile;
  page: Page;
  setPage: React.Dispatch<React.SetStateAction<Page>>;
  filter: 'all' | 'pending' | 'completed' | 'important';
  setFilter: React.Dispatch<React.SetStateAction<'all' | 'pending' | 'completed' | 'important'>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  isAddTaskModalOpen: boolean;
  openAddTaskModal: () => void;
  closeAddTaskModal: () => void;
  handleAddTodo: (todoData: { text: string; imageUrl: string | null; dueDate: string | null; priority: Priority; subtasks: string[]; tags: string[], recurrenceRule: { type: RecurrenceType } | null, reminderOffset: number | null }) => void;
  handleToggleTodo: (id: string) => void;
  handleDeleteTodo: (id: string) => void;
  handleEditTodo: (id: string, newText: string) => void;
  handleToggleImportant: (id: string) => void;
  handleSetPriority: (id: string, priority: Priority) => void;
  handleAddNote: (newNoteData: { title: string; content: string }) => Promise<string>;
  handleUpdateNote: (updatedNote: Note) => void;
  handleDeleteNote: (id: string) => void;
  handleDeleteAllNotes: () => void;
  handleSaveProfile: (newProfile: UserProfile) => void;
  handleToggleSubtask: (todoId: string, subtaskId: string) => void;
  handleEditSubtask: (todoId: string, subtaskId: string, newText: string) => void;
  handleSummarizeNote: (noteId: string) => Promise<void>;
  handleClearCompletedTodos: () => void;
  handleExportData: () => void;
  handleImportData: (file: File) => void;
  handleDeleteAllData: () => void;
  filteredTodos: Todo[];
  pageTitle: string;
  sortOrder: SortOrder;
  setSortOrder: React.Dispatch<React.SetStateAction<SortOrder>>;
  confirmationState: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  };
  hideConfirmation: () => void;
  isLoading: boolean;
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  lightboxImageUrl: string | null;
  openLightbox: (url: string) => void;
  closeLightbox: () => void;
  handleTagClick: (tag: string) => void;
  activeTag: string | null;
  clearActiveTag: () => void;
  handlePinNote: (id: string) => void;
  notesSearchQuery: string;
  setNotesSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  notesSortOrder: NotesSortOrder;
  setNotesSortOrder: React.Dispatch<React.SetStateAction<NotesSortOrder>>;
  filteredNotes: Note[];
  notificationPermission: NotificationPermission;
  requestNotificationPermission: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  accent: string;
  setAccent: (accent: string) => void;
  tagColors: TagColorMap;
  dayDetail: { date: Date; tasks: Todo[]; notes: Note[] } | null;
  openDayDetailModal: (date: Date, tasks: Todo[], notes: Note[]) => void;
  closeDayDetailModal: () => void;
  selectedNoteId: string | null;
  setSelectedNoteId: React.Dispatch<React.SetStateAction<string | null>>;
  activeFocusTodo: Todo | null;
  isFocusModalOpen: boolean;
  focusSession: FocusSessionState;
  startFocusSession: (todoId: string) => void;
  stopFocusSession: () => void;
  openFocusModal: () => void;
  closeFocusModal: () => void;
  toggleFocusSessionActive: () => void;
  changeFocusMode: (mode: SessionMode) => void;
  isShortcutsModalOpen: boolean;
  openShortcutsModal: () => void;
  closeShortcutsModal: () => void;
  focusSettings: FocusSettings;
  updateFocusSettings: (newSettings: Partial<FocusSettings>) => void;
}

export const AppContext = createContext<AppContextType | null>(null);

const channel = new BroadcastChannel('x-todo-app-sync');

const calculateNextDueDate = (currentDueDate: string, rule: { type: RecurrenceType }): string => {
    // Parse as local time to avoid timezone shifts when adding days
    const date = new Date(`${currentDueDate}T00:00:00`);
    const originalDay = date.getDate();

    switch (rule.type) {
        case 'daily':
            date.setDate(date.getDate() + 1);
            break;
        case 'weekly':
            date.setDate(date.getDate() + 7);
            break;
        case 'monthly':
            date.setMonth(date.getMonth() + 1);
            // Handle month-end cases (e.g., Jan 31 -> Feb 28/29)
            if (date.getDate() !== originalDay) {
                date.setDate(0); // Set to the last day of the previous month
            }
            break;
        case 'yearly':
            date.setFullYear(date.getFullYear() + 1);
            break;
    }
    // Return in YYYY-MM-DD format
    return date.toISOString().split('T')[0];
};

export const AppProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>([]);
  
  const defaultProfile: UserProfile = {
    name: 'User',
    username: '@user',
    bio: 'Your personal to-do list to conquer the day. Stay organized and productive!',
    avatarUrl: null,
    bannerUrl: null,
    verificationType: 'none',
  };
  
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);
  
  const [page, setPage] = useState<Page>('home');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'important'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(() => localStorage.getItem('activeTag'));
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [notesSearchQuery, setNotesSearchQuery] = useState('');
  const [notesSortOrder, setNotesSortOrder] = useState<NotesSortOrder>('updatedAt');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [tagColors, setTagColors] = useState<TagColorMap>({});
  const [dayDetail, setDayDetail] = useState<{ date: Date; tasks: Todo[]; notes: Note[] } | null>(null);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [focusSettings, setFocusSettings] = useState<FocusSettings>({
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    autoStart: false,
    sound: 'none',
    volume: 0.5,
  });

  const [theme, setThemeState] = useState<'light' | 'dark'>(() => (localStorage.getItem('app-theme') as 'light' | 'dark') || 'dark');
  const [accent, setAccentState] = useState<string>(() => localStorage.getItem('app-accent') || 'sky');

  // --- Focus Session State ---
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [focusSession, setFocusSession] = useState<FocusSessionState>({
    todoId: null,
    isActive: false,
    mode: 'focus',
    timeRemaining: 25 * 60,
    initialDuration: 25 * 60,
    cycles: 0,
  });
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);
  // --- End Focus Session State ---

  const [confirmationState, setConfirmationState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);
  
  const checkAndUnlockAchievements = useCallback(async (stats: AchievementStats, currentUnlocked: UnlockedAchievement[]) => {
    const newlyUnlocked = checkAchievementConditions(stats, currentUnlocked);

    if (newlyUnlocked.length > 0) {
      const newUnlockedAchievements = newlyUnlocked.map(achievement => {
        addToast(`Achievement Unlocked: ${achievement.title}!`, 'success');
        return {
          achievementId: achievement.id,
          unlockedAt: new Date().toISOString()
        };
      });

      try {
        for (const unlocked of newUnlockedAchievements) {
          await db.putUnlockedAchievement(unlocked);
        }
        setUnlockedAchievements(prev => [...prev, ...newUnlockedAchievements]);
        postStateUpdate();
      } catch (error) {
        console.error('Failed to save achievements', error);
        addToast('Could not save achievement progress.', 'error');
      }
    }
  }, [addToast]);

  useEffect(() => {
    // Set initial notification permission state from browser
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
    // Preload notification sound
    notificationAudioRef.current = new Audio(NOTIFICATION_SOUND);
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      addToast("This browser does not support desktop notification", 'error');
      return;
    }
    
    if (notificationPermission === 'default') {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        addToast("Notifications enabled!", 'success');
      } else {
        addToast("Notifications not enabled.", 'info');
      }
    }
  }, [notificationPermission, addToast]);

  const loadDataFromDB = useCallback(async () => {
      const [dbTodos, dbNotes, dbProfile, dbAchievements, dbTagColors, dbFocusSettings] = await Promise.all([
          db.getTodos(),
          db.getNotes(),
          db.getUserProfile(),
          db.getUnlockedAchievements(),
          db.getValue('tagColors'),
          db.getValue('focusSettings'),
      ]);

      setTodos(dbTodos);
      setNotes(dbNotes);
      setUnlockedAchievements(dbAchievements);
      if (dbTagColors) setTagColors(dbTagColors.value);
      if (dbFocusSettings) setFocusSettings(prev => ({ ...prev, ...dbFocusSettings.value }));


      if (dbProfile) {
          setUserProfile(dbProfile);
      } else {
          setUserProfile(defaultProfile);
          await db.saveUserProfile(defaultProfile);
      }
      setIsLoading(false);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    loadDataFromDB().catch(error => {
        console.error("Failed to load data from database:", error);
        addToast("Could not load data. Please refresh.", "error");
        setIsLoading(false);
    });

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'STATE_UPDATED') {
        loadDataFromDB().catch(error => {
            console.error("Failed to sync data across tabs:", error);
            addToast("Failed to sync data.", "error");
        });
      }
    };
    channel.addEventListener('message', handleMessage);

    return () => {
      channel.removeEventListener('message', handleMessage);
    };
  }, [loadDataFromDB, addToast]);
  
  // Effect for due dates and advanced reminder notifications
  useEffect(() => {
    if (notificationPermission !== 'granted') {
        return;
    }

    const interval = setInterval(async () => {
        const now = new Date();
        const todosToNotify = [];

        for (const todo of todos) {
            if (!todo.completed && !todo.notified && todo.dueDate) {
                // Parse due date as midnight in user's local timezone
                const dueDate = new Date(`${todo.dueDate}T00:00:00`);
                
                // reminderOffset can be null, so default to 0 for due date check
                const reminderOffsetMinutes = todo.reminderOffset ?? 0;
                const notificationTime = new Date(dueDate.getTime() - reminderOffsetMinutes * 60000);

                if (notificationTime <= now) {
                    todosToNotify.push(todo);
                }
            }
        }

        if (todosToNotify.length > 0) {
            const updatedTodos = [...todos];
            for (const todo of todosToNotify) {
                new Notification('Task Reminder!', {
                    body: todo.text,
                    icon: '/favicon.svg',
                });

                // Mark as notified in the updatedTodos array
                const index = updatedTodos.findIndex(t => t.id === todo.id);
                if (index !== -1) {
                    const notifiedTodo = { ...todo, notified: true };
                    updatedTodos[index] = notifiedTodo;
                    try {
                        await db.putTodo(notifiedTodo);
                    } catch (error) {
                        console.error("Failed to mark task as notified:", error);
                        // Don't toast here to avoid spamming user
                    }
                }
            }
            setTodos(updatedTodos);
            postStateUpdate();
        }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [todos, notificationPermission]);

  // Clear active tag when user starts a new search
  useEffect(() => {
    if (searchQuery.trim() !== '') {
        setActiveTag(null);
    }
  }, [searchQuery]);

  // Persist active tag to localStorage
  useEffect(() => {
    if (activeTag) {
        localStorage.setItem('activeTag', activeTag);
    } else {
        localStorage.removeItem('activeTag');
    }
  }, [activeTag]);

  // Clear active tag on page navigation away from home
  useEffect(() => {
    if (page !== 'home' && activeTag) {
      clearActiveTag();
    }
  }, [page, activeTag]);

  // Effect for managing theme
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-accent', accent);
    localStorage.setItem('app-theme', theme);
    localStorage.setItem('app-accent', accent);
  }, [theme, accent]);

  // --- Focus Session Timer Logic ---
  const handleSessionEnd = useCallback(() => {
      notificationAudioRef.current?.play();
      
      const message = focusSession.mode === 'focus' ? "Time for a break!" : "Time to get back to focus!";
      if (notificationPermission === 'granted') {
          new Notification('Focus Session Complete!', { body: message, icon: '/favicon.svg' });
      }

      setFocusSession(prev => {
          if (prev.mode === 'focus') {
              const newCycles = prev.cycles + 1;
              const nextMode = newCycles % 4 === 0 ? 'longBreak' : 'shortBreak';
              const duration = (nextMode === 'longBreak' ? focusSettings.longBreakDuration : focusSettings.shortBreakDuration) * 60;
              
              return {
                  ...prev,
                  isActive: focusSettings.autoStart,
                  mode: nextMode,
                  cycles: newCycles,
                  timeRemaining: duration,
                  initialDuration: duration,
              };
          } else {
              const duration = focusSettings.focusDuration * 60;
              return {
                  ...prev,
                  isActive: focusSettings.autoStart,
                  mode: 'focus',
                  timeRemaining: duration,
                  initialDuration: duration,
              };
          }
      });
  }, [focusSession.mode, focusSettings, notificationPermission]);

  useEffect(() => {
    let interval: number | null = null;
    if (focusSession.isActive && focusSession.todoId) {
        interval = window.setInterval(() => {
            setFocusSession(prev => {
                if (prev.timeRemaining <= 1) {
                    handleSessionEnd();
                    return { ...prev, timeRemaining: 0, isActive: false };
                }
                return { ...prev, timeRemaining: prev.timeRemaining - 1 };
            });
        }, 1000);
    }
    return () => {
        if (interval) clearInterval(interval);
    };
  }, [focusSession.isActive, focusSession.todoId, handleSessionEnd]);


  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  };
  
  const setAccent = useCallback((newAccent: string) => {
    const oldAccent = accent;
    if (newAccent !== oldAccent) {
        checkAndUnlockAchievements({ todos, notes, userProfile, accent: newAccent, oldAccent }, unlockedAchievements);
    }
    setAccentState(newAccent);
  }, [accent, todos, notes, userProfile, unlockedAchievements, checkAndUnlockAchievements]);


  const postStateUpdate = () => {
    channel.postMessage({ type: 'STATE_UPDATED' });
  };
  
  const openAddTaskModal = () => setIsAddTaskModalOpen(true);
  const closeAddTaskModal = () => setIsAddTaskModalOpen(false);
  
  const openLightbox = (url: string) => setLightboxImageUrl(url);
  const closeLightbox = () => setLightboxImageUrl(null);

  const showConfirmation = (title: string, message: string, onConfirm: () => void) => {
    setConfirmationState({ isOpen: true, title, message, onConfirm });
  };
  
  const hideConfirmation = () => {
    setConfirmationState(prev => ({ ...prev, isOpen: false }));
  };

  const handleAddTodo = useCallback(async (todoData: { text: string; imageUrl: string | null; dueDate: string | null; priority: Priority; subtasks: string[]; tags: string[], recurrenceRule: { type: RecurrenceType } | null, reminderOffset: number | null }) => {
    let { cleanedText: text, tags: parsedTags } = parseTextForTags(todoData.text);
    let { cleanedText, dueDate: parsedDueDate } = parseTextForDueDate(text);
    
    const allTags = [...new Set([...todoData.tags, ...parsedTags])];
    
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: cleanedText,
      completed: false,
      isImportant: false,
      priority: todoData.priority || 'medium',
      imageUrl: todoData.imageUrl,
      dueDate: todoData.dueDate || parsedDueDate,
      tags: allTags,
      subtasks: todoData.subtasks.map(subtaskText => ({ id: crypto.randomUUID(), text: subtaskText, completed: false })),
      createdAt: new Date().toISOString(),
      notified: false,
      recurrenceRule: todoData.recurrenceRule,
      reminderOffset: todoData.reminderOffset,
    };
    
    const newTodos = [newTodo, ...todos];
    
    try {
        // Assign colors to new tags
        let newTagColors = { ...tagColors };
        let needsUpdate = false;
        const existingColorCount = Object.keys(newTagColors).length;
        let newColorIndex = 0;

        allTags.forEach(tag => {
            if (!newTagColors[tag]) {
                const color = TAG_COLORS_PALETTE[(existingColorCount + newColorIndex) % TAG_COLORS_PALETTE.length];
                newTagColors[tag] = color;
                needsUpdate = true;
                newColorIndex++;
            }
        });

        if (needsUpdate) {
            setTagColors(newTagColors);
            await db.putValue('tagColors', newTagColors);
        }

        setTodos(newTodos);
        await db.putTodo(newTodo);
        addToast("Task added successfully!", "success");
        checkAndUnlockAchievements({ todos: newTodos, notes, userProfile, accent }, unlockedAchievements);
        postStateUpdate();
    } catch (error) {
        console.error("Failed to add task:", error);
        addToast("Error: Could not add task.", "error");
        setTodos(todos); // Revert state on failure
    }
  }, [addToast, todos, notes, unlockedAchievements, checkAndUnlockAchievements, tagColors, userProfile, accent]);

  const handleToggleTodo = useCallback(async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    // The logic for recurring tasks is to "reset" the current task instance for the next
    // due date, rather than creating a new task. This keeps the list clean.
    // The achievement check happens on a temporary, in-memory version of the todos array
    // just before the state is updated, ensuring completions are counted correctly.
    if (!todo.completed) { // Marking as complete
        const completedTodo: Todo = { ...todo, completed: true, completedAt: new Date().toISOString() };
        const tempTodosForAchievements = todos.map(t => t.id === id ? completedTodo : t);
        checkAndUnlockAchievements({ todos: tempTodosForAchievements, notes, userProfile, accent }, unlockedAchievements);
        
        if (todo.recurrenceRule && todo.dueDate) {
            const nextDueDate = calculateNextDueDate(todo.dueDate, todo.recurrenceRule);
            const nextInstance: Todo = {
                ...todo,
                dueDate: nextDueDate,
                completed: false,
                completedAt: undefined,
                notified: false,
                subtasks: todo.subtasks?.map(st => ({ ...st, completed: false })),
            };
            setTodos(todos.map(t => t.id === id ? nextInstance : t));
            try {
                await db.putTodo(nextInstance);
                addToast(`Task completed! Next one is due on ${new Date(nextDueDate + 'T00:00:00').toLocaleDateString()}`, 'success');
            } catch(e) {
                addToast('Failed to save recurring task.', 'error');
                setTodos(todos); // Revert
            }
        } else {
            setTodos(tempTodosForAchievements);
            try {
                await db.putTodo(completedTodo);
            } catch(e) {
                addToast('Failed to save task completion.', 'error');
                setTodos(todos); // Revert
            }
        }
    } else { // Marking as incomplete
        const uncompletedTodo: Todo = { ...todo, completed: false, completedAt: undefined };
        setTodos(todos.map(t => t.id === id ? uncompletedTodo : t));
        try {
            await db.putTodo(uncompletedTodo);
        } catch(e) {
            addToast('Failed to update task.', 'error');
            setTodos(todos); // Revert
        }
    }
    postStateUpdate();
}, [todos, notes, unlockedAchievements, checkAndUnlockAchievements, addToast, userProfile, accent]);


  const handleDeleteTodo = useCallback((id: string) => {
    showConfirmation(
      "Delete Task?",
      "This action cannot be undone. The task will be permanently deleted.",
      async () => {
        const originalTodos = todos;
        setTodos(prev => prev.filter(todo => todo.id !== id));
        try {
            await db.deleteTodo(id);
            addToast("Task deleted.", "info");
            postStateUpdate();
        } catch (error) {
            addToast("Failed to delete task.", "error");
            setTodos(originalTodos); // Revert
        }
      }
    );
  }, [addToast, todos]);

  const handleEditTodo = useCallback(async (id: string, newText: string) => {
    let updatedTodo: Todo | undefined;
    const originalTodos = todos;
    setTodos(prev => prev.map(todo => {
      if (todo.id === id) {
        updatedTodo = { ...todo, text: newText };
        return updatedTodo;
      }
      return todo;
    }));
     if (updatedTodo) {
        try {
            await db.putTodo(updatedTodo);
            postStateUpdate();
        } catch (error) {
            addToast("Failed to save changes.", "error");
            setTodos(originalTodos); // Revert
        }
    }
  }, [todos, addToast]);

  const handleToggleImportant = useCallback(async (id: string) => {
    let updatedTodo: Todo | undefined;
    const originalTodos = todos;
    const newTodos = todos.map(todo => {
      if (todo.id === id) {
        updatedTodo = { ...todo, isImportant: !todo.isImportant };
        return updatedTodo;
      }
      return todo;
    });
    setTodos(newTodos);

     if (updatedTodo) {
        try {
            await db.putTodo(updatedTodo);
            addToast(updatedTodo.isImportant ? "Marked as important!" : "Marked as not important.", "info");
            checkAndUnlockAchievements({ todos: newTodos, notes, userProfile, accent }, unlockedAchievements);
            postStateUpdate();
        } catch (error) {
            addToast("Failed to update task.", "error");
            setTodos(originalTodos); // Revert
        }
    }
  }, [addToast, todos, notes, unlockedAchievements, checkAndUnlockAchievements, userProfile, accent]);
  
  const handleSetPriority = useCallback(async (id: string, priority: Priority) => {
    let updatedTodo: Todo | undefined;
    const originalTodos = todos;
    setTodos(prev => prev.map(todo => {
      if (todo.id === id) {
        updatedTodo = { ...todo, priority };
        return updatedTodo;
      }
      return todo;
    }));
    if (updatedTodo) {
        try {
            await db.putTodo(updatedTodo);
            postStateUpdate();
        } catch (error) {
            addToast("Failed to set priority.", "error");
            setTodos(originalTodos); // Revert
        }
    }
  }, [todos, addToast]);

  const handleToggleSubtask = useCallback(async (todoId: string, subtaskId: string) => {
      let updatedTodo: Todo | undefined;
      const originalTodos = todos;
      setTodos(prev => prev.map(todo => {
          if (todo.id === todoId) {
              const updatedSubtasks = todo.subtasks?.map(subtask => 
                  subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
              );
              updatedTodo = { ...todo, subtasks: updatedSubtasks };
              return updatedTodo;
          }
          return todo;
      }));
      if (updatedTodo) {
          try {
              await db.putTodo(updatedTodo);
              postStateUpdate();
          } catch(e) {
              addToast("Failed to update subtask.", "error");
              setTodos(originalTodos);
          }
      }
  }, [todos, addToast]);
  
  const handleEditSubtask = useCallback(async (todoId: string, subtaskId: string, newText: string) => {
    let updatedTodo: Todo | undefined;
    const originalTodos = todos;
    setTodos(prev => prev.map(todo => {
        if (todo.id === todoId) {
            const updatedSubtasks = todo.subtasks?.map(subtask => 
                subtask.id === subtaskId ? { ...subtask, text: newText } : subtask
            );
            updatedTodo = { ...todo, subtasks: updatedSubtasks };
            return updatedTodo;
        }
        return todo;
    }));
    if (updatedTodo) {
        try {
            await db.putTodo(updatedTodo);
            postStateUpdate();
        } catch(e) {
            addToast("Failed to save subtask.", "error");
            setTodos(originalTodos);
        }
    }
  }, [todos, addToast]);

  const handleAddNote = useCallback(async (newNoteData: { title: string; content: string }): Promise<string> => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: newNoteData.title,
      content: newNoteData.content,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const newNotes = [newNote, ...notes];
    setNotes(newNotes);
    try {
        await db.putNote(newNote);
        addToast("Note created!", "success");
        checkAndUnlockAchievements({ todos, notes: newNotes, userProfile, accent }, unlockedAchievements);
        postStateUpdate();
    } catch (error) {
        addToast("Failed to create note.", "error");
        setNotes(notes); // Revert
    }
    return newNote.id;
  }, [addToast, todos, notes, unlockedAchievements, checkAndUnlockAchievements, userProfile, accent]);

  const handleUpdateNote = useCallback(async (updatedNote: Note) => {
    const originalNotes = notes;
    const noteWithTimestamp = { ...updatedNote, updatedAt: new Date().toISOString() };
    setNotes(prev => prev.map(note => (note.id === noteWithTimestamp.id ? noteWithTimestamp : note)));
    try {
        await db.putNote(noteWithTimestamp);
        postStateUpdate();
    } catch (error) {
        addToast("Failed to save note.", "error");
        setNotes(originalNotes); // Revert
    }
  }, [notes, addToast]);

  const handleDeleteNote = useCallback((id: string) => {
    showConfirmation(
      "Delete Note?",
      "Are you sure you want to permanently delete this note?",
      async () => {
        const originalNotes = notes;
        setNotes(prev => prev.filter(note => note.id !== id));
        try {
            await db.deleteNote(id);
            addToast("Note deleted.", "info");
            postStateUpdate();
        } catch (error) {
            addToast("Failed to delete note.", "error");
            setNotes(originalNotes);
        }
      }
    );
  }, [addToast, notes]);
  
  const handleDeleteAllNotes = useCallback(() => {
      showConfirmation(
        "Delete All Notes?",
        "Are you sure you want to delete all notes? This action cannot be undone.",
        async () => {
          const originalNotes = notes;
          setNotes([]);
          try {
            await db.clearNotes();
            addToast("All notes have been deleted.", "success");
            postStateUpdate();
          } catch(e) {
            addToast("Failed to delete notes.", "error");
            setNotes(originalNotes);
          }
        }
      );
  }, [addToast, notes]);
  
  const handlePinNote = useCallback(async (id: string) => {
    let updatedNote: Note | undefined;
    const originalNotes = notes;
    setNotes(prev => prev.map(note => {
        if (note.id === id) {
            updatedNote = { ...note, isPinned: !note.isPinned };
            return updatedNote;
        }
        return note;
    }));
    if (updatedNote) {
        try {
            await db.putNote(updatedNote);
            addToast(updatedNote.isPinned ? "Note pinned!" : "Note unpinned.", "info");
            postStateUpdate();
        } catch(e) {
            addToast("Failed to update pin status.", "error");
            setNotes(originalNotes);
        }
    }
  }, [addToast, notes]);


  const handleSaveProfile = useCallback(async (newProfile: UserProfile) => {
    const originalProfile = userProfile;
    setUserProfile(newProfile);
    checkAndUnlockAchievements({ todos, notes, userProfile: newProfile, oldUserProfile: originalProfile, accent }, unlockedAchievements);
    try {
        await db.saveUserProfile(newProfile);
        addToast("Profile updated successfully!", "success");
        postStateUpdate();
    } catch (error) {
        addToast("Failed to save profile.", "error");
        setUserProfile(originalProfile);
    }
  }, [addToast, userProfile, todos, notes, accent, unlockedAchievements, checkAndUnlockAchievements]);

  const handleSummarizeNote = useCallback(async (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note || !note.content) {
        addToast("Cannot summarize an empty note.", "error");
        return;
    }
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Generate a concise, descriptive title (5 words max) for this note content: "${note.content}"`,
        });
        const newTitle = response.text.trim().replace(/^"|"$/g, '');
        if (newTitle) {
            handleUpdateNote({ ...note, title: newTitle });
            addToast("Title generated by AI!", "success");
        } else {
            addToast("AI could not generate a title.", "error");
        }
    } catch (error) {
        console.error("AI summarization failed:", error);
        addToast("Failed to generate title. Check your API key.", "error");
    }
  }, [notes, handleUpdateNote, addToast]);
  
  const handleClearCompletedTodos = useCallback(() => {
    showConfirmation(
      "Clear Completed Tasks?",
      "Are you sure you want to delete all completed tasks?",
      async () => {
        const completedIds = todos.filter(t => t.completed).map(t => t.id);
        if(completedIds.length === 0) {
            addToast("No completed tasks to clear.", "info");
            return;
        }
        const originalTodos = todos;
        setTodos(prev => prev.filter(t => !t.completed));
        try {
            for (const id of completedIds) {
              await db.deleteTodo(id);
            }
            addToast("Cleared all completed tasks!", "success");
            postStateUpdate();
        } catch (error) {
            addToast("Failed to clear completed tasks.", "error");
            setTodos(originalTodos);
        }
      }
    );
  }, [todos, addToast]);

  const handleExportData = useCallback(() => {
    try {
        const dataToExport = {
            todos,
            notes,
            userProfile,
            unlockedAchievements,
            tagColors,
        };
        const jsonString = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `x-todo-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addToast("Data exported successfully!", "success");
    } catch (error) {
        console.error("Failed to export data:", error);
        addToast("Data export failed.", "error");
    }
  }, [todos, notes, userProfile, unlockedAchievements, tagColors, addToast]);

  const handleImportData = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const result = event.target?.result;
            if (typeof result !== 'string') {
                throw new Error("File could not be read");
            }
            const data = JSON.parse(result);

            // Basic validation
            if (!data.todos || !data.notes || !data.userProfile || !data.unlockedAchievements) {
                throw new Error("Invalid backup file format.");
            }

            showConfirmation(
                "Import Data?",
                "This will overwrite all current data in the app. This action cannot be undone. Are you sure you want to continue?",
                async () => {
                    setIsLoading(true);
                    try {
                        await db.clearAllData();
                        await Promise.all([
                            ...data.todos.map((t: Todo) => db.putTodo(t)),
                            ...data.notes.map((n: Note) => db.putNote(n)),
                            ...data.unlockedAchievements.map((a: UnlockedAchievement) => db.putUnlockedAchievement(a)),
                            db.saveUserProfile(data.userProfile),
                            db.putValue('tagColors', data.tagColors || {})
                        ]);
                        await loadDataFromDB(); // Reload state from DB
                        addToast("Data imported successfully!", "success");
                        postStateUpdate();
                    } catch (error) {
                        addToast("An error occurred during import.", "error");
                        console.error("Import failed:", error);
                        await loadDataFromDB(); // Attempt to reload old data
                    } finally {
                        setIsLoading(false);
                    }
                }
            );
        } catch (error) {
            console.error("Failed to import data:", error);
            addToast(error instanceof Error ? error.message : "Data import failed.", "error");
        }
    };
    reader.onerror = () => {
        addToast("Failed to read the import file.", "error");
    };
    reader.readAsText(file);
  }, [addToast, loadDataFromDB]);

  const handleDeleteAllData = useCallback(() => {
    showConfirmation(
        "Delete All Data?",
        "This will permanently delete all your tasks, notes, and profile settings. This action is irreversible. Are you absolutely sure?",
        async () => {
            setIsLoading(true);
            try {
                await db.clearAllData();
                setTodos([]);
                setNotes([]);
                setUnlockedAchievements([]);
                setTagColors({});
                setUserProfile(defaultProfile);
                await db.saveUserProfile(defaultProfile); // Save default profile
                addToast("All application data has been deleted.", "success");
                postStateUpdate();
            } catch (error) {
                addToast("Failed to delete all data.", "error");
            } finally {
                setIsLoading(false);
            }
        }
    );
  }, [addToast, defaultProfile]);

  const handleTagClick = (tag: string) => {
    setSearchQuery('');
    setActiveTag(tag);
    setPage('home'); // Ensure user is on the home page to see tag filter results
  };

  const clearActiveTag = () => {
    setActiveTag(null);
  };
  
  const filteredNotes = useMemo(() => {
    return notes
      .filter(note => {
        const query = notesSearchQuery.toLowerCase();
        return note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query);
      })
      .sort((a, b) => {
         if (a.isPinned !== b.isPinned) {
            return a.isPinned ? -1 : 1;
        }
        switch(notesSortOrder) {
          case 'updatedAt':
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          case 'createdAt':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'alphabetical':
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
  }, [notes, notesSearchQuery, notesSortOrder]);

  const filteredTodos = useMemo(() => {
    let tempTodos = [...todos];
    const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

    const sorter = (a: Todo, b: Todo) => {
      switch (sortOrder) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'dueDate': {
          if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          if (a.dueDate) return -1;
          if (b.dueDate) return 1;
          return 0;
        }
        case 'priority': {
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0) return priorityDiff;
            // Secondary sort by newest if priorities are the same
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    };

    // Search query overrides all other filters
    if (searchQuery.trim() !== '') {
      const lowercasedQuery = searchQuery.toLowerCase();
      return tempTodos.filter(todo =>
        todo.text.toLowerCase().includes(lowercasedQuery) ||
        (todo.subtasks && todo.subtasks.some(st => st.text.toLowerCase().includes(lowercasedQuery))) ||
        (todo.tags && todo.tags.some(tag => tag.toLowerCase().includes(lowercasedQuery)))
      ).sort(sorter);
    }

    // Filter by active tag
    if (activeTag) {
      tempTodos = tempTodos.filter(todo => todo.tags.includes(activeTag));
    }

    // Filter by category (all, pending, completed, important)
    tempTodos = tempTodos.filter(todo => {
      switch (filter) {
        case 'pending':
          return !todo.completed;
        case 'completed':
          return todo.completed;
        case 'important':
          return todo.isImportant;
        default:
          return true; // 'all'
      }
    });

    return tempTodos.sort(sorter);
  }, [todos, filter, searchQuery, sortOrder, activeTag]);

  const pageTitle = useMemo(() => {
    if (page === 'profile') return userProfile.name;
    if (page === 'notes') return 'Notes';
    if (page === 'achievements') return 'Achievements';
    if (page === 'settings') return 'Settings';
    if (page === 'calendar') return 'Calendar';
    if (page === 'home') {
        if (filter === 'important') return 'Important';
        if (filter === 'pending') return 'Pending';
        if (filter === 'completed') return 'Completed';
    }
    return 'Home';
  }, [page, filter, userProfile.name]);

  const openDayDetailModal = (date: Date, tasks: Todo[], notes: Note[]) => {
    setDayDetail({ date, tasks, notes });
  };
  const closeDayDetailModal = () => {
    setDayDetail(null);
  };
  
  const activeFocusTodo = useMemo(() => {
    return todos.find(t => t.id === focusSession.todoId) || null;
  }, [focusSession.todoId, todos]);

  const startFocusSession = (todoId: string) => {
    const duration = focusSettings.focusDuration * 60;
    setFocusSession({
        todoId,
        isActive: true,
        mode: 'focus',
        timeRemaining: duration,
        initialDuration: duration,
        cycles: 0,
    });
    setIsFocusModalOpen(true);
  };
  const stopFocusSession = () => {
    setFocusSession({ todoId: null, isActive: false, mode: 'focus', timeRemaining: 0, initialDuration: 0, cycles: 0 });
    setIsFocusModalOpen(false);
  };
  const openFocusModal = () => setIsFocusModalOpen(true);
  const closeFocusModal = () => setIsFocusModalOpen(false);
  const toggleFocusSessionActive = () => setFocusSession(prev => ({...prev, isActive: !prev.isActive }));
  const changeFocusMode = (mode: SessionMode) => {
    setFocusSession(prev => {
        const durationMap = {
            focus: focusSettings.focusDuration * 60,
            shortBreak: focusSettings.shortBreakDuration * 60,
            longBreak: focusSettings.longBreakDuration * 60,
        };
        const duration = durationMap[mode];
        return {
            ...prev,
            mode,
            isActive: prev.isActive,
            timeRemaining: duration,
            initialDuration: duration,
        };
    });
  };

  const openShortcutsModal = () => setIsShortcutsModalOpen(true);
  const closeShortcutsModal = () => setIsShortcutsModalOpen(false);

  const updateFocusSettings = useCallback(async (newSettings: Partial<FocusSettings>) => {
    const updatedSettings = { ...focusSettings, ...newSettings };
    setFocusSettings(updatedSettings);
    try {
        await db.putValue('focusSettings', updatedSettings);
        postStateUpdate();
    } catch(e) {
        addToast('Could not save focus settings.', 'error');
    }
  }, [focusSettings, addToast]);


  return (
    <AppContext.Provider value={{
      todos,
      notes,
      unlockedAchievements,
      allAchievements: achievementsList,
      userProfile,
      page,
      setPage,
      filter,
      setFilter,
      searchQuery,
      setSearchQuery,
      isAddTaskModalOpen,
      openAddTaskModal,
      closeAddTaskModal,
      handleAddTodo,
      handleToggleTodo,
      handleDeleteTodo,
      handleEditTodo,
      handleToggleImportant,
      handleSetPriority,
      handleToggleSubtask,
      handleEditSubtask,
      handleAddNote,
      handleUpdateNote,
      handleDeleteNote,
      handleDeleteAllNotes,
      handleSaveProfile,
      handleSummarizeNote,
      handleClearCompletedTodos,
      handleExportData,
      handleImportData,
      handleDeleteAllData,
      filteredTodos,
      pageTitle,
      sortOrder,
      setSortOrder,
      confirmationState,
      hideConfirmation,
      isLoading,
      toasts,
      addToast,
      removeToast,
      lightboxImageUrl,
      openLightbox,
      closeLightbox,
      handleTagClick,
      activeTag,
      clearActiveTag,
      handlePinNote,
      notesSearchQuery,
      setNotesSearchQuery,
      notesSortOrder,
      setNotesSortOrder,
      filteredNotes,
      notificationPermission,
      requestNotificationPermission,
      theme,
      setTheme,
      accent,
      setAccent,
      tagColors,
      dayDetail,
      openDayDetailModal,
      closeDayDetailModal,
      selectedNoteId,
      setSelectedNoteId,
      activeFocusTodo,
      isFocusModalOpen,
      focusSession,
      startFocusSession,
      stopFocusSession,
      openFocusModal,
      closeFocusModal,
      toggleFocusSessionActive,
      changeFocusMode,
      isShortcutsModalOpen,
      openShortcutsModal,
      closeShortcutsModal,
      focusSettings,
      updateFocusSettings,
    }}>
      {children}
    </AppContext.Provider>
  );
};