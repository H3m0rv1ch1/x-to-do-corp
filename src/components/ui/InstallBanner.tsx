import React, { useEffect, useState } from 'react';
import { FaXTwitter } from 'react-icons/fa6';

const isStandalone = () => {
  const mq = window.matchMedia('(display-mode: standalone)').matches;
  const ios = (window.navigator as any).standalone === true; // iOS Safari
  return mq || ios;
};

const isTauriEnv = () => typeof window !== 'undefined' && (window as any).__TAURI__ !== undefined;

const InstallBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try { return localStorage.getItem('installBannerDismissed') === '1'; } catch { return false; }
  });
  const [deferredPrompt, setDeferredPrompt] = useState<any | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as any);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  if (dismissed) return null;
  if (isTauriEnv()) return null;
  if (isStandalone()) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try { localStorage.setItem('installBannerDismissed', '1'); } catch {}
  };

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // No prompt available; just show the tip and keep UX simple
      handleDismiss();
      return;
    }
    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice; // { outcome: 'accepted' | 'dismissed', platform: '' }
    } catch {}
    setDeferredPrompt(null);
    handleDismiss();
  };

  return (
    <div className="px-4 pb-3">
      <div className="rounded-lg border border-[rgba(var(--border-primary-rgb))] bg-[rgba(var(--background-secondary-rgb))] shadow-sm">
          <div className="px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-[rgba(var(--accent-rgb),0.15)] flex items-center justify-center">
                <FaXTwitter className="w-4 h-4 text-[rgba(var(--accent-rgb))]" />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-[rgba(var(--foreground-primary-rgb))]">X To-Do</div>
                <div className="text-[12px] text-[rgba(var(--foreground-secondary-rgb))]">Install from your browser to use X To‑Do like a desktop app (PWA).</div>
                {!deferredPrompt && (
                  <div className="text-[12px] text-[rgba(var(--foreground-secondary-rgb))]">Tip: Open your browser menu and choose “Install app”.</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleDismiss} className="px-3 py-1.5 text-[12px] rounded-full bg-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-on-accent-rgb))] hover:opacity-90">Done</button>
              <button onClick={handleDismiss} className="px-3 py-1.5 text-[12px] rounded-full border border-[rgba(var(--border-primary-rgb))] text-[rgba(var(--foreground-primary-rgb))] hover:bg-[rgba(var(--background-tertiary-rgb))]">Cancel</button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default InstallBanner;