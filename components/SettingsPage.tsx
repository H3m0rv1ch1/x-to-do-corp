
import React, { useRef, ReactNode } from 'react';
import Header from './Header';
import { useAppContext } from '../hooks/useAppContext';
import SettingsRow from './SettingsRow';
import { Bell as BellIcon, AlertTriangle as ExclamationIcon, Download as ExportIcon, Upload as ImportIcon, Wand as WandIcon, Trash2 as TrashIcon, Check as CheckIcon, Paintbrush as PaintBrushIcon } from 'lucide-react';

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
        if(importInputRef.current) {
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
        <div className="w-full border-l border-r border-[rgba(var(--border-primary-rgb))]" style={{ minHeight: '100vh' }}>
            <Header />
            <div className="divide-y divide-[rgba(var(--border-primary-rgb))]">

                <SettingsSection title="Appearance">
                    <SettingsRow
                        icon={<PaintBrushIcon className="w-6 h-6" />}
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
                    <div className="p-4 hover:bg-[rgba(var(--foreground-primary-rgb),0.03)] transition-colors duration-200">
                        <div className="flex items-start">
                            <div className="mr-4 text-[rgba(var(--foreground-secondary-rgb))]">
                               <div className="w-6 h-6 rounded-full" style={{ background: `linear-gradient(45deg, ${accents[0].color}, ${accents[1].color}, ${accents[2].color})` }}></div>
                            </div>
                            <div className="flex-grow">
                                <p className="font-semibold text-[rgba(var(--foreground-primary-rgb))]">Accent Color</p>
                                <p className="text-sm text-[rgba(var(--foreground-secondary-rgb))]">Choose your favorite color for buttons and highlights.</p>
                                <div className="mt-3 flex flex-wrap gap-3">
                                    {accents.map(acc => (
                                        <button
                                            key={acc.name}
                                            onClick={() => setAccent(acc.name)}
                                            className="w-8 h-8 rounded-full flex items-center justify-center transition-transform transform hover:scale-110"
                                            style={{ backgroundColor: acc.color }}
                                            aria-label={`Set accent color to ${acc.name}`}
                                        >
                                            {accent === acc.name && <CheckIcon className="w-5 h-5" style={{ color: `rgba(var(--foreground-on-accent-rgb))`}} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </SettingsSection>

                <SettingsSection title="Notifications">
                    <SettingsRow
                        icon={<BellIcon className="w-6 h-6" />}
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
                        icon={<ExportIcon className="w-6 h-6" />}
                        title="Export Data"
                        description="Download a backup of all your data."
                        actionComponent={<ActionButton onClick={handleExportData}>Export</ActionButton>}
                    />
                    <SettingsRow
                        icon={<ImportIcon className="w-6 h-6" />}
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
                        icon={<WandIcon className="w-6 h-6" />}
                        title="Clear Completed Tasks"
                        description="Permanently delete all completed tasks."
                        actionComponent={<ActionButton onClick={handleClearCompletedTodos}>Clear</ActionButton>}
                    />
                    <SettingsRow
                        icon={<TrashIcon className="w-6 h-6" />}
                        title="Delete All Notes"
                        description="Permanently delete all of your notes."
                        actionComponent={<ActionButton onClick={handleDeleteAllNotes}>Delete</ActionButton>}
                    />
                </SettingsSection>

                <div className="p-4 pt-6">
                    <h2 className="text-lg font-bold text-[rgba(var(--danger-rgb))] flex items-center space-x-2">
                        <ExclamationIcon className="w-5 h-5" />
                        <span>Danger Zone</span>
                    </h2>
                    <p className="text-sm text-[rgba(var(--foreground-secondary-rgb))] mt-1">This action is destructive and irreversible. Proceed with caution.</p>
                    <div className="mt-4 border border-[rgba(var(--danger-rgb),0.3)] bg-[rgba(var(--danger-rgb),0.05)] rounded-lg divide-y divide-[rgba(var(--danger-rgb),0.2)]">
                         <SettingsRow
                            icon={<TrashIcon className="w-6 h-6 text-[rgba(var(--danger-rgb),0.8)]" />}
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