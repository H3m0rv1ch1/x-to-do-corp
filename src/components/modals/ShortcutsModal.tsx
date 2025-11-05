import React from 'react';
import { HiX } from 'react-icons/hi';
import { MdOutlineKeyboard } from 'react-icons/md';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShortcutItem: React.FC<{ keys: string[]; description: string }> = ({ keys, description }) => (
    <div className="flex justify-between items-center py-3">
        <p className="text-[rgba(var(--foreground-primary-rgb))]">{description}</p>
        <div className="flex items-center space-x-2">
            {keys.map(key => <kbd key={key}>{key}</kbd>)}
        </div>
    </div>
);


const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) {
        return null;
    }

    const shortcuts = {
        "Global": [
            { keys: ['N'], description: 'New Task' },
            { keys: ['/'], description: 'Focus Search' },
            { keys: ['?'], description: 'Open Shortcuts' },
            { keys: ['Esc'], description: 'Close Modal / View' },
        ],
        "Navigation": [
            { keys: ['H'], description: 'Go to Home' },
            { keys: ['P'], description: 'Go to Profile' },
            { keys: ['C'], description: 'Go to Calendar' },
            { keys: ['O'], description: 'Go to Notes' },
            { keys: ['S'], description: 'Go to Settings' },
        ],
    };

    return (
        <div 
            className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center animate-fade-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-title"
        >
            <div 
                className="bg-[rgba(var(--background-primary-rgb))] rounded-2xl shadow-lg w-full max-w-md mx-4 text-[rgba(var(--foreground-primary-rgb))] transform transition-all animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-[rgba(var(--border-primary-rgb))]">
                    <div className="flex items-center space-x-3">
                        <MdOutlineKeyboard className="w-6 h-6 text-[rgba(var(--foreground-secondary-rgb))]" />
                        <h2 id="shortcuts-title" className="text-xl font-bold">Keyboard Shortcuts</h2>
                    </div>
                    <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))]">
                        <HiX className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-4 max-h-[70vh] overflow-y-auto">
                    {Object.entries(shortcuts).map(([category, items]) => (
                        <div key={category} className="mb-4">
                            <h3 className="font-bold text-[rgba(var(--foreground-secondary-rgb))] mb-1">{category}</h3>
                            <div className="divide-y divide-[rgba(var(--border-primary-rgb))]">
                                {items.map(item => <ShortcutItem key={item.description} {...item} />)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ShortcutsModal;