
import { type Todo, type Note, type Achievement, type UnlockedAchievement, type UserProfile } from '@/types';
import { HiPencil, HiCheck, HiDocumentText, HiStar, HiPhotograph, HiCalendar, HiFire, HiCheckCircle, HiExclamation, HiFlag, HiHashtag, HiUser } from 'react-icons/hi';
import { HiTrophy } from 'react-icons/hi2';
import { FaRepeat, FaPaintbrush } from 'react-icons/fa6';
import { BiSubdirectoryRight } from 'react-icons/bi';

export type AchievementStats = {
  todos: Todo[];
  notes: Note[];
  userProfile?: UserProfile;
  oldUserProfile?: UserProfile;
  accent?: string;
  oldAccent?: string;
};

export const achievementsList: Achievement[] = [
  // Task Management
  {
    id: 'first_task',
    title: 'Task Initiator',
    description: 'You created your first task. The journey begins!',
    icon: HiPencil,
    category: 'Task Management',
    tier: 'Bronze',
    progress: ({ todos }) => ({ current: todos.length, target: 1 }),
  },
  {
    id: 'ten_tasks',
    title: 'Task Manager',
    description: 'You\'ve created 10 tasks. Getting organized!',
    icon: HiPencil,
    category: 'Task Management',
    tier: 'Silver',
    progress: ({ todos }) => ({ current: todos.length, target: 10 }),
  },
   {
    id: 'fifty_tasks',
    title: 'Task Master',
    description: '50 tasks created. You mean business.',
    icon: HiPencil,
    category: 'Task Management',
    tier: 'Gold',
    progress: ({ todos }) => ({ current: todos.length, target: 50 }),
  },
  {
    id: 'hundred_tasks',
    title: 'Task Legend',
    description: 'A whopping 100 tasks created. Truly legendary!',
    icon: HiPencil,
    category: 'Task Management',
    tier: 'Gold',
    progress: ({ todos }) => ({ current: todos.length, target: 100 }),
  },
  // Task Completion
  {
    id: 'first_completed',
    title: 'Getting Things Done',
    description: 'Completed your first task. Feels good, right?',
    icon: HiCheck,
    category: 'Task Completion',
    tier: 'Bronze',
    progress: ({ todos }) => ({ current: todos.filter(t => t.completed).length, target: 1 }),
  },
  {
    id: 'ten_completed',
    title: 'Productivity Pro',
    description: 'You\'ve completed 10 tasks. Keep it going!',
    icon: HiCheck,
    category: 'Task Completion',
    tier: 'Silver',
    progress: ({ todos }) => ({ current: todos.filter(t => t.completed).length, target: 10 }),
  },
  {
    id: 'fifty_completed',
    title: 'Unstoppable',
    description: '50 tasks completed. You are a force of nature!',
    icon: HiCheck,
    category: 'Task Completion',
    tier: 'Gold',
    progress: ({ todos }) => ({ current: todos.filter(t => t.completed).length, target: 50 }),
  },
  {
    id: 'hundred_completed',
    title: 'Task Annihilator',
    description: 'You have obliterated 100 tasks. Incredible!',
    icon: HiCheck,
    category: 'Task Completion',
    tier: 'Gold',
    progress: ({ todos }) => ({ current: todos.filter(t => t.completed).length, target: 100 }),
  },
  {
    id: 'on_the_dot',
    title: 'On The Dot',
    description: 'Completed a task on its exact due date.',
    icon: HiCheckCircle,
    category: 'Task Completion',
    tier: 'Silver',
  },
  {
    id: 'overdue_crusher',
    title: 'Overdue Crusher',
    description: 'Better late than never. Completed an overdue task.',
    icon: HiExclamation,
    category: 'Task Completion',
    tier: 'Bronze',
  },
  {
    id: 'daily_dominator',
    title: 'Daily Dominator',
    description: 'Completed all scheduled tasks for a single day.',
    icon: HiTrophy,
    category: 'Task Completion',
    tier: 'Silver',
  },
  // Productivity Streaks
  {
    id: 'perfect_week',
    title: 'Perfect Week',
    description: 'Completed a task every day for 7 consecutive days.',
    icon: HiFire,
    category: 'Productivity Streaks',
    tier: 'Gold',
  },
  {
    id: 'perfect_month',
    title: 'Perfect Month',
    description: 'Completed a task every day for 30 consecutive days.',
    icon: HiFire,
    category: 'Productivity Streaks',
    tier: 'Gold',
  },
  // Note Taking
  {
    id: 'note_taker',
    title: 'Note Taker',
    description: 'Created your first note.',
    icon: HiDocumentText,
    category: 'Note Taking',
    tier: 'Bronze',
    progress: ({ notes }) => ({ current: notes.length, target: 1 }),
  },
  {
    id: 'librarian',
    title: 'Librarian',
    description: 'Created 10 notes. Your knowledge base is growing.',
    icon: HiDocumentText,
    category: 'Note Taking',
    tier: 'Silver',
    progress: ({ notes }) => ({ current: notes.length, target: 10 }),
  },
  {
    id: 'scholar',
    title: 'Scholar',
    description: 'Amassed a collection of 25 notes.',
    icon: HiDocumentText,
    category: 'Note Taking',
    tier: 'Gold',
    progress: ({ notes }) => ({ current: notes.length, target: 25 }),
  },
  // Feature Explorer
  {
    id: 'important_mission',
    title: 'Important Mission',
    description: 'Marked a task as important.',
    icon: HiStar,
    category: 'Feature Explorer',
    tier: 'Bronze',
    progress: ({ todos }) => ({ current: todos.filter(t => t.isImportant).length, target: 1 }),
  },
  {
    id: 'priority_one',
    title: 'Priority One',
    description: 'Set a task to high priority.',
    icon: HiFlag,
    category: 'Feature Explorer',
    tier: 'Bronze',
    progress: ({ todos }) => ({ current: todos.filter(t => t.priority === 'high').length, target: 1 }),
  },
  {
    id: 'sub_zero',
    title: 'Task Decomposer',
    description: 'Added subtasks to a task for the first time.',
    icon: BiSubdirectoryRight,
    category: 'Feature Explorer',
    tier: 'Bronze',
    progress: ({ todos }) => ({ current: todos.filter(t => t.subtasks && t.subtasks.length > 0).length, target: 1 }),
  },
  {
    id: 'picture_perfect',
    title: 'Picture Perfect',
    description: 'Attached an image to a task.',
    icon: HiPhotograph,
    category: 'Feature Explorer',
    tier: 'Bronze',
    progress: ({ todos }) => ({ current: todos.filter(t => t.imageUrl).length, target: 1 }),
  },
  {
    id: 'time_traveler',
    title: 'Time Traveler',
    description: 'Set a due date for a task.',
    icon: HiCalendar,
    category: 'Feature Explorer',
    tier: 'Bronze',
    progress: ({ todos }) => ({ current: todos.filter(t => t.dueDate).length, target: 1 }),
  },
  {
    id: 'eternal_return',
    title: 'Eternal Return',
    description: 'Created a recurring task.',
    icon: FaRepeat,
    category: 'Feature Explorer',
    tier: 'Bronze',
    progress: ({ todos }) => ({ current: todos.filter(t => t.recurrenceRule).length, target: 1 }),
  },
  {
    id: 'tag_organizer',
    title: 'Tag Organizer',
    description: 'Used a tag to categorize a task.',
    icon: HiHashtag,
    category: 'Feature Explorer',
    tier: 'Bronze',
    progress: ({ todos }) => ({ current: todos.filter(t => t.tags.length > 0).length, target: 1 }),
  },
  {
    id: 'personal_touch',
    title: 'Personal Touch',
    description: 'Customized your profile with an avatar or banner.',
    icon: HiUser,
    category: 'Feature Explorer',
    tier: 'Bronze',
  },
  {
    id: 'colorful_personality',
    title: 'Colorful Personality',
    description: 'Changed the default accent color.',
    icon: FaPaintbrush,
    category: 'Feature Explorer',
    tier: 'Bronze',
  },
];

type Condition = (stats: AchievementStats) => boolean;

const conditions: Record<Achievement['id'], Condition> = {
  first_task: ({ todos }) => todos.length >= 1,
  ten_tasks: ({ todos }) => todos.length >= 10,
  fifty_tasks: ({ todos }) => todos.length >= 50,
  hundred_tasks: ({ todos }) => todos.length >= 100,
  first_completed: ({ todos }) => todos.some(t => t.completed),
  ten_completed: ({ todos }) => todos.filter(t => t.completed).length >= 10,
  fifty_completed: ({ todos }) => todos.filter(t => t.completed).length >= 50,
  hundred_completed: ({ todos }) => todos.filter(t => t.completed).length >= 100,
  note_taker: ({ notes }) => notes.length >= 1,
  librarian: ({ notes }) => notes.length >= 10,
  scholar: ({ notes }) => notes.length >= 25,
  important_mission: ({ todos }) => todos.some(t => t.isImportant),
  sub_zero: ({ todos }) => todos.some(t => t.subtasks && t.subtasks.length > 0),
  picture_perfect: ({ todos }) => todos.some(t => t.imageUrl),
  time_traveler: ({ todos }) => todos.some(t => t.dueDate),
  priority_one: ({ todos }) => todos.some(t => t.priority === 'high'),
  eternal_return: ({ todos }) => todos.some(t => !!t.recurrenceRule),
  tag_organizer: ({ todos }) => todos.some(t => t.tags.length > 0),
  personal_touch: (stats) => {
    if (!stats.userProfile || !stats.oldUserProfile) return false;
    const hasNewAvatar = stats.userProfile.avatarUrl && stats.userProfile.avatarUrl !== stats.oldUserProfile.avatarUrl;
    const hasNewBanner = stats.userProfile.bannerUrl && stats.userProfile.bannerUrl !== stats.oldUserProfile.bannerUrl;
    const hasNewOrgAvatar = stats.userProfile.organizationAvatarUrl && stats.userProfile.organizationAvatarUrl !== stats.oldUserProfile.organizationAvatarUrl;
    return hasNewAvatar || hasNewBanner || hasNewOrgAvatar;
  },
  colorful_personality: (stats) => {
    if (!stats.accent || !stats.oldAccent) return false;
    return stats.accent !== stats.oldAccent && stats.oldAccent === 'sky'; // Only trigger on first change from default
  },
  perfect_week: ({ todos }) => {
    const completedDates = new Set<string>();
    todos.forEach(todo => {
      if (todo.completed && todo.completedAt) {
        completedDates.add(new Date(todo.completedAt).toISOString().split('T')[0]);
      }
    });
    if (completedDates.size < 7) return false;
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      if (!completedDates.has(dateString)) return false;
    }
    return true;
  },
  perfect_month: ({ todos }) => {
    const completedDates = new Set<string>();
    todos.forEach(todo => {
      if (todo.completed && todo.completedAt) {
        completedDates.add(new Date(todo.completedAt).toISOString().split('T')[0]);
      }
    });
    if (completedDates.size < 30) return false;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      if (!completedDates.has(dateString)) return false;
    }
    return true;
  },
  on_the_dot: ({ todos }) => {
    return todos.some(t => t.completed && t.dueDate && t.completedAt && t.dueDate === t.completedAt.split('T')[0]);
  },
  overdue_crusher: ({ todos }) => {
    return todos.some(t => t.completed && t.dueDate && t.completedAt && t.dueDate < t.completedAt.split('T')[0]);
  },
  daily_dominator: ({ todos }) => {
    const tasksByDueDate = todos.reduce<Record<string, Todo[]>>((acc, task) => {
        if (task.dueDate) {
            if (!acc[task.dueDate]) acc[task.dueDate] = [];
            acc[task.dueDate].push(task);
        }
        return acc;
    }, {});
    return Object.values(tasksByDueDate).some(tasksOnDay =>
        tasksOnDay.length > 0 && tasksOnDay.every(t => t.completed)
    );
  },
};

export const checkAchievementConditions = (stats: AchievementStats, unlocked: UnlockedAchievement[]): Achievement[] => {
  const unlockedIds = new Set(unlocked.map(a => a.achievementId));
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of achievementsList) {
    if (!unlockedIds.has(achievement.id)) {
      if (conditions[achievement.id](stats)) {
        newlyUnlocked.push(achievement);
      }
    }
  }

  return newlyUnlocked;
};