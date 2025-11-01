import React from 'react';
import { HiPencil, HiHashtag, HiPlay, HiKey } from 'react-icons/hi';

interface WelcomeGuideProps {
    onDismiss: () => void;
    onGetStarted: () => void;
}

const Tip: React.FC<{ icon: React.ReactNode, title: string, description: React.ReactNode }> = ({ icon, title, description }) => (
    <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[rgba(var(--background-tertiary-rgb))] flex items-center justify-center text-[rgba(var(--accent-rgb))]">
            {icon}
        </div>
        <div>
            <h4 className="font-bold text-[rgba(var(--foreground-primary-rgb))]">{title}</h4>
            <p className="text-sm text-[rgba(var(--foreground-secondary-rgb))]">{description}</p>
        </div>
    </div>
);

const WelcomeGuide: React.FC<WelcomeGuideProps> = ({ onDismiss, onGetStarted }) => {
    return (
        <div className="p-6 sm:p-8 border-b border-[rgba(var(--border-primary-rgb))] animate-fade-in">
            <div className="max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-center text-[rgba(var(--foreground-primary-rgb))] mb-2">Welcome to Your New To-Do List!</h2>
                <p className="text-center text-[rgba(var(--foreground-secondary-rgb))] mb-8">Here are a few tips to get you started on your journey to peak productivity.</p>
                
                <div className="space-y-6">
                    <Tip 
                        icon={<HiPencil className="w-5 h-5" />} 
                        title="Add Your First Task" 
                        description="Click 'Add Task' above or the floating button to create your first to-do item."
                    />
                    <Tip 
                        icon={<HiHashtag className="w-5 h-5" />} 
                        title="Use Smart Language" 
                        description={<>Type things like <code className="text-xs bg-[rgba(var(--background-tertiary-rgb))] text-[rgba(var(--accent-rgb))] rounded px-1.5 py-0.5 font-mono">#work by tomorrow</code> to automatically add tags and due dates.</>}
                    />
                    <Tip 
                        icon={<HiPlay className="w-5 h-5" />} 
                        title="Enter Focus Mode" 
                        description="Click the play icon on a task to start a distraction-free session and crush your goals."
                    />
                    <Tip 
                        icon={<HiKey className="w-5 h-5" />} 
                        title="Master Shortcuts" 
                        description={<>Press <kbd>?</kbd> anytime to see a full list of keyboard shortcuts and speed up your workflow.</>}
                    />
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <button 
                        onClick={onGetStarted}
                        className="flex-1 bg-[rgba(var(--button-primary-bg-rgb))] text-[rgba(var(--button-primary-text-rgb))] font-bold py-3 px-4 rounded-full hover:opacity-90 transition-opacity"
                    >
                        Get Started
                    </button>
                     <button 
                        onClick={onDismiss}
                        className="flex-1 bg-transparent border border-[rgba(var(--border-secondary-rgb))] text-[rgba(var(--foreground-primary-rgb))] font-bold py-3 px-4 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))] transition-colors"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeGuide;