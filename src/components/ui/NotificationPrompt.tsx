import React, { useState } from 'react';
import { HiBell } from 'react-icons/hi';
import { useAppContext } from '@/hooks/useAppContext';

const isElectronEnv = () => typeof window !== 'undefined' && (window as any).electronAPI !== undefined;

const NotificationPrompt: React.FC = () => {
  const { notificationPermission, requestNotificationPermission } = useAppContext();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try { return localStorage.getItem('notificationsPromptDismissed') === '1'; } catch { return false; }
  });

  if (dismissed) return null;
  if (isElectronEnv()) return null;
  // Show only when the browser hasn't decided yet
  if (notificationPermission !== 'default') return null;

  const handleLater = () => {
    setDismissed(true);
    try { localStorage.setItem('notificationsPromptDismissed', '1'); } catch {}
  };

  const handleAllow = () => {
    requestNotificationPermission();
    setDismissed(true);
    try { localStorage.setItem('notificationsPromptDismissed', '1'); } catch {}
  };

  return (
    <div className="px-4 pb-3">
      <div className="rounded-lg border border-[rgba(var(--border-primary-rgb))] bg-[rgba(var(--background-secondary-rgb))] shadow-sm">
        <div className="px-3 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-[rgba(var(--accent-rgb),0.15)] flex items-center justify-center">
              <HiBell className="w-4 h-4 text-[rgba(var(--accent-rgb))]" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-[rgba(var(--foreground-primary-rgb))]">Enable Reminders</div>
              <div className="text-[12px] text-[rgba(var(--foreground-secondary-rgb))]">Allow notifications to receive task reminders.</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleAllow} className="px-3 py-1.5 text-[12px] rounded-full bg-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-on-accent-rgb))] hover:opacity-90">Allow</button>
            <button onClick={handleLater} className="px-3 py-1.5 text-[12px] rounded-full border border-[rgba(var(--border-primary-rgb))] text-[rgba(var(--foreground-primary-rgb))] hover:bg-[rgba(var(--background-tertiary-rgb))]">Later</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPrompt;