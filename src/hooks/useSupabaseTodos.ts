import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Todo } from '../types/supabase';

export function useSupabaseTodos() {
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

    return { todos, loading, error, refetch: fetchTodos };
}
