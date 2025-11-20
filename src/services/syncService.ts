import { getSupabase, isSupabaseConfigured } from './supabaseClient';
import {
    getSyncQueue,
    removeFromSyncQueue,
    putTodo,
    putNote,
    putUnlockedAchievement,
    saveUserProfile,
    deleteTodo,
    deleteNote
} from './db';
import { Todo, Note, UnlockedAchievement, UserProfile } from '../types';

interface SyncItem {
    id?: number;
    table: 'todos' | 'notes' | 'profiles' | 'achievements';
    action: 'INSERT' | 'UPDATE' | 'DELETE';
    payload: any;
    syncedAt?: number;
}

export const syncService = {
    async pushChanges() {
        if (!navigator.onLine || !isSupabaseConfigured()) return;

        const queue = await getSyncQueue();
        if (queue.length === 0) return;

        const supabase = getSupabase();

        for (const item of queue) {
            try {
                const { table, action, payload } = item;

                // Map table names to Supabase tables if different
                // Assuming Supabase tables are: todos, notes, profiles, achievements

                let query = supabase.from(table);
                let error;

                if (action === 'INSERT') {
                    const { error: err } = await query.insert(payload);
                    error = err;
                } else if (action === 'UPDATE') {
                    const { error: err } = await query.update(payload).eq('id', payload.id);
                    error = err;
                } else if (action === 'DELETE') {
                    const { error: err } = await query.delete().eq('id', payload.id);
                    error = err;
                }

                if (error) {
                    console.error(`Failed to sync item ${item.id}:`, error);
                    // Decide whether to keep in queue or move to a dead-letter queue
                    // For now, we'll keep it if it's a network error, remove if it's a schema error?
                    // Simple approach: if error, skip removal.
                } else {
                    if (item.id) {
                        await removeFromSyncQueue(item.id);
                    }
                }
            } catch (e) {
                console.error('Sync error:', e);
            }
        }
    },

    async pullChanges() {
        if (!navigator.onLine || !isSupabaseConfigured()) return;

        const supabase = getSupabase();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        try {
            // Pull Todos
            const { data: todos, error: todoError } = await supabase.from('todos').select('*');
            if (!todoError && todos) {
                for (const todo of todos) {
                    // Ensure dates are strings if they come back as something else, though Supabase client usually handles this
                    await putTodo(todo as unknown as Todo);
                }
            }

            // Pull Notes
            const { data: notes, error: noteError } = await supabase.from('notes').select('*');
            if (!noteError && notes) {
                for (const note of notes) {
                    await putNote(note as unknown as Note);
                }
            }

            // Pull Profile
            const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (!profileError && profile) {
                // Map Supabase profile to local UserProfile
                const userProfile: UserProfile = {
                    name: profile.name || 'Guest',
                    username: profile.username || '@guest',
                    bio: profile.bio || '',
                    avatarUrl: profile.avatar_url || null,
                    bannerUrl: profile.banner_url || null,
                    verificationType: profile.verification_type || 'none',
                    organization: profile.organization || undefined,
                    organizationAvatarUrl: profile.organization_avatar_url || undefined
                };
                await saveUserProfile(userProfile);
            }
        } catch (error) {
            console.error('Error pulling changes:', error);
        }
    },

    startAutoSync() {
        window.addEventListener('online', () => {
            console.log('Online: triggering sync...');
            this.pushChanges();
            this.pullChanges();
        });

        // Initial sync on load
        this.pushChanges();
        this.pullChanges();

        // Periodic sync (every 5 minutes)
        setInterval(() => {
            this.pushChanges();
            this.pullChanges();
        }, 5 * 60 * 1000);
    }
};
