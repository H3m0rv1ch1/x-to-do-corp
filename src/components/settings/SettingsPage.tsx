import React, { useRef, ReactNode, useState, useEffect } from 'react';
import { HiBell, HiExclamation, HiDownload, HiUpload, HiTrash, HiHome } from 'react-icons/hi';
import { FaPaintbrush } from 'react-icons/fa6';
import { TbWand } from 'react-icons/tb';
import { Header } from '@/components/layout';
import { useAppContext } from '@/hooks/useAppContext';
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
    } = useAppContext();

    const [previewAccent, setPreviewAccent] = useState(accent);

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
            <div className="divide-y divide-[rgba(var(--border-primary-rgb))]">

                <SettingsSection title="Appearance">
                    <SettingsRow
                        icon={<FaPaintbrush className="w-6 h-6" />}
                        title="Theme"
                        description="Switch between light and dark mode."
                        actionComponent={
                            <div className="flex items-center space-x-2 bg-[rgba(var(--background-tertiary-rgb))] p-1 rounded-full">
                                <button onClick={() => setTheme('light')} className={`px-4 py-1 text-sm font-bold rounded-full ${theme === 'light' ? 'bg-[rgba(var(--background-primary-rgb))] text-[rgba(var(--foreground-primary-rgb))]' : 'text-[rgba(var(--foreground-secondary-rgb))]'}`}>
                                    Light
                                </button>
                                <button onClick={() => setTheme('dark')} className={`px-4 py-1 text-sm font-bold rounded-full ${theme === 'dark' ? 'bg-[rgba(var(--background-primary-rgb))] text-[rgba(var(--foreground-primary-rgb))]' : 'text-[rgba(var(--foreground-secondary-rgb))]'}`}>
                                    Dark
                                </button>
                            </div>
                        }
                    />
                    <div className="p-4 space-y-4">
                        <div className="flex items-start">
                            <div className="mr-4 text-[rgba(var(--foreground-secondary-rgb))]">
                                <div className="w-6 h-6 rounded-full" style={{ background: `linear-gradient(45deg, ${accents[0].color}, ${accents[1].color}, ${accents[2].color})` }}></div>
                            </div>
                            <div className="flex-grow">
                                <p className="font-semibold text-[rgba(var(--foreground-primary-rgb))]">Accent Color</p>
                                <p className="text-sm text-[rgba(var(--foreground-secondary-rgb))]">Choose your favorite color for buttons and highlights. Hover to preview.</p>
                            </div>
                        </div>

                        <div
                            className="flex flex-wrap gap-4"
                            onMouseLeave={() => setPreviewAccent(accent)}
                        >
                            {accents.map(acc => (
                                <button
                                    key={acc.name}
                                    onMouseEnter={() => setPreviewAccent(acc.name)}
                                    onClick={() => setAccent(acc.name)}
                                    className="w-8 h-8 rounded-full transition-all duration-200 transform hover:scale-110"
                                    style={{
                                        backgroundColor: acc.color,
                                        boxShadow: accent === acc.name ? `0 0 0 2px rgba(var(--background-primary-rgb)), 0 0 0 4px ${acc.color}` : 'none'
                                    }}
                                    aria-label={`Set accent color to ${acc.name}`}
                                >
                                </button>
                            ))}
                        </div>

                        {/* Live Preview Section */}
                        <div
                            data-accent={previewAccent}
                            className="p-4 rounded-lg border border-[rgba(var(--border-primary-rgb))] bg-[rgba(var(--background-secondary-rgb))] transition-all duration-300"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 rounded-full bg-[rgba(var(--accent-rgb),0.1)]">
                                        <HiHome className="w-6 h-6 text-[rgba(var(--accent-rgb))]" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[rgba(var(--foreground-primary-rgb))]">Home</p>
                                        <p className="text-sm text-[rgba(var(--accent-rgb))]">Sample Text</p>
                                    </div>
                                </div>
                                <button className="bg-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-on-accent-rgb))] font-bold px-4 py-2 rounded-full text-sm">
                                    Preview Button
                                </button>
                            </div>
                        </div>
                    </div>
                </SettingsSection>

                <SettingsSection title="Notifications">
                    <SettingsRow
                        icon={<HiBell className="w-6 h-6" />}
                        title="Task Reminders"
                        description={
                            notificationPermission === 'granted' ? 'You will receive notifications for due tasks.' :
                                notificationPermission === 'denied' ? 'Notifications are blocked by your browser.' :
                                    'Allow notifications to get reminders.'
                        }
                        actionComponent={
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={notificationPermission === 'granted'}
                                    disabled={notificationPermission === 'denied'}
                                    onChange={handleToggleChange}
                                />
                                <span className="slider"></span>
                            </label>
                        }
                    />
                </SettingsSection>

                <SettingsSection title="Data Management">
                    <SettingsRow
                        icon={<HiDownload className="w-6 h-6" />}
                        title="Export Data"
                        description="Download a backup of all your data."
                        actionComponent={<ActionButton onClick={handleExportData}>Export</ActionButton>}
                    />
                    <SettingsRow
                        icon={<HiUpload className="w-6 h-6" />}
                        title="Import Data"
                        description="Import tasks, notes, and profile from a backup file."
                        actionComponent={
                            <>
                                <ActionButton onClick={handleImportClick}>Import</ActionButton>
                                <input type="file" ref={importInputRef} onChange={onFileImport} className="sr-only" accept=".json" />
                            </>
                        }
                    />
                </SettingsSection>

                <SettingsSection title="Account Actions">
                    <SettingsRow
                        icon={<TbWand className="w-6 h-6" />}
                        title="Clear Completed Tasks"
                        description="Permanently delete all completed tasks."
                        actionComponent={<ActionButton onClick={handleClearCompletedTodos}>Clear</ActionButton>}
                    />
                    <SettingsRow
                        icon={<HiTrash className="w-6 h-6" />}
                        title="Delete All Notes"
                        description="Permanently delete all of your notes."
                        actionComponent={<ActionButton onClick={handleDeleteAllNotes}>Delete</ActionButton>}
                    />
                </SettingsSection>

                <div className="p-4 pt-6">
                    <h2 className="text-lg font-bold text-[rgba(var(--danger-rgb))] flex items-center space-x-2">
                        <HiExclamation className="w-5 h-5" />
                        <span>Danger Zone</span>
                    </h2>
                    <p className="text-sm text-[rgba(var(--foreground-secondary-rgb))] mt-1">This action is destructive and irreversible. Proceed with caution.</p>
                    <div className="mt-4 border border-[rgba(var(--danger-rgb),0.3)] bg-[rgba(var(--danger-rgb),0.05)] rounded-lg divide-y divide-[rgba(var(--danger-rgb),0.2)]">
                        <SettingsRow
                            icon={<HiTrash className="w-6 h-6 text-[rgba(var(--danger-rgb),0.8)]" />}
                            title="Delete All App Data"
                            description="Permanently erase everything."
                            actionComponent={<ActionButton onClick={handleDeleteAllData} variant="danger">Delete All</ActionButton>}
                        />
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