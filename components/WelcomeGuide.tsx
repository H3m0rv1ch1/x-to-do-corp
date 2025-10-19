import React from 'react';
import { Sparkles, PenLine, Hash } from 'lucide-react';

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
                        icon={<PenLine className="w-5 h-5" />} 
                        title="Add Your First Task" 
                        description="Click 'Add Task' above or the floating button to create your first to-do item."
                    />
                    <Tip 
                        icon={<Hash className="w-5 h-5" />} 
                        title="Use Smart Language" 
                        description={<>Type things like <code className="text-xs bg-[rgba(var(--background-tertiary-rgb))] text-[rgba(var(--accent-rgb))] rounded px-1.5 py-0.5 font-mono">#work by tomorrow</code> to automatically add tags and due dates.</>}
                    />
                     <Tip 
                        icon={<Sparkles className="w-5 h-5" />} 
                        title="Get AI Suggestions" 
                        description="Use the AI assistant to generate helpful ideas and organize tasks smarter."
                    />
                </div>

                <div className="flex justify-center mt-6">
                    <button onClick={onGetStarted} className="px-4 py-2 rounded-full bg-[rgba(var(--accent-rgb))] text-black font-bold hover:brightness-90 transition-colors">Get Started</button>
                    <button onClick={onDismiss} className="ml-4 px-4 py-2 rounded-full border border-[rgba(var(--border-primary-rgb))] text-[rgba(var(--foreground-secondary-rgb))] hover:bg-[rgba(var(--background-tertiary-rgb))] transition-colors">Dismiss</button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeGuide;