
import React, { createContext, useState, useEffect, useMemo, useCallback, ReactNode, useRef } from 'react';
import { type Todo, type UserProfile, type Note, type Subtask, type Toast, type UnlockedAchievement, type Achievement, RecurrenceType, Page, TagColorMap, Priority } from '@/types';
import * as db from '@/services/db';
import { achievementsList, checkAchievementConditions, type AchievementStats } from '@/constants/achievements';
import { parseTextForDueDate, parseTextForTags } from '@/utils/textParser';

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

// Fix: Define a specific type for ambient sounds to ensure type safety.
export type AmbientSound = 'none' | 'rain' | 'cafe' | 'forest';

export interface FocusSettings {
    focusDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    autoStart: boolean;
    sound: AmbientSound;
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

// Fix: Define and export AppContextType interface.
export interface AppContextType {
  // Todos
  isLoading: boolean;
  todos: Todo[];
  filteredTodos: Todo[];
  filter: string;
  setFilter: (filter: string) => void;
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTag: string | null;
  setActiveTag: (tag: string | null) => void;
  handleTagClick: (tag: string) => void;
  clearActiveTag: () => void;
  tagColors: TagColorMap;
  handleAddTodo: (todoData: { text: string; imageUrl: string | null; dueDate: string | null; priority: Priority; subtasks: string[], tags: string[], recurrenceRule: { type: RecurrenceType } | null, reminderOffset: number | null }) => void;
  handleToggleTodo: (id: string) => void;
  handleDeleteTodo: (id: string) => void;
  handleEditTodo: (id: string, newText: string) => void;
  handleToggleImportant: (id: string) => void;
  handleToggleSubtask: (todoId: string, subtaskId: string) => void;
  handleEditSubtask: (todoId: string, subtaskId: string, newText: string) => void;
  handleSetPriority: (id: string, priority: Priority) => void;
  handleClearCompletedTodos: () => void;

  // Notes
  notes: Note[];
  filteredNotes: Note[];
  notesSearchQuery: string;
  setNotesSearchQuery: (query: string) => void;
  notesSortOrder: NotesSortOrder;
  setNotesSortOrder: (order: NotesSortOrder) => void;
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;
  handleAddNote: (noteData: { title: string, content: string }) => Promise<string>;
  handleUpdateNote: (note: Note) => void;
  handleDeleteNote: (id: string) => void;
  handlePinNote: (id: string) => void;
  handleDeleteAllNotes: () => void;

  // User Profile
  userProfile: UserProfile;
  handleSaveProfile: (profile: UserProfile) => void;

  // Navigation
  page: Page;
  setPage: (page: Page) => void;
  pageTitle: string;

  // Modals
  isAddTaskModalOpen: boolean;
  openAddTaskModal: () => void;
  closeAddTaskModal: () => void;
  confirmationState: { isOpen: boolean; title: string; message: string; onConfirm: () => void; };
  showConfirmation: (title: string, message: string, onConfirm: () => void) => void;
  hideConfirmation: () => void;
  lightboxImageUrl: string | null;
  openLightbox: (url: string) => void;
  closeLightbox: () => void;
  dayDetail: { date: Date, tasks: Todo[], notes: Note[] } | null;
  openDayDetailModal: (date: Date, tasks: Todo[], notes: Note[]) => void;
  closeDayDetailModal: () => void;
  isFocusModalOpen: boolean;
  openFocusModal: () => void;
  closeFocusModal: () => void;
  isShortcutsModalOpen: boolean;
  openShortcutsModal: () => void;
  closeShortcutsModal: () => void;
  
  // Toasts
  toasts: Toast[];
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Achievements
  allAchievements: Achievement[];
  unlockedAchievements: UnlockedAchievement[];

  // Notifications
  notificationPermission: NotificationPermission;
  requestNotificationPermission: () => void;

  // Settings
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  accent: string;
  setAccent: (accent: string) => void;
  handleExportData: () => void;
  handleImportData: (file: File) => void;
  handleDeleteAllData: () => void;

  // Focus Mode
  focusSettings: FocusSettings;
  updateFocusSettings: (settings: Partial<FocusSettings>) => void;
  focusSession: FocusSessionState;
  activeFocusTodo: Todo | null;
  startFocusSession: (todoId: string) => void;
  changeFocusMode: (mode: SessionMode) => void;
  toggleFocusSessionActive: () => void;
  stopFocusSession: () => void;
}

// Fix: Create and export AppContext
export const AppContext = createContext<AppContextType | null>(null);

const defaultUserProfile: UserProfile = {
  name: 'Guest',
  username: '@guest',
  bio: 'A journey of a thousand miles begins with a single step.',
  avatarUrl: null,
  bannerUrl: null,
  verificationType: 'none',
  organization: undefined,
  organizationAvatarUrl: undefined
};

const defaultFocusSettings: FocusSettings = {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    autoStart: true,
    sound: 'none',
    volume: 0.5,
};

const defaultFocusSession: FocusSessionState = {
    todoId: null,
    isActive: false,
    mode: 'focus',
    timeRemaining: defaultFocusSettings.focusDuration * 60,
    initialDuration: defaultFocusSettings.focusDuration * 60,
    cycles: 0,
};

// Fix: Define NOTIFICATION_SOUND to resolve reference error.
const NOTIFICATION_SOUND = 'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA/AGoAagA+AEkASgBCAEsASgBEAEsASwBCAEsASgBBAEsASQBCAEoASgBCAEsASwBCAEsA';

// Fix: Create and export AppProvider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // State variables
    const [isLoading, setIsLoading] = useState(true);
    const [todos, setTodos] = useState<Todo[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile>(defaultUserProfile);
    const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>([]);
    const [page, setPage] = useState<Page>('home');
    const [filter, setFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [tagColors, setTagColors] = useState<TagColorMap>({});
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [confirmationState, setConfirmationState] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [dayDetail, setDayDetail] = useState<{ date: Date, tasks: Todo[], notes: Note[] } | null>(null);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(Notification.permission);
    const [theme, rawSetTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'dark');
    const [accent, rawSetAccent] = useState<string>(() => localStorage.getItem('accent') || 'sky');
    const [focusSettings, setFocusSettings] = useState<FocusSettings>(defaultFocusSettings);
    const [focusSession, setFocusSession] = useState<FocusSessionState>(defaultFocusSession);
    const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
    const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
    const [notesSearchQuery, setNotesSearchQuery] = useState('');
    const [notesSortOrder, setNotesSortOrder] = useState<NotesSortOrder>('updatedAt');
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

    const timerRef = useRef<number | null>(null);

    // Initial Data Loading
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [loadedTodos, loadedNotes, loadedProfile, loadedAchievements, loadedTagColors, loadedTheme, loadedAccent, loadedFocusSettings] = await Promise.all([
                    db.getTodos(),
                    db.getNotes(),
                    db.getUserProfile(),
                    db.getUnlockedAchievements(),
                    db.getValue('tagColors').then(v => v?.value || {}),
                    db.getValue('theme').then(v => v?.value || 'dark'),
                    db.getValue('accent').then(v => v?.value || 'sky'),
                    // Fix: Ensure loaded focus settings are always a valid object, merging with defaults.
                    // This prevents the state from becoming corrupted with non-object types from the database,
                    // which could lead to errors when spreading the settings object later on.
                    db.getValue('focusSettings').then(v => ({ ...defaultFocusSettings, ...(v?.value || {})}))
                ]);
                setTodos(loadedTodos);
                setNotes(loadedNotes);
                setUserProfile(loadedProfile || defaultUserProfile);
                setUnlockedAchievements(loadedAchievements);
                setTagColors(loadedTagColors);
                rawSetTheme(loadedTheme);
                rawSetAccent(loadedAccent);
                setFocusSettings(loadedFocusSettings);
            } catch (error) {
                console.error("Failed to load data from DB:", error);
                addToast('Could not load your data.', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    // Derived State: pageTitle
    const pageTitle = useMemo(() => {
        switch(page) {
            case 'home': return 'Home';
            case 'profile': return 'Profile';
            case 'notes': return 'Notes';
            case 'achievements': return 'Achievements';
            case 'settings': return 'Settings';
            case 'calendar': return 'Calendar';
            default: return 'X To-Do';
        }
    }, [page]);
    
    // Toast notifications
    const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = crypto.randomUUID();
        setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    }, []);
    const removeToast = useCallback((id: string) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, []);

    // Achievements
    const allAchievements = achievementsList;
    const checkForAchievements = useCallback((stats: AchievementStats) => {
        const newlyUnlocked = checkAchievementConditions(stats, unlockedAchievements);
        if (newlyUnlocked.length > 0) {
            const newAchievements = newlyUnlocked.map(ach => ({ achievementId: ach.id, unlockedAt: new Date().toISOString() }));
            newAchievements.forEach(ach => {
                db.putUnlockedAchievement(ach);
                addToast(`Achievement Unlocked: ${achievementsList.find(a => a.id === ach.achievementId)?.title}`, 'success');
            });
            setUnlockedAchievements(prev => [...prev, ...newAchievements]);
        }
    }, [unlockedAchievements, addToast]);


    // Todos logic
    const handleAddTodo = useCallback(async (todoData: { text: string; imageUrl: string | null; dueDate: string | null; priority: Priority; subtasks: string[], tags: string[], recurrenceRule: { type: RecurrenceType } | null, reminderOffset: number | null }) => {
        let { text, tags, dueDate } = { ...todoData };
        
        const tagParseResult = parseTextForTags(text);
        text = tagParseResult.cleanedText;
        tags = [...new Set([...tags, ...tagParseResult.tags])];

        const dateParseResult = parseTextForDueDate(text);
        text = dateParseResult.cleanedText;
        if (dateParseResult.dueDate) {
            dueDate = dateParseResult.dueDate;
        }

        const newTodo: Todo = {
            id: crypto.randomUUID(),
            text,
            imageUrl: todoData.imageUrl,
            dueDate,
            priority: todoData.priority,
            recurrenceRule: todoData.recurrenceRule,
            reminderOffset: todoData.reminderOffset,
            tags,
            subtasks: todoData.subtasks.map(subtaskText => ({ id: crypto.randomUUID(), text: subtaskText, completed: false })),
            completed: false,
            isImportant: false,
            createdAt: new Date().toISOString(),
        };
        
        const newTodos = [...todos, newTodo];
        setTodos(newTodos);
        await db.putTodo(newTodo);
        addToast('Task added!', 'success');
        checkForAchievements({ todos: newTodos, notes });
    }, [todos, notes, addToast, checkForAchievements]);

    const handleToggleTodo = useCallback(async (id: string) => {
        const newTodos = [...todos];
        const todoIndex = newTodos.findIndex(t => t.id === id);
        if (todoIndex === -1) return;

        const originalTodo = newTodos[todoIndex];
        const updatedTodo = { ...originalTodo, completed: !originalTodo.completed, completedAt: !originalTodo.completed ? new Date().toISOString() : undefined };
        newTodos[todoIndex] = updatedTodo;

        // Recurrence logic
        if (updatedTodo.completed && updatedTodo.recurrenceRule) {
            const nextDueDate = new Date(updatedTodo.dueDate + 'T00:00:00'); // Treat as local date
            switch (updatedTodo.recurrenceRule.type) {
                case 'daily': nextDueDate.setDate(nextDueDate.getDate() + 1); break;
                case 'weekly': nextDueDate.setDate(nextDueDate.getDate() + 7); break;
                case 'monthly': nextDueDate.setMonth(nextDueDate.getMonth() + 1); break;
                case 'yearly': nextDueDate.setFullYear(nextDueDate.getFullYear() + 1); break;
            }
            // Create the new recurring task by explicitly copying properties.
            // This is safer and resets state like subtask completion and notification status.
            const newRecurringTodo: Todo = {
                id: crypto.randomUUID(),
                text: originalTodo.text,
                imageUrl: originalTodo.imageUrl,
                tags: originalTodo.tags,
                isImportant: originalTodo.isImportant,
                priority: originalTodo.priority,
                recurrenceRule: originalTodo.recurrenceRule,
                reminderOffset: originalTodo.reminderOffset,
                // Reset state for the new instance
                completed: false,
                completedAt: undefined,
                notified: undefined,
                subtasks: originalTodo.subtasks?.map(st => ({ ...st, completed: false })),
                // Set new dates
                dueDate: nextDueDate.toISOString().split('T')[0],
                createdAt: new Date().toISOString(),
            };
            newTodos.push(newRecurringTodo);
            await db.putTodo(newRecurringTodo);
        }
        
        setTodos(newTodos);
        await db.putTodo(updatedTodo);
        checkForAchievements({ todos: newTodos, notes });
    }, [todos, notes, checkForAchievements]);

    const handleDeleteTodo = useCallback((id: string) => {
        showConfirmation(
            'Delete Task?',
            'This action cannot be undone. The task will be permanently deleted.',
            async () => {
                const newTodos = todos.filter(t => t.id !== id);
                setTodos(newTodos);
                await db.deleteTodo(id);
                addToast('Task deleted.', 'info');
            }
        );
    }, [todos, addToast]);

    const handleEditTodo = useCallback(async (id: string, newText: string) => {
        const newTodos = todos.map(t => t.id === id ? { ...t, text: newText } : t);
        setTodos(newTodos);
        await db.putTodo(newTodos.find(t => t.id === id)!);
    }, [todos]);
    
    const handleToggleImportant = useCallback(async (id: string) => {
        const newTodos = todos.map(t => t.id === id ? { ...t, isImportant: !t.isImportant } : t);
        setTodos(newTodos);
        await db.putTodo(newTodos.find(t => t.id === id)!);
        checkForAchievements({ todos: newTodos, notes });
    }, [todos, notes, checkForAchievements]);

    const handleSetPriority = useCallback(async (id: string, priority: Priority) => {
        const newTodos = todos.map(t => t.id === id ? { ...t, priority } : t);
        setTodos(newTodos);
        await db.putTodo(newTodos.find(t => t.id === id)!);
        addToast(`Priority set to ${priority}`, 'info');
        checkForAchievements({ todos: newTodos, notes });
    }, [todos, notes, addToast, checkForAchievements]);

    const handleToggleSubtask = useCallback(async (todoId: string, subtaskId: string) => {
        const newTodos = [...todos];
        const todo = newTodos.find(t => t.id === todoId);
        if (todo && todo.subtasks) {
            todo.subtasks = todo.subtasks.map(st => st.id === subtaskId ? { ...st, completed: !st.completed } : st);
            setTodos(newTodos);
            await db.putTodo(todo);
        }
    }, [todos]);
    
    const handleEditSubtask = useCallback(async (todoId: string, subtaskId: string, newText: string) => {
        const newTodos = [...todos];
        const todo = newTodos.find(t => t.id === todoId);
        if (todo && todo.subtasks) {
            todo.subtasks = todo.subtasks.map(st => st.id === subtaskId ? { ...st, text: newText } : st);
            setTodos(newTodos);
            await db.putTodo(todo);
        }
    }, [todos]);

    const handleClearCompletedTodos = useCallback(() => {
        showConfirmation(
            'Clear Completed?',
            'This will permanently delete all your completed tasks.',
            async () => {
                const newTodos = todos.filter(t => !t.completed);
                const completedTodos = todos.filter(t => t.completed);
                setTodos(newTodos);
                for (const todo of completedTodos) {
                    await db.deleteTodo(todo.id);
                }
                addToast('Completed tasks cleared.', 'info');
            }
        );
    }, [todos, addToast]);
    
    // Tag management
    const assignColorToTag = useCallback((tagName: string, currentColors: TagColorMap) => {
      const existingTags = Object.keys(currentColors);
      const colorIndex = existingTags.length % TAG_COLORS_PALETTE.length;
      return TAG_COLORS_PALETTE[colorIndex];
    }, []);

    useEffect(() => {
      const allTags = new Set(todos.flatMap(t => t.tags));
      let updated = false;
      const newTagColors = { ...tagColors };
      allTags.forEach(tag => {
        if (!newTagColors[tag]) {
          newTagColors[tag] = assignColorToTag(tag, newTagColors);
          updated = true;
        }
      });
      if (updated) {
        setTagColors(newTagColors);
        db.putValue('tagColors', newTagColors);
      }
    }, [todos, tagColors, assignColorToTag]);

    const handleTagClick = (tag: string) => {
      setActiveTag(tag);
      setPage('home');
      setFilter('all');
    };
  
    const clearActiveTag = () => setActiveTag(null);

    // Filtered & Sorted Todos
    const filteredTodos = useMemo(() => {
        let tempTodos = todos;

        // Filter by tag
        if (activeTag) {
            tempTodos = tempTodos.filter(todo => todo.tags.includes(activeTag));
        }

        // Filter by search query
        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            tempTodos = tempTodos.filter(todo => todo.text.toLowerCase().includes(lowercasedQuery));
        }
        
        // Filter by category
        switch (filter) {
            case 'pending':
                tempTodos = tempTodos.filter(todo => !todo.completed);
                break;
            case 'completed':
                tempTodos = tempTodos.filter(todo => todo.completed);
                break;
            case 'important':
                tempTodos = tempTodos.filter(todo => todo.isImportant);
                break;
            default: // 'all'
                break;
        }

        // Sort
        return tempTodos.sort((a, b) => {
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
                    const priorityMap: Record<Priority, number> = { high: 0, medium: 1, low: 2, none: 3 };
                    return priorityMap[a.priority] - priorityMap[b.priority];
                }
                case 'newest':
                default:
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });
    }, [todos, filter, sortOrder, searchQuery, activeTag]);


    // Notes logic
    const handleAddNote = useCallback(async (noteData: { title: string, content: string }): Promise<string> => {
        const newNote: Note = {
            id: crypto.randomUUID(),
            title: noteData.title,
            content: noteData.content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isPinned: false
        };
        const newNotes = [newNote, ...notes];
        setNotes(newNotes);
        await db.putNote(newNote);
        addToast('Note created!', 'success');
        checkForAchievements({ todos, notes: newNotes });
        return newNote.id;
    }, [notes, todos, addToast, checkForAchievements]);

    const handleUpdateNote = useCallback(async (updatedNote: Note) => {
        const newNotes = notes.map(n => n.id === updatedNote.id ? { ...updatedNote, updatedAt: new Date().toISOString() } : n);
        setNotes(newNotes);
        await db.putNote({ ...updatedNote, updatedAt: new Date().toISOString() });
    }, [notes]);
    
    const handleDeleteNote = useCallback((id: string) => {
        showConfirmation(
            'Delete Note?',
            'Are you sure you want to permanently delete this note?',
            async () => {
                const newNotes = notes.filter(n => n.id !== id);
                setNotes(newNotes);
                await db.deleteNote(id);
                addToast('Note deleted.', 'info');
            }
        );
    }, [notes, addToast]);

    const handleDeleteAllNotes = useCallback(() => {
        showConfirmation(
            'Delete All Notes?',
            'This will permanently delete all your notes. This action cannot be undone.',
            async () => {
                setNotes([]);
                await db.clearNotes();
                addToast('All notes have been deleted.', 'info');
            }
        );
    }, [addToast]);
    
    const handlePinNote = useCallback(async (id: string) => {
        const newNotes = notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n);
        setNotes(newNotes);
        const noteToUpdate = newNotes.find(n => n.id === id);
        if (noteToUpdate) {
          await db.putNote(noteToUpdate);
          addToast(noteToUpdate.isPinned ? 'Note pinned' : 'Note unpinned', 'info');
        }
    }, [notes, addToast]);
    
    const filteredNotes = useMemo(() => {
        let tempNotes = [...notes];
        // Search
        if (notesSearchQuery) {
            const lowerQuery = notesSearchQuery.toLowerCase();
            tempNotes = tempNotes.filter(note =>
                note.title.toLowerCase().includes(lowerQuery) || note.content.toLowerCase().includes(lowerQuery)
            );
        }
        // Sort
        tempNotes.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;

            switch (notesSortOrder) {
                case 'createdAt':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'alphabetical':
                    return a.title.localeCompare(b.title);
                case 'updatedAt':
                default:
                    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            }
        });
        return tempNotes;
    }, [notes, notesSearchQuery, notesSortOrder]);

    // Profile logic
    const handleSaveProfile = useCallback(async (newProfile: UserProfile) => {
        const oldUserProfile = { ...userProfile };
        setUserProfile(newProfile);
        await db.saveUserProfile(newProfile);
        addToast('Profile updated!', 'success');
        checkForAchievements({ todos, notes, userProfile: newProfile, oldUserProfile });
    }, [userProfile, todos, notes, addToast, checkForAchievements]);

    // Modal Handlers
    const openAddTaskModal = useCallback(() => setIsAddTaskModalOpen(true), []);
    const closeAddTaskModal = useCallback(() => setIsAddTaskModalOpen(false), []);
    const showConfirmation = useCallback((title: string, message: string, onConfirm: () => void) => {
        setConfirmationState({ isOpen: true, title, message, onConfirm });
    }, []);
    const hideConfirmation = useCallback(() => setConfirmationState({ isOpen: false, title: '', message: '', onConfirm: () => {} }), []);
    const openLightbox = useCallback((url: string) => setLightboxImageUrl(url), []);
    const closeLightbox = useCallback(() => setLightboxImageUrl(null), []);
    const openDayDetailModal = useCallback((date: Date, tasks: Todo[], notes: Note[]) => setDayDetail({ date, tasks, notes }), []);
    const closeDayDetailModal = useCallback(() => setDayDetail(null), []);
    const openFocusModal = useCallback(() => setIsFocusModalOpen(true), []);
    const closeFocusModal = useCallback(() => setIsFocusModalOpen(false), []);
    const openShortcutsModal = useCallback(() => setIsShortcutsModalOpen(true), []);
    const closeShortcutsModal = useCallback(() => setIsShortcutsModalOpen(false), []);

    // Notifications
    const requestNotificationPermission = useCallback(() => {
        Notification.requestPermission().then(permission => {
            setNotificationPermission(permission);
            if (permission === 'granted') {
                addToast('Notifications enabled!', 'success');
            } else if (permission === 'denied') {
                addToast('Notifications have been blocked.', 'error');
            }
        });
    }, [addToast]);

    useEffect(() => {
        const checkReminders = () => {
            if (notificationPermission !== 'granted') return;

            const now = new Date();
            const todosToUpdate: Todo[] = [];

            todos.forEach(todo => {
                if (!todo.completed && todo.dueDate && todo.reminderOffset !== null && !todo.notified) {
                    const dueDate = new Date(`${todo.dueDate}T23:59:59`);
                    const reminderTime = new Date(dueDate.getTime() - todo.reminderOffset * 60000);
                    
                    const oneDayAfterDueDate = new Date(dueDate.getTime() + 24 * 60 * 60 * 1000);
                    if (now >= reminderTime && now < oneDayAfterDueDate) {
                        new Notification('Task Reminder', { 
                            body: todo.text,
                            icon: '/favicon.svg'
                        });
                        todosToUpdate.push({ ...todo, notified: true });
                    }
                }
            });

            if (todosToUpdate.length > 0) {
                const todosToUpdateMap = new Map(todosToUpdate.map(t => [t.id, t]));
                setTodos(prevTodos => 
                    prevTodos.map(t => todosToUpdateMap.get(t.id) || t)
                );
                todosToUpdate.forEach(t => db.putTodo(t));
            }
        };
        
        const interval = setInterval(checkReminders, 30000); // Check every 30 seconds
        
        return () => clearInterval(interval);
    }, [todos, notificationPermission]);

    // Theme & Accent
    const setTheme = useCallback((themeName: 'light' | 'dark') => {
        rawSetTheme(themeName);
        db.putValue('theme', themeName);
    }, []);

    const setAccent = useCallback((accentName: string) => {
        const oldAccent = accent;
        rawSetAccent(accentName);
        db.putValue('accent', accentName);
        checkForAchievements({ todos, notes, userProfile, accent: accentName, oldAccent });
    }, [accent, todos, notes, userProfile, checkForAchievements]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    useEffect(() => {
        document.documentElement.setAttribute('data-accent', accent);
    }, [accent]);

    // Data Management
    const handleExportData = useCallback(async () => {
        try {
            const data = {
                todos: await db.getTodos(),
                notes: await db.getNotes(),
                userProfile: await db.getUserProfile(),
                unlockedAchievements: await db.getUnlockedAchievements(),
                tagColors: (await db.getValue('tagColors'))?.value || {},
            };
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `x-todo-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            addToast('Data exported successfully!', 'success');
        } catch (error) {
            console.error('Failed to export data:', error);
            addToast('Failed to export data.', 'error');
        }
    }, [addToast]);

    const handleImportData = useCallback((file: File) => {
        showConfirmation(
            'Import Data?',
            'This will overwrite all current data in the app. This action cannot be undone. Are you sure you want to continue?',
            () => {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const data = JSON.parse(e.target?.result as string);
                        await db.clearAllData();
                        if (data.todos) for (const todo of data.todos) await db.putTodo(todo);
                        if (data.notes) for (const note of data.notes) await db.putNote(note);
                        if (data.userProfile) await db.saveUserProfile(data.userProfile);
                        if (data.unlockedAchievements) for (const ach of data.unlockedAchievements) await db.putUnlockedAchievement(ach);
                        if (data.tagColors) await db.putValue('tagColors', data.tagColors);
                        
                        setTodos(data.todos || []);
                        setNotes(data.notes || []);
                        setUserProfile(data.userProfile || defaultUserProfile);
                        setUnlockedAchievements(data.unlockedAchievements || []);
                        setTagColors(data.tagColors || {});

                        addToast('Data imported successfully!', 'success');
                    } catch (error) {
                        console.error('Failed to import data:', error);
                        addToast('Failed to import data. The file might be corrupted.', 'error');
                    }
                };
                reader.readAsText(file);
            }
        );
    }, [addToast]);

    const handleDeleteAllData = useCallback(() => {
        showConfirmation(
            'Delete All Data?',
            'This is irreversible and will delete all your tasks, notes, profile, and achievements. Are you absolutely sure?',
            async () => {
                await db.clearAllData();
                setTodos([]);
                setNotes([]);
                setUserProfile(defaultUserProfile);
                setUnlockedAchievements([]);
                setTagColors({});
                addToast('All data has been deleted.', 'info');
            }
        );
    }, [addToast]);

    // Focus Session Logic
    const activeFocusTodo = useMemo(() => {
        if (!focusSession.todoId) return null;
        return todos.find(t => t.id === focusSession.todoId) || null;
    }, [focusSession.todoId, todos]);

    const updateFocusSettings = useCallback(async (settings: Partial<FocusSettings>) => {
        const newSettings = { ...focusSettings, ...settings };
        setFocusSettings(newSettings);
        await db.putValue('focusSettings', newSettings);
    }, [focusSettings]);

    const changeFocusMode = useCallback((mode: SessionMode) => {
        const durationMap = {
            focus: focusSettings.focusDuration,
            shortBreak: focusSettings.shortBreakDuration,
            longBreak: focusSettings.longBreakDuration,
        };
        const newDuration = durationMap[mode] * 60;
        setFocusSession(prev => ({
            ...prev,
            mode,
            timeRemaining: newDuration,
            initialDuration: newDuration,
            isActive: focusSettings.autoStart,
        }));
    }, [focusSettings]);

    const startFocusSession = useCallback((todoId: string) => {
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
    }, [focusSettings.focusDuration]);

    const toggleFocusSessionActive = useCallback(() => {
        setFocusSession(prev => ({ ...prev, isActive: !prev.isActive }));
    }, []);

    const stopFocusSession = useCallback(() => {
        setFocusSession(defaultFocusSession);
        setIsFocusModalOpen(false);
    }, []);

    const playNotificationSound = useCallback(() => {
        const audio = new Audio(NOTIFICATION_SOUND);
        audio.volume = focusSettings.volume;
        audio.play();
    }, [focusSettings.volume]);
    
    // Timer effect for Focus Mode
    useEffect(() => {
        if (focusSession.isActive && focusSession.timeRemaining > 0) {
            timerRef.current = window.setInterval(() => {
                setFocusSession(prev => ({ ...prev, timeRemaining: prev.timeRemaining - 1 }));
            }, 1000);
        } else if (focusSession.isActive && focusSession.timeRemaining <= 0) {
            // Timer finished
            playNotificationSound();
            if (notificationPermission === 'granted') {
                new Notification('Focus Timer', { body: `${focusSession.mode} session complete!` });
            }
            if (focusSession.mode === 'focus') {
                const newCycles = focusSession.cycles + 1;
                const nextMode = newCycles % 4 === 0 ? 'longBreak' : 'shortBreak';
                setFocusSession(prev => ({ ...prev, cycles: newCycles }));
                changeFocusMode(nextMode);
            } else {
                changeFocusMode('focus');
            }
        }
        
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [focusSession.isActive, focusSession.timeRemaining, focusSession.mode, focusSession.cycles, changeFocusMode, notificationPermission, playNotificationSound]);

    const contextValue = useMemo(() => ({
        isLoading,
        todos,
        filteredTodos,
        filter,
        setFilter,
        sortOrder,
        setSortOrder,
        searchQuery,
        setSearchQuery,
        activeTag,
        setActiveTag,
        handleTagClick,
        clearActiveTag,
        tagColors,
        handleAddTodo,
        handleToggleTodo,
        handleDeleteTodo,
        handleEditTodo,
        handleToggleImportant,
        handleToggleSubtask,
        handleEditSubtask,
        handleSetPriority,
        handleClearCompletedTodos,
        notes,
        filteredNotes,
        notesSearchQuery,
        setNotesSearchQuery,
        notesSortOrder,
        setNotesSortOrder,
        selectedNoteId,
        setSelectedNoteId,
        handleAddNote,
        handleUpdateNote,
        handleDeleteNote,
        handlePinNote,
        handleDeleteAllNotes,
        userProfile,
        handleSaveProfile,
        page,
        setPage,
        pageTitle,
        isAddTaskModalOpen,
        openAddTaskModal,
        closeAddTaskModal,
        confirmationState,
        showConfirmation,
        hideConfirmation,
        lightboxImageUrl,
        openLightbox,
        closeLightbox,
        toasts,
        addToast,
        removeToast,
        dayDetail,
        openDayDetailModal,
        closeDayDetailModal,
        allAchievements,
        unlockedAchievements,
        notificationPermission,
        requestNotificationPermission,
        theme,
        setTheme,
        accent,
        setAccent,
        handleExportData,
        handleImportData,
        handleDeleteAllData,
        isFocusModalOpen,
        openFocusModal,
        closeFocusModal,
        activeFocusTodo,
        focusSettings,
        updateFocusSettings,
        focusSession,
        startFocusSession,
        changeFocusMode,
        toggleFocusSessionActive,
        stopFocusSession,
        isShortcutsModalOpen,
        openShortcutsModal,
        closeShortcutsModal,
    }), [
        isLoading, todos, filteredTodos, filter, sortOrder, searchQuery, activeTag, tagColors, 
        handleAddTodo, handleToggleTodo, handleDeleteTodo, handleEditTodo, handleToggleImportant, handleToggleSubtask, handleEditSubtask, handleSetPriority, handleClearCompletedTodos,
        notes, filteredNotes, notesSearchQuery, notesSortOrder, selectedNoteId,
        handleAddNote, handleUpdateNote, handleDeleteNote, handlePinNote, handleDeleteAllNotes,
        userProfile, handleSaveProfile, page, pageTitle, isAddTaskModalOpen, openAddTaskModal, closeAddTaskModal,
        confirmationState, showConfirmation, hideConfirmation, lightboxImageUrl, openLightbox, closeLightbox,
        toasts, addToast, removeToast, dayDetail, openDayDetailModal, closeDayDetailModal, allAchievements, unlockedAchievements,
        notificationPermission, requestNotificationPermission, theme, setTheme, accent, setAccent,
        handleExportData, handleImportData, handleDeleteAllData,
        isFocusModalOpen, openFocusModal, closeFocusModal, activeFocusTodo, focusSettings, updateFocusSettings,
        focusSession, startFocusSession, changeFocusMode, toggleFocusSessionActive, stopFocusSession,
        isShortcutsModalOpen, openShortcutsModal, closeShortcutsModal, setFilter, setSortOrder, setSearchQuery, setActiveTag, handleTagClick, clearActiveTag,
        setNotesSearchQuery, setNotesSortOrder, setSelectedNoteId, setPage
    ]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};
