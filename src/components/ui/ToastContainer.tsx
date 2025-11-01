
import React from 'react';
import { type Toast as ToastType } from '@/types';
import Toast from './Toast';
import { useAppContext } from '@/hooks/useAppContext';

interface ToastContainerProps {
  toasts: ToastType[];
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  const { removeToast } = useAppContext();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-sm z-50 flex flex-col items-center space-y-3 px-4">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;