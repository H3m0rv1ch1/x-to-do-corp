import React from 'react';
import { HiX } from 'react-icons/hi';
import { useAppContext } from '@/hooks/useAppContext';
import { AddTodoForm } from '@/components/todo';

const AddTaskModal: React.FC = () => {
    const { isAddTaskModalOpen, closeAddTaskModal, handleAddTodo, userProfile } = useAppContext();

    if (!isAddTaskModalOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-40 flex justify-center items-start pt-10 md:pt-20 animate-fade-in"
            onClick={closeAddTaskModal}
        >
            <div 
                className="bg-[rgba(var(--background-primary-rgb))] rounded-2xl shadow-lg w-full max-w-lg mx-4 text-[rgba(var(--foreground-primary-rgb))] transform transition-all animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center p-2 border-b border-[rgba(var(--border-primary-rgb))]">
                    <button onClick={closeAddTaskModal} className="p-2 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))]">
                        <HiX className="w-5 h-5" />
                    </button>
                </div>
                <AddTodoForm 
                    onAddTodo={handleAddTodo} 
                    userProfile={userProfile}
                    onTaskAdded={closeAddTaskModal}
                />
            </div>
        </div>
    );
};

export default AddTaskModal;