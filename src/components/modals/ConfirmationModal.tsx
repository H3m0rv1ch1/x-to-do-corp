import React from 'react';
import { HiX } from 'react-icons/hi';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
        className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center animate-fade-in"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
        <div 
            className="bg-[rgba(var(--background-primary-rgb))] rounded-2xl shadow-lg w-full max-w-sm mx-4 text-[rgba(var(--foreground-primary-rgb))] transform transition-all animate-scale-in p-6"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{title}</h2>
                <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))]">
                    <HiX className="w-5 h-5" />
                </button>
            </div>
            
            <p className="text-[rgba(var(--foreground-secondary-rgb))] mb-6">{message}</p>

            <div className="flex flex-col space-y-3">
                <button 
                    onClick={onConfirm}
                    className="w-full bg-[rgba(var(--danger-rgb))] text-white font-bold py-3 rounded-full hover:opacity-90 transition-opacity"
                >
                    Confirm
                </button>
                <button 
                    onClick={onClose}
                    className="w-full bg-transparent border border-[rgba(var(--border-secondary-rgb))] text-[rgba(var(--foreground-primary-rgb))] font-bold py-3 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))] transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
  );
};

export default ConfirmationModal;