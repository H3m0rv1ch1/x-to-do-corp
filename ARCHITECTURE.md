# Architecture Documentation

## 📐 Project Architecture

X To-Do Corp follows a modern, scalable architecture designed for maintainability and developer experience.

## 🏗️ Folder Structure

```
x-to-do-corp/
├── .github/                    # GitHub configuration
│   └── ISSUE_TEMPLATE/        # Issue templates
├── src/                        # Source code
│   ├── components/            # React components
│   │   ├── calendar/         # Calendar & contribution graph
│   │   ├── layout/           # Layout components (Header, Sidebars)
│   │   ├── modals/           # Modal dialogs
│   │   ├── notes/            # Notes feature
│   │   ├── profile/          # Profile & achievements
│   │   ├── settings/         # Settings UI
│   │   ├── todo/             # Task management
│   │   └── ui/               # Reusable UI components
│   ├── contexts/             # React Context providers
│   ├── hooks/                # Custom React hooks
│   ├── services/             # External services (DB, API)
│   ├── types/                # TypeScript definitions
│   ├── utils/                # Utility functions
│   ├── constants/            # App constants
│   ├── assets/               # Static assets
│   ├── App.tsx               # Root component
│   └── index.tsx             # Entry point
├── public/                    # Public assets
├── index.html                 # HTML template
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── vite.config.ts            # Vite config
└── README.md                 # Documentation
```

## 🧩 Component Organization

### Barrel Exports
Each component folder includes an `index.ts` file for clean imports:

```typescript
// ✅ Clean import
import { TodoItem, TodoList } from '@/components/todo';

// ❌ Avoid
import TodoItem from '@/components/todo/TodoItem';
```

### Component Categories

#### Layout Components (`components/layout/`)
Core structural components used across the application:
- `Header` - Top navigation bar
- `LeftSidebar` - Main navigation sidebar
- `RightSidebar` - Secondary content sidebar
- `BottomNavbar` - Mobile navigation
- `Footer` - Footer content

#### Feature Components
Organized by feature domain:
- `todo/` - Task management
- `notes/` - Note-taking
- `calendar/` - Calendar views
- `profile/` - User profile & achievements
- `settings/` - Application settings

#### UI Components (`components/ui/`)
Reusable, generic components:
- `Avatar` - User avatar display
- `Tooltip` - Hover tooltips
- `DatePicker` - Date selection
- `PriorityPicker` - Priority selection
- `Toast` - Notification toasts

#### Modal Components (`components/modals/`)
All modal dialogs:
- `AddTaskModal` - Task creation
- `FocusModeModal` - Focus timer
- `EditProfileModal` - Profile editing
- `ConfirmationModal` - Confirmations
- `ImageLightbox` - Image viewer

## 🔄 Data Flow

### State Management
```
User Action
    ↓
Component Event Handler
    ↓
Context Action (useAppContext)
    ↓
State Update
    ↓
Database Persistence (Dexie)
    ↓
UI Re-render
```

### Context Architecture
```typescript
AppContext
├── State
│   ├── todos: Todo[]
│   ├── notes: Note[]
│   ├── userProfile: UserProfile
│   ├── achievements: Achievement[]
│   └── UI state (modals, toasts, etc.)
├── Actions
│   ├── handleAddTodo()
│   ├── handleDeleteTodo()
│   ├── handleAddNote()
│   └── ...
└── Computed Values
    ├── filteredTodos
    ├── sortedNotes
    └── achievementStats
```

## 💾 Data Persistence

### IndexedDB (via Dexie.js)
```
Database: x-todo-corp-db
├── todos          # Task storage
├── notes          # Note storage
├── userProfile    # User data
└── achievements   # Achievement progress
```

### LocalStorage
```
localStorage
├── theme          # 'light' | 'dark'
├── accent         # Color preference
└── preferences    # Other settings
```

## 🎣 Custom Hooks

### `useAppContext`
Access global application state and actions.

```typescript
const {
  todos,
  handleAddTodo,
  handleDeleteTodo,
  // ... other state and actions
} = useAppContext();
```

### `useClickOutside`
Detect clicks outside an element (for dropdowns, modals).

```typescript
const ref = useRef<HTMLDivElement>(null);
useClickOutside(ref, () => setIsOpen(false));
```

### `useDebounce`
Debounce rapidly changing values (for search inputs).

```typescript
const debouncedSearch = useDebounce(searchQuery, 300);
```

## 🎨 Styling Architecture

### CSS Variables
Theme colors defined as CSS custom properties:

```css
:root {
  --background-primary-rgb: 0 0 0;
  --foreground-primary-rgb: 231 233 234;
  --accent-rgb: 14 165 233;
  /* ... */
}

[data-theme='light'] {
  --background-primary-rgb: 255 255 255;
  --foreground-primary-rgb: 15 20 25;
  /* ... */
}
```

### Tailwind Usage
```typescript
// Using CSS variables with Tailwind
className="bg-[rgba(var(--background-primary-rgb))]"
className="text-[rgba(var(--foreground-primary-rgb))]"
```

## 🔐 Type Safety

### Type Definitions (`types/index.ts`)
```typescript
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  dueDate: string | null;
  // ...
}

export type Priority = 'none' | 'low' | 'medium' | 'high';
export type Page = 'home' | 'notes' | 'calendar' | 'profile' | 'settings' | 'achievements';
```

## 🚀 Build & Deployment

### Development
```bash
npm run dev          # Start dev server
npm run type-check   # Check TypeScript
```

### Production
```bash
npm run build        # Build for production
npm run preview      # Preview production build
```

### Build Output
```
dist/
├── assets/          # Bundled JS/CSS
├── index.html       # Entry HTML
└── ...
```

## 🧪 Testing Strategy

### Manual Testing Checklist
- [ ] All CRUD operations work
- [ ] Theme switching works
- [ ] Responsive on mobile/tablet/desktop
- [ ] Keyboard shortcuts function
- [ ] Data persists after refresh
- [ ] Export/Import works correctly

## 📊 Performance Considerations

### Optimization Techniques
1. **Memoization** - `useMemo` for expensive computations
2. **Lazy Loading** - Code splitting for routes
3. **Virtual Scrolling** - For large lists (future)
4. **Debouncing** - Search inputs
5. **IndexedDB** - Efficient local storage

### Bundle Size
- Target: < 500KB gzipped
- Tree-shaking enabled
- Dynamic imports for modals

## 🔮 Future Architecture Plans

### Planned Improvements
1. **State Management** - Consider Zustand/Jotai for better performance
2. **Testing** - Add Vitest + React Testing Library
3. **API Layer** - Abstract database operations
4. **Error Boundaries** - Better error handling
5. **Service Workers** - Full PWA support
6. **Code Splitting** - Route-based splitting

---

For questions about architecture decisions, please open a discussion on GitHub.
