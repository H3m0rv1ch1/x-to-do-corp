import { useState, useEffect } from 'react';
import { getSupabase } from '../services/supabaseClient';
import { Todo } from '../types/supabase';

export function useSupabaseTodos() {
    const supabase = getSupabase();
    const [todos, setTodos] = useState<Todo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTodos();
    }, []);

    async function fetchTodos() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('todos')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            if (data) {
                setTodos(data as Todo[]);
            }
        } catch (err: any) {
            console.error('Error fetching todos:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function addTodo(text: string) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('todos')
                .insert([{
                    text,
                    user_id: user.id,
                    priority: 'medium',
                    is_important: false,
                    completed: false
                }])
                .select()
                .single();

            if (error) throw error;
            setTodos([data as Todo, ...todos]);
            return data;
        } catch (err: any) {
            console.error('Error adding todo:', err);
            setError(err.message);
            throw err;
        }
    }

    async function toggleTodo(id: string, completed: boolean) {
        try {
            const { error } = await supabase
                .from('todos')
                .update({ completed })
                .eq('id', id);

            if (error) throw error;
            setTodos(todos.map(t => t.id === id ? { ...t, completed } : t));
        } catch (err: any) {
            console.error('Error toggling todo:', err);
            setError(err.message);
        }
    }

    return { todos, loading, error, refetch: fetchTodos, addTodo, toggleTodo };
}
