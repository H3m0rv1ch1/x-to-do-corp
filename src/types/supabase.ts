export interface Todo {
    id: string;
    user_id: string;
    text: string;
    completed: boolean;
    is_important: boolean;
    priority: 'low' | 'medium' | 'high' | string;
    image_url?: string;
    due_date?: string;
    tags?: string[];
    created_at: string;
    subtasks?: any[];
    notified?: string;
    completed_at?: string;
    recurrence_rule?: string;
    reminder_offset?: number;
}

export interface Profile {
    id: string;
    name: string;
    created_at: string;
}

export interface Database {
    public: {
        Tables: {
            todos: {
                Row: Todo;
                Insert: Partial<Todo>;
                Update: Partial<Todo>;
            };
            profiles: {
                Row: Profile;
                Insert: Partial<Profile>;
                Update: Partial<Profile>;
            };
        };
    };
}
