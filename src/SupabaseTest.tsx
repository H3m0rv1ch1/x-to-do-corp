import React from 'react';
import { useSupabaseTodos } from './hooks/useSupabaseTodos';
import { getSupabase } from './services/supabaseClient';

function SupabaseTest() {
    const { todos, loading, error, refetch, addTodo, toggleTodo } = useSupabaseTodos();
    const [newTodo, setNewTodo] = React.useState('');

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTodo.trim()) return;
        await addTodo(newTodo);
        setNewTodo('');
    };

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

            <form onSubmit={handleAdd} className="mb-4 flex gap-2">
                <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="Add a new todo..."
                    className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    Add
                </button>
            </form>

            <ul className="space-y-2">
                {todos.map((todo) => (
                    <li key={todo.id} className="p-2 border rounded dark:border-gray-700 flex justify-between items-center">
                        <div>
                            <div className={`font-medium ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                                {todo.text}
                            </div>
                            <div className="text-xs text-gray-500">
                                Priority: {todo.priority}
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={(e) => toggleTodo(todo.id, e.target.checked)}
                            className="w-5 h-5"
                        />
                    </li>
                ))}
            </ul>

            {todos.length === 0 && (
                <p className="text-gray-500 italic">No todos found.</p>
            )}

            <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                <h3>Debug Actions</h3>
                <button
                    onClick={async () => {
                        const supabase = getSupabase();
                        const { error } = await supabase.auth.signOut();
                        if (error) alert('Error signing out: ' + error.message);
                        else {
                            localStorage.clear();
                            window.location.reload();
                        }
                    }}
                    style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Force Logout & Clear Data
                </button>
                <p style={{ fontSize: '0.8em', color: '#666', marginTop: '8px' }}>
                    Use this if you are getting "Unauthorized" errors. It will clear your session and reload.
                </p>
            </div>
        </div>
    );
}

export default SupabaseTest;
