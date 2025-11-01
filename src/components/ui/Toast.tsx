
import React, { useState, useEffect } from 'react';
import { type Toast as ToastType } from '@/types';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 4000); // Auto-dismiss after 4 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300); // Match animation duration
  };

  const bgColorClass = {
    success: 'bg-[rgba(var(--accent-rgb))]',
    error: 'bg-[rgba(var(--danger-rgb))]',
    info: 'bg-[rgba(var(--accent-rgb))]',
  }[toast.type];

  return (
    <div
      className={`relative rounded-full shadow-lg flex items-center px-6 py-3 text-white font-semibold text-sm ${bgColorClass} ${isExiting ? 'animate-toast-out' : 'animate-toast-in'}`}
      role="alert"
    >
      <p>{toast.message}</p>
    </div>
  );
};

export default Toast;