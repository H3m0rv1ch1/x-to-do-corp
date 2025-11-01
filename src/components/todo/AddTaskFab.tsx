
import React from 'react';
import { HiPencil } from 'react-icons/hi';
import { useAppContext } from '@/hooks/useAppContext';

const AddTaskFab: React.FC = () => {
    const { openAddTaskModal } = useAppContext();

    return (
        <button 
            onClick={openAddTaskModal}
            className="fixed bottom-20 right-4 w-14 h-14 bg-[rgba(var(--button-primary-bg-rgb))] rounded-full flex items-center justify-center text-[rgba(var(--button-primary-text-rgb))] shadow-lg hover:opacity-90 transition-opacity duration-200 md:hidden z-30"
            aria-label="Add new task"
        >
            <HiPencil className="w-7 h-7" />
        </button>
    );
};

export default AddTaskFab;