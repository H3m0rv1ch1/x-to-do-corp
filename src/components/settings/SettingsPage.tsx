import React, { useRef, ReactNode, useState, useEffect } from 'react';
import { HiBell, HiExclamation, HiDownload, HiUpload, HiTrash, HiHome, HiSwitchHorizontal } from 'react-icons/hi';
import { HiCloud, HiLockClosed } from 'react-icons/hi';
import { FaPaintbrush } from 'react-icons/fa6';
import { TbWand } from 'react-icons/tb';
import { Header } from '@/components/layout';
import { useAppContext } from '@/hooks/useAppContext';
import { useAuth } from '@/hooks/useAuth';
import SettingsRow from './SettingsRow';

const SettingsPage: React.FC = () => {
    const {
        notificationPermission,
        requestNotificationPermission,
        handleExportData,
        handleImportData,
        handleClearCompletedTodos,
        handleDeleteAllNotes,
        handleDeleteAllData,
        theme,
        setTheme,
        accent,
        setAccent,
        addToast,
        showConfirmation,
    } = useAppContext();

    const { user, convertToOnline, convertToLocal, deleteAccount } = useAuth();

    const [previewAccent, setPreviewAccent] = useState(accent);
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [convertPassword, setConvertPassword] = useState('');
    const [convertLoading, setConvertLoading] = useState(false);

    useEffect(() => {
        setPreviewAccent(accent);
    }, [accent]);

    const importInputRef = useRef<HTMLInputElement>(null);

    const handleToggleChange = () => {
        if (notificationPermission === 'default') {
            requestNotificationPermission();
        }
    };

    const handleImportClick = () => {
        importInputRef.current?.click();
    };

    const onFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleImportData(file);
        }
        if (importInputRef.current) {
            importInputRef.current.value = "";
        }
    };

    const handleConvertToOnline = () => {
        setShowConvertModal(true);
    };

    const handleConvertToLocal = () => {
        showConfirmation(
            'Convert to Local Account?',
            'Your data will be stored locally only. You can still access it offline, but it won\'t sync across devices. This action can be reversed later.',
            async () => {
                try {
                    await convertToLocal();
                    addToast('Converted to local account successfully!', 'success');
                } catch (err: any) {
                    addToast(err?.message || 'Failed to convert account', 'error');
                }
            }
        );
    };

    const handleConvertSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (convertPassword.length < 8) {
            addToast('Password must be at least 8 characters', 'error');
            return;
        }

        setConvertLoading(true);
        try {
            await convertToOnline(convertPassword);
            addToast('Converted to online account! Check your email to verify.', 'success');
            setShowConvertModal(false);
            setConvertPassword('');
        } catch (err: any) {
            addToast(err?.message || 'Failed to convert account', 'error');
        } finally {
            setConvertLoading(false);
        }
    };

    const handleDeleteAccount = () => {
        showConfirmation(
            'Delete Account Permanently?',
            'This will permanently delete your account and ALL your data (tasks, notes, profile, achievements). This action CANNOT be undone. Are you absolutely sure?',
            async () => {
                try {
                    await deleteAccount();
                    addToast('Account deleted successfully', 'info');
                    // User will be redirected to landing page automatically
                } catch (err: any) {
                    addToast(err?.message || 'Failed to delete account', 'error');
                }
            }
        );
    };

    const accents = [
        { name: 'sky', color: '#0ea5e9' },
        { name: 'pink', color: '#ec4899' },
        { name: 'green', color: '#22c55e' },
        { name: 'orange', color: '#f97316' },
        { name: 'purple', color: '#a855f7' },
        { name: 'yellow', color: '#eab308' },
    ];


    const ActionButton: React.FC<{ onClick: () => void; children: React.ReactNode; variant?: 'default' | 'danger' }> = ({ onClick, children, variant = 'default' }) => {
        const baseClasses = "font-bold px-4 py-1.5 rounded-full transition-colors duration-200 text-sm";
        const variantClasses = variant === 'danger'
            ? 'border border-[rgba(var(--danger-rgb),0.5)] text-[rgba(var(--danger-rgb))] hover:bg-[rgba(var(--danger-rgb),0.1)]'
            : 'border border-[rgba(var(--border-secondary-rgb))] text-[rgba(var(--foreground-primary-rgb))] hover:bg-[rgba(var(--background-tertiary-rgb))]';
        return <button onClick={onClick} className={`${baseClasses} ${variantClasses}`}>{children}</button>;
    };

    const SettingsSection: React.FC<{ title: string; children: ReactNode }> = ({ title, children }) => (
        <div>
            <h2 className="text-lg font-bold pt-6 pb-2 px-4 text-[rgba(var(--foreground-primary-rgb))]">{title}</h2>
            <div>
                {children}
            </div>
        </div>
    );

    return (
        <div className="w-full" style={{ minHeight: '100vh' }}>
            <Header />
            
            {/* Convert to Online Modal */}
            {showConvertModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-[rgba(var(--background-primary-rgb))] rounded-2xl max-w-md w-full p-6 border border-[rgba(var(--border-primary-rgb))]">
                        <h2 className="text-xl font-bold mb-2 text-[rgba(var(--foreground-primary-rgb))]">
                            Convert to Online Account
                        </h2>
                        <p className="text-sm text-[rgba(var(--foreground-secondary-rgb))] mb-4">
                            Create a password for your online account. Your data will be synced to the cloud and accessible from any device.
                        </p>
                        <form onSubmit={handleConvertSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm mb-1 text-[rgba(var(--foreground-secondary-rgb))]">
                                    New Password (min 8 characters)
                                </label>
                                <input
                                    type="password"
                                    value={convertPassword}
                                    onChange={e => setConvertPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    placeholder="Enter a secure password"
                                    className="w-full rounded-xl border border-[rgba(var(--border-primary-rgb))] bg-[rgba(var(--background-secondary-rgb))] px-3 py-2 text-[rgba(var(--foreground-primary-rgb))] focus:outline-none focus:ring-2 focus:ring-[rgba(var(--accent-rgb))]"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={convertLoading}
                                    className="flex-1 py-2.5 rounded-full bg-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-on-accent-rgb))] font-semibold hover:opacity-90 disabled:opacity-60"
                                >
                                    {convertLoading ? 'Converting...' : 'Convert'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowConvertModal(false);
                                        setConvertPassword('');
                                    }}
                                    className="px-6 py-2.5 rounded-full border border-[rgba(var(--border-primary-rgb))] font-semibold hover:bg-[rgba(var(--background-secondary-rgb))]"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="divide-y divide-[rgba(var(--border-primary-rgb))]">

                <SettingsSection title="Appearance">
                    <div className="p-4 space-y-4">
                        {/* Theme Selection */}
                        <div className="p-3 rounded-xl border border-[rgba(var(--border-primary-rgb))]">
                            <div className="flex items-center space-x-2 mb-3">
                                <FaPaintbrush className="w-4 h-4 text-[rgba(var(--accent-rgb))]" />
                                <p className="font-semibold text-sm text-[rgba(var(--foreground-primary-rgb))]">Theme</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    onClick={() => setTheme('light')} 
                                    className={`p-2.5 rounded-lg border-2 transition-all duration-200 ${theme === 'light' 
                                        ? 'border-[rgba(var(--accent-rgb))] bg-[rgba(var(--accent-rgb),0.1)]' 
                                        : 'border-[rgba(var(--border-primary-rgb))] hover:border-[rgba(var(--border-secondary-rgb))]'}`}
                                >
                                    <div data-theme="light" className="w-full h-10 rounded bg-[rgba(var(--background-primary-rgb))] border border-[rgba(var(--border-primary-rgb))] mb-2 flex items-center justify-center overflow-hidden">
                                        <div className="w-3/4 h-6 bg-[rgba(var(--background-secondary-rgb))] rounded flex items-center px-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[rgba(var(--foreground-secondary-rgb))] mr-1"></div>
                                            <div className="flex-1 h-1 bg-[rgba(var(--border-primary-rgb))] rounded"></div>
                                        </div>
                                    </div>
                                    <p className={`text-xs font-semibold ${theme === 'light' ? 'text-[rgba(var(--accent-rgb))]' : 'text-[rgba(var(--foreground-primary-rgb))]'}`}>Light</p>
                                </button>
                                <button 
                                    onClick={() => setTheme('dark')} 
                                    className={`p-2.5 rounded-lg border-2 transition-all duration-200 ${theme === 'dark' 
                                        ? 'border-[rgba(var(--accent-rgb))] bg-[rgba(var(--accent-rgb),0.1)]' 
                                        : 'border-[rgba(var(--border-primary-rgb))] hover:border-[rgba(var(--border-secondary-rgb))]'}`}
                                >
                                    <div data-theme="dark" className="w-full h-10 rounded bg-[rgba(var(--background-primary-rgb))] border border-[rgba(var(--border-primary-rgb))] mb-2 flex items-center justify-center overflow-hidden">
                                        <div className="w-3/4 h-6 bg-[rgba(var(--background-secondary-rgb))] rounded flex items-center px-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[rgba(var(--foreground-secondary-rgb))] mr-1"></div>
                                            <div className="flex-1 h-1 bg-[rgba(var(--border-primary-rgb))] rounded"></div>
                                        </div>
                                    </div>
                                    <p className={`text-xs font-semibold ${theme === 'dark' ? 'text-[rgba(var(--accent-rgb))]' : 'text-[rgba(var(--foreground-primary-rgb))]'}`}>Dark</p>
                                </button>
                            </div>
                        </div>

                        {/* Accent Color Selection */}
                        <div className="p-3 rounded-xl border border-[rgba(var(--border-primary-rgb))]">
                            <div className="flex items-center space-x-2 mb-3">
                                <div className="w-4 h-4 rounded-full" style={{ background: `linear-gradient(135deg, ${accents[0].color}, ${accents[4].color})` }}></div>
                                <p className="font-semibold text-sm text-[rgba(var(--foreground-primary-rgb))]">Accent Color</p>
                            </div>
                            <div
                                className="flex justify-between"
                                onMouseLeave={() => setPreviewAccent(accent)}
                            >
                                {accents.map(acc => (
                                    <button
                                        key={acc.name}
                                        data-accent={acc.name}
                                        onMouseEnter={() => setPreviewAccent(acc.name)}
                                        onClick={() => setAccent(acc.name)}
                                        className={`flex-1 mx-0.5 first:ml-0 last:mr-0 py-2 rounded-lg transition-all duration-200 flex flex-col items-center gap-1.5 ${accent === acc.name 
                                            ? 'bg-[rgba(var(--background-primary-rgb))] border border-[rgba(var(--border-secondary-rgb))]' 
                                            : 'hover:bg-[rgba(var(--background-tertiary-rgb))]'}`}
                                        aria-label={`Set accent color to ${acc.name}`}
                                    >
                                        <div 
                                            className={`w-5 h-5 rounded-full transition-transform flex items-center justify-center ${accent === acc.name ? 'scale-110' : ''}`}
                                            style={{ backgroundColor: acc.color }}
                                        >
                                            {accent === acc.name && (
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className={`text-[10px] capitalize ${accent === acc.name ? 'text-[rgba(var(--foreground-primary-rgb))] font-medium' : 'text-[rgba(var(--foreground-secondary-rgb))]'}`}>
                                            {acc.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </SettingsSection>

                <SettingsSection title="Notifications">
                    <div className="p-4">
                        <div className="p-3 rounded-xl border border-[rgba(var(--border-primary-rgb))]">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-full ${notificationPermission === 'granted' ? 'bg-[rgba(var(--accent-rgb),0.15)]' : 'bg-[rgba(var(--foreground-secondary-rgb),0.1)]'}`}>
                                        <HiBell className={`w-5 h-5 ${notificationPermission === 'granted' ? 'text-[rgba(var(--accent-rgb))]' : 'text-[rgba(var(--foreground-secondary-rgb))]'}`} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-[rgba(var(--foreground-primary-rgb))]">Task Reminders</p>
                                        <p className="text-xs text-[rgba(var(--foreground-secondary-rgb))]">
                                            {notificationPermission === 'granted' ? 'Enabled' :
                                                notificationPermission === 'denied' ? 'Blocked by browser' : 'Disabled'}
                                        </p>
                                    </div>
                                </div>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={notificationPermission === 'granted'}
                                        disabled={notificationPermission === 'denied'}
                                        onChange={handleToggleChange}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            {notificationPermission === 'denied' && (
                                <div className="mt-3 p-2 rounded-lg bg-[rgba(var(--danger-rgb),0.1)] border border-[rgba(var(--danger-rgb),0.2)]">
                                    <p className="text-xs text-[rgba(var(--danger-rgb))]">
                                        Notifications are blocked. Enable them in your browser settings.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </SettingsSection>

                <SettingsSection title="Account">
                    <div className="p-4">
                        <div className="grid grid-cols-2 gap-3">
                            {/* Account Type Card */}
                            <div className="p-3 rounded-xl border border-[rgba(var(--accent-rgb))] bg-[rgba(var(--accent-rgb),0.1)]">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        {user?.isOfflineOnly ? (
                                            <HiLockClosed className="w-4 h-4 text-[rgba(var(--accent-rgb))]" />
                                        ) : (
                                            <HiCloud className="w-4 h-4 text-[rgba(var(--accent-rgb))]" />
                                        )}
                                        <p className="font-semibold text-sm text-[rgba(var(--foreground-primary-rgb))]">
                                            {user?.isOfflineOnly ? 'Local Account' : 'Online Account'}
                                        </p>
                                    </div>
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-on-accent-rgb))]">
                                        Active
                                    </span>
                                </div>
                                <p className="text-xs text-[rgba(var(--foreground-secondary-rgb))]">
                                    {user?.isOfflineOnly 
                                        ? 'Data stored locally' 
                                        : 'Synced across devices'}
                                </p>
                            </div>

                            {/* Convert Account Card */}
                            <button 
                                onClick={user?.isOfflineOnly ? handleConvertToOnline : handleConvertToLocal}
                                className="p-3 rounded-xl border border-[rgba(var(--border-primary-rgb))] hover:bg-[rgba(var(--background-hover-rgb))] transition-colors text-left"
                            >
                                <div className="flex items-center space-x-2 mb-2">
                                    <HiSwitchHorizontal className="w-4 h-4 text-[rgba(var(--accent-rgb))]" />
                                    <p className="font-semibold text-sm text-[rgba(var(--foreground-primary-rgb))]">
                                        {user?.isOfflineOnly ? 'Go Online' : 'Go Local'}
                                    </p>
                                </div>
                                <p className="text-xs text-[rgba(var(--foreground-secondary-rgb))]">
                                    {user?.isOfflineOnly 
                                        ? 'Enable cloud sync' 
                                        : 'Maximum privacy'}
                                </p>
                            </button>

                            {/* Export Data Card */}
                            <button 
                                onClick={handleExportData}
                                className="p-3 rounded-xl border border-[rgba(var(--border-primary-rgb))] hover:bg-[rgba(var(--background-hover-rgb))] transition-colors text-left"
                            >
                                <div className="flex items-center space-x-2 mb-2">
                                    <HiDownload className="w-4 h-4 text-[rgba(var(--accent-rgb))]" />
                                    <p className="font-semibold text-sm text-[rgba(var(--foreground-primary-rgb))]">Export Data</p>
                                </div>
                                <p className="text-xs text-[rgba(var(--foreground-secondary-rgb))]">Download a backup</p>
                            </button>

                            {/* Import Data Card */}
                            <button 
                                onClick={handleImportClick}
                                className="p-3 rounded-xl border border-[rgba(var(--border-primary-rgb))] hover:bg-[rgba(var(--background-hover-rgb))] transition-colors text-left"
                            >
                                <div className="flex items-center space-x-2 mb-2">
                                    <HiUpload className="w-4 h-4 text-[rgba(var(--accent-rgb))]" />
                                    <p className="font-semibold text-sm text-[rgba(var(--foreground-primary-rgb))]">Import Data</p>
                                </div>
                                <p className="text-xs text-[rgba(var(--foreground-secondary-rgb))]">Restore from backup</p>
                            </button>
                            <input type="file" ref={importInputRef} onChange={onFileImport} className="sr-only" accept=".json" />
                        </div>
                    </div>
                </SettingsSection>

                <SettingsSection title="Account Actions">
                    <div className="p-4">
                        <div className="grid grid-cols-2 gap-3">
                            {/* Clear Completed Tasks Card */}
                            <button 
                                onClick={handleClearCompletedTodos}
                                className="p-3 rounded-xl border border-[rgba(var(--border-primary-rgb))] hover:bg-[rgba(var(--background-hover-rgb))] transition-colors text-left"
                            >
                                <div className="flex items-center space-x-2 mb-2">
                                    <TbWand className="w-4 h-4 text-[rgba(var(--accent-rgb))]" />
                                    <p className="font-semibold text-sm text-[rgba(var(--foreground-primary-rgb))]">Clear Completed</p>
                                </div>
                                <p className="text-xs text-[rgba(var(--foreground-secondary-rgb))]">Remove done tasks</p>
                            </button>

                            {/* Delete All Notes Card */}
                            <button 
                                onClick={handleDeleteAllNotes}
                                className="p-3 rounded-xl border border-[rgba(var(--border-primary-rgb))] hover:bg-[rgba(var(--background-hover-rgb))] transition-colors text-left"
                            >
                                <div className="flex items-center space-x-2 mb-2">
                                    <HiTrash className="w-4 h-4 text-[rgba(var(--accent-rgb))]" />
                                    <p className="font-semibold text-sm text-[rgba(var(--foreground-primary-rgb))]">Delete Notes</p>
                                </div>
                                <p className="text-xs text-[rgba(var(--foreground-secondary-rgb))]">Remove all notes</p>
                            </button>
                        </div>
                    </div>
                </SettingsSection>

                <div className="p-4 pt-6">
                    <div className="flex items-center space-x-2 mb-3">
                        <HiExclamation className="w-4 h-4 text-[rgba(var(--danger-rgb))]" />
                        <h2 className="text-lg font-bold text-[rgba(var(--danger-rgb))]">Danger Zone</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {/* Delete All Data Card */}
                        <button 
                            onClick={handleDeleteAllData}
                            className="p-3 rounded-xl border border-[rgba(var(--danger-rgb),0.3)] hover:bg-[rgba(var(--danger-rgb),0.1)] transition-colors text-left group"
                        >
                            <div className="flex items-center space-x-2 mb-2">
                                <HiTrash className="w-4 h-4 text-[rgba(var(--danger-rgb))]" />
                                <p className="font-semibold text-sm text-[rgba(var(--foreground-primary-rgb))]">Delete All Data</p>
                            </div>
                            <p className="text-xs text-[rgba(var(--foreground-secondary-rgb))]">Erase tasks, notes & settings</p>
                        </button>

                        {/* Delete Account Card */}
                        <button 
                            onClick={handleDeleteAccount}
                            className="p-3 rounded-xl border border-[rgba(var(--danger-rgb),0.3)] hover:bg-[rgba(var(--danger-rgb),0.1)] transition-colors text-left group"
                        >
                            <div className="flex items-center space-x-2 mb-2">
                                <HiTrash className="w-4 h-4 text-[rgba(var(--danger-rgb))]" />
                                <p className="font-semibold text-sm text-[rgba(var(--foreground-primary-rgb))]">Delete Account</p>
                            </div>
                            <p className="text-xs text-[rgba(var(--foreground-secondary-rgb))]">Permanently remove account</p>
                        </button>
                    </div>
                </div>

                <div className="p-4 py-8 text-center text-[rgba(var(--foreground-secondary-rgb),0.7)] text-sm">
                    <p>X To-Do Corp v1.0.0</p>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;