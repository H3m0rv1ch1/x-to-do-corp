import type { Todo, UserProfile } from '@/types';
import { getSupabase, isSupabaseConfigured } from './supabaseClient';

// Converts app Todo to DB row format (snake_case + extra columns)
function toTodoRow(userId: string, t: Todo) {
  return {
    id: t.id,
    user_id: userId,
    text: t.text,
    completed: t.completed,
    is_important: t.isImportant,
    priority: t.priority,
    image_url: t.imageUrl,
    due_date: t.dueDate,
    tags: t.tags,
    created_at: t.createdAt,
    subtasks: t.subtasks || [],
    notified: t.notified ?? null,
    completed_at: t.completedAt ?? null,
    recurrence_rule: t.recurrenceRule,
    reminder_offset: t.reminderOffset,
  };
}

// Converts DB row back to app Todo
function fromTodoRow(row: any): Todo {
  return {
    id: row.id,
    text: row.text,
    completed: !!row.completed,
    isImportant: !!row.is_important,
    priority: row.priority,
    imageUrl: row.image_url,
    dueDate: row.due_date,
    tags: row.tags || [],
    createdAt: row.created_at,
    subtasks: row.subtasks || [],
    notified: row.notified ?? undefined,
    completedAt: row.completed_at ?? undefined,
    recurrenceRule: row.recurrence_rule ?? null,
    reminderOffset: row.reminder_offset ?? null,
  };
}

export async function fetchTodos(userId: string): Promise<Todo[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []).map(fromTodoRow);
}

export async function upsertTodos(userId: string, todos: Todo[]): Promise<void> {
  if (!isSupabaseConfigured() || todos.length === 0) return;
  const supabase = getSupabase();
  const rows = todos.map(t => toTodoRow(userId, t));
  const { error } = await supabase.from('todos').upsert(rows, { onConflict: 'id' });
  if (error) throw new Error(error.message);
}

export async function upsertTodo(userId: string, todo: Todo): Promise<void> {
  return upsertTodos(userId, [todo]);
}

export async function deleteTodoRemote(userId: string, todoId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabase();
  const { error } = await supabase.from('todos').delete().eq('id', todoId).eq('user_id', userId);
  if (error) throw new Error(error.message);
}

// Profile helpers
function toProfileRow(userId: string, p: UserProfile) {
  return {
    id: userId,
    username: p.username,
    name: p.name,
    bio: p.bio,
    avatar_url: p.avatarUrl,
    banner_url: p.bannerUrl,
    verification_type: p.verificationType,
    organization: p.organization ?? null,
    organization_avatar_url: p.organizationAvatarUrl ?? null,
  };
}

function fromProfileRow(row: any): UserProfile {
  return {
    username: row.username || '',
    name: row.name || '',
    bio: row.bio || '',
    avatarUrl: row.avatar_url || null,
    bannerUrl: row.banner_url || null,
    verificationType: (row.verification_type as UserProfile['verificationType']) || 'none',
    organization: row.organization ?? undefined,
    organizationAvatarUrl: row.organization_avatar_url ?? null,
  };
}

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? fromProfileRow(data) : null;
}

export async function upsertProfile(userId: string, profile: UserProfile): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = getSupabase();
  const row = toProfileRow(userId, profile);
  const { error } = await supabase.from('profiles').upsert(row, { onConflict: 'id' });
  if (error) throw new Error(error.message);
}