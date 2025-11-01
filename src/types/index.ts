import type { FC } from 'react';

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type Priority = 'low' | 'medium' | 'high' | 'none';

export interface Todo {
  id:string;
  text: string;
  completed: boolean;
  isImportant: boolean;
  priority: Priority;
  imageUrl: string | null;
  dueDate: string | null;
  tags: string[];
  createdAt: string;
  subtasks?: Subtask[];
  notified?: boolean;
  completedAt?: string;
  recurrenceRule: { type: RecurrenceType } | null;
  reminderOffset: number | null; // in minutes, null for no reminder, 0 for at due date
}

export interface UserProfile {
  name: string;
  username: string;
  bio: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  verificationType: 'none' | 'user' | 'business';
  organization?: string;
  organizationAvatarUrl?: string | null;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type AchievementId =
  | 'first_task'
  | 'ten_tasks'
  | 'fifty_tasks'
  | 'hundred_tasks'
  | 'first_completed'
  | 'ten_completed'
  | 'fifty_completed'
  | 'hundred_completed'
  | 'note_taker'
  | 'librarian'
  | 'scholar'
  | 'important_mission'
  | 'sub_zero'
  | 'picture_perfect'
  | 'time_traveler'
  | 'priority_one'
  | 'eternal_return'
  | 'tag_organizer'
  | 'personal_touch'
  | 'colorful_personality'
  | 'perfect_week'
  | 'perfect_month'
  | 'on_the_dot'
  | 'overdue_crusher'
  | 'daily_dominator';

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  // Fix: Use imported FC type instead of React.FC to resolve namespace error.
  icon: FC<any>;
  category: string;
  tier: 'Bronze' | 'Silver' | 'Gold';
  progress?: (stats: { todos: Todo[]; notes: Note[] }) => { current: number; target: number };
}

export interface UnlockedAchievement {
  achievementId: AchievementId;
  unlockedAt: string;
}

export type Page = 'home' | 'profile' | 'notes' | 'achievements' | 'settings' | 'calendar';

export type TagColorMap = { [key: string]: { background: string; foreground: string } };