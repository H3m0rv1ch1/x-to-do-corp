import React from 'react';
import { useSupabaseTodos } from './hooks/useSupabaseTodos';

function SupabaseTest() {
    const { todos, loading, error, refetch } = useSupabaseTodos();

    if (loading) return <div className="p-4">Loading todos...</div>;
    if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow my-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Supabase Connection Test</h2>
                <button
                    onClick={refetch}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Refresh
                </button>
            </div>

            <ul className="space-y-2">
                {todos.map((todo) => (
                    <li key={todo.id} className="p-2 border rounded dark:border-gray-700">
                        <div className="font-medium">{todo.text}</div>
                        <div className="text-xs text-gray-500">
                            Priority: {todo.priority} | Status: {todo.completed ? 'Done' : 'Pending'}
                        </div>
                    </li>
                ))}
            </ul>

            {todos.length === 0 && (
                <p className="text-gray-500 italic">No todos found.</p>
            )}
        </div>
    );
}

export default SupabaseTest;
