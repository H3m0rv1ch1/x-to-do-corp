import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { HiX, HiPlay, HiPause, HiRefresh, HiCog, HiCheck, HiArrowsExpand, HiOutlineArrowsExpand, HiVolumeUp, HiVolumeOff, HiStop } from 'react-icons/hi';
import { useAppContext } from '@/hooks/useAppContext';
import { Select } from '@/components/ui';
import { SessionMode, AmbientSound } from '@/contexts/AppContext';
import FocusMusicPlayer from './FocusMusicPlayer';
import useClickOutside from '@/hooks/useClickOutside';

// Load bundled ambient audio from project folders
const rainTracks = Object.values(import.meta.glob('../../assets/audio/Rain/*', { as: 'url', eager: true })) as string[];
const cafeTracks = Object.values(import.meta.glob('../../assets/audio/Cafe/*', { as: 'url', eager: true })) as string[];
const forestTracks = Object.values(import.meta.glob('../../assets/audio/Forest/*', { as: 'url', eager: true })) as string[];
const lofiTracks = Object.values(import.meta.glob('../../assets/audio/Lofi/*', { as: 'url', eager: true })) as string[];

const AMBIENT_SOUNDS: Record<AmbientSound, { label: string, srcs: string[] }> = {
    none:   { label: 'None',   srcs: [] },
    rain:   { label: 'Rain',   srcs: rainTracks },
    cafe:   { label: 'Cafe',   srcs: cafeTracks },
    forest: { label: 'Forest', srcs: forestTracks },
    lofi:   { label: 'Lofi',   srcs: lofiTracks },
    piano:  { label: 'Piano',  srcs: [] },
};

const FocusModeModal: React.FC = () => {
    const { 
        isFocusModalOpen,
        activeFocusTodo, 
        closeFocusModal, 
        focusSettings, 
        updateFocusSettings,
        handleToggleSubtask,
        notificationPermission,
        focusSession,
        changeFocusMode,
        toggleFocusSessionActive,
        stopFocusSession,
    } = useAppContext();
    
    const { mode, isActive, cycles, timeRemaining, initialDuration } = focusSession;
    
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [showMusicPlayer, setShowMusicPlayer] = useState<boolean>(true);
    const [musicTrackName, setMusicTrackName] = useState<string | null>(null);
    
    const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
    const modalContentRef = useRef<HTMLDivElement>(null);
    const trackMenuRef = useRef<HTMLDivElement>(null);
    const [trackMenuFor, setTrackMenuFor] = useState<AmbientSound | null>(null);
    const [trackMenuPlacement, setTrackMenuPlacement] = useState<'up' | 'down'>('down');

    const resetTimer = useCallback(() => {
        const duration = (mode === 'focus' ? focusSettings.focusDuration : mode === 'shortBreak' ? focusSettings.shortBreakDuration : focusSettings.longBreakDuration) * 60;
        changeFocusMode(mode);
    }, [mode, focusSettings, changeFocusMode]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };
    
    // Ambient Sound — play selected track by index
    useEffect(() => {
        const audio = ambientAudioRef.current;
        if (!audio) return;
        const sources = AMBIENT_SOUNDS[focusSettings.sound]?.srcs ?? [];
        const index = typeof focusSettings.ambientTrackIndex === 'number' ? focusSettings.ambientTrackIndex : 0;
        const trackUrl = sources[index] ?? sources[0] ?? '';
        if (focusSettings.sound !== 'none' && trackUrl && isActive) {
            if (audio.src !== trackUrl) {
                audio.src = trackUrl;
            }
            audio.loop = true;
            audio.volume = focusSettings.volume;
            audio.play().catch(e => console.error('Audio play failed:', e));
        } else {
            audio.pause();
        }
    }, [focusSettings.sound, focusSettings.volume, focusSettings.ambientTrackIndex, isActive]);
    
    // Fullscreen handler
    const handleFullScreenToggle = () => {
        if (!document.fullscreenElement) {
            modalContentRef.current?.requestFullscreen();
            setIsFullScreen(true);
        } else {
            document.exitFullscreen();
            setIsFullScreen(false);
        }
    };

    const handleStopFocus = () => {
        try { document.exitFullscreen(); } catch {}
        try { ambientAudioRef.current?.pause(); } catch {}
        updateFocusSettings({ sound: 'none' });
        stopFocusSession();
    };

    useEffect(() => {
        const handleFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullScreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
    }, []);

    // Close track dropdown when clicking outside
    useClickOutside(trackMenuRef, () => setTrackMenuFor(null));

    if (!isFocusModalOpen || !activeFocusTodo) return null;

    const progress = (timeRemaining / initialDuration) * 100;
    
    const ModeButton: React.FC<{ value: SessionMode, label: string }> = ({ value, label }) => (
        <button
            onClick={() => changeFocusMode(value)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${mode === value ? 'bg-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-on-accent-rgb))]' : 'bg-[rgba(var(--background-secondary-rgb),0.5)] backdrop-blur-sm text-[rgba(var(--foreground-secondary-rgb))] hover:bg-[rgba(var(--border-secondary-rgb))]'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center animate-fade-in">
            <div 
                ref={modalContentRef}
                className={`relative bg-[rgba(var(--background-primary-rgb))] w-full h-full transform transition-all flex flex-col ${isFullScreen ? '' : 'md:rounded-2xl md:shadow-lg md:max-w-3xl md:max-h-[92vh]'}`}
            >
                {/* Visual Timer Background */}
                 <div className="focus-bg-gradient" style={{ height: `${100 - progress}%` }} />
                 <div className="focus-bg-gradient" style={{ top: 'auto', bottom: 0, height: `${progress}%` }}></div>


                {/* Header */}
                <header className="relative z-10 flex items-center justify-between p-4 pt-[env(safe-area-inset-top)] flex-shrink-0">
                    <h2 className="text-xl font-bold">Focus Mode</h2>
                    <div className="flex items-center space-x-2">
                        <button onClick={handleFullScreenToggle} className="p-2 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb),0.5)]">
                           {isFullScreen ? <HiOutlineArrowsExpand className="w-5 h-5"/> : <HiArrowsExpand className="w-5 h-5"/>}
                        </button>
                        <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className={`p-2 rounded-full ${isSettingsOpen ? 'bg-[rgba(var(--background-tertiary-rgb),0.8)]' : 'hover:bg-[rgba(var(--background-tertiary-rgb),0.5)]'}`}>
                            <HiCog className="w-5 h-5" />
                        </button>
                        <button onClick={closeFocusModal} className="p-2 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb),0.5)]">
                            <HiX className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="focus-main-content relative z-10 p-6 md:p-8 flex-grow overflow-y-auto">
                    <div className="mx-auto w-full max-w-2xl flex flex-col gap-6 items-stretch">
                        {/* Left: Timer & Controls */}
                        <div className="p-4 bg-[rgba(var(--background-secondary-rgb),0.6)] backdrop-blur-md rounded-xl border border-[rgba(var(--border-primary-rgb))] flex flex-col items-center">
                            {/* Timer Ring */}
                            <div className="relative w-40 h-40 md:w-64 md:h-64 rounded-full"
                                 style={{ backgroundImage: `conic-gradient(rgba(var(--accent-rgb)) ${100 - progress}%, rgba(var(--background-tertiary-rgb)) 0)` }}>
                                <div className="absolute inset-3 rounded-full bg-[rgba(var(--background-primary-rgb))] flex items-center justify-center">
                                    <div className={`text-4xl md:text-6xl font-bold ${isActive ? 'animate-focus-pulse' : ''}`}>{formatTime(timeRemaining)}</div>
                                </div>
                            </div>

                            {/* Mode chips */}
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <ModeButton value="focus" label="Focus" />
                                <ModeButton value="shortBreak" label="Short Break" />
                                <ModeButton value="longBreak" label="Long Break" />
                            </div>

                            {/* Controls */}
                            <div className="flex justify-center items-center gap-3 mt-4">
                                <button aria-label="Play or pause focus" onClick={toggleFocusSessionActive} className="bg-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-on-accent-rgb))] w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity">
                                    {isActive ? <HiPause className="w-6 h-6 md:w-7 md:h-7"/> : <HiPlay className="w-6 h-6 md:w-7 md:h-7"/>}
                                </button>
                                <button aria-label="Stop focus session" onClick={handleStopFocus} title="Stop Focus" className="bg-[rgba(var(--danger-rgb))] text-[rgba(var(--foreground-on-accent-rgb))] w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg hover:opacity-90">
                                    <HiStop className="w-6 h-6 md:w-7 md:h-7" />
                                </button>
                                <button aria-label="Reset timer" onClick={resetTimer} className="bg-[rgba(var(--background-secondary-rgb),0.5)] backdrop-blur-sm text-[rgba(var(--foreground-primary-rgb))] w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-[rgba(var(--border-primary-rgb))] transition-colors">
                                    <HiRefresh className="w-6 h-6 md:w-7 md:h-7"/>
                                </button>
                            </div>

                            <p className="text-xs sm:text-sm text-[rgba(var(--foreground-secondary-rgb))] mt-4">
                                Completed Cycles: <span className="font-bold text-[rgba(var(--foreground-primary-rgb))]">{cycles}</span>
                            </p>
                        </div>

                        {/* Task & Subtasks */}
                        <div className="p-4 bg-[rgba(var(--background-secondary-rgb),0.6)] backdrop-blur-md rounded-xl border border-[rgba(var(--border-primary-rgb))]">
                            <p className="text-xs font-semibold text-[rgba(var(--foreground-secondary-rgb))] mb-1">Focusing on</p>
                            <h3 className="text-xl md:text-2xl font-bold mb-4 truncate max-w-full">{activeFocusTodo.text}</h3>

                            {/* Subtasks */}
                            {activeFocusTodo.subtasks && activeFocusTodo.subtasks.length > 0 ? (
                                <div className="space-y-2 max-h-60 md:max-h-72 overflow-y-auto">
                                    {activeFocusTodo.subtasks.map(subtask => (
                                        <div key={subtask.id} className="flex items-center">
                                            <button
                                                onClick={() => handleToggleSubtask(activeFocusTodo.id, subtask.id)}
                                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mr-3 transition-colors duration-200 ${subtask.completed ? 'border-[rgba(var(--accent-rgb))] bg-[rgba(var(--accent-rgb))]' : 'border-[rgba(var(--border-secondary-rgb))] hover:border-[rgba(var(--accent-rgb))]'}`}
                                            >
                                                {subtask.completed && <HiCheck className="w-3.5 h-3.5 text-white" />}
                                            </button>
                                            <span className={`text-sm ${subtask.completed ? 'line-through text-[rgba(var(--foreground-secondary-rgb))]' : ''}`}>{subtask.text}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-[rgba(var(--foreground-secondary-rgb))]">No subtasks added.</p>
                            )}

                            {/* Custom Music Player under task card */}
                            <div className="mt-4">
                                <FocusMusicPlayer visible={showMusicPlayer} onTrackNameChange={setMusicTrackName} />
                            </div>
                        </div>
                    </div>
                </main>
                
                {/* Settings Panel */}
                {isSettingsOpen && (
                    <div className="absolute top-16 right-4 z-20 bg-[rgba(var(--background-secondary-rgb),0.8)] backdrop-blur-md rounded-lg shadow-lg border border-[rgba(var(--border-primary-rgb))] w-72 p-4 animate-fade-in focus-settings-panel">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-[rgba(var(--foreground-secondary-rgb))]">FOCUS (MINS)</label>
                                <input type="number" value={focusSettings.focusDuration} onChange={e => updateFocusSettings({ focusDuration: Number(e.target.value) })} className="mt-1" />
                            </div>
                             <div>
                                <label className="text-xs font-bold text-[rgba(var(--foreground-secondary-rgb))]">BREAK (MINS)</label>
                                <div className="flex space-x-2 mt-1">
                                    <input type="number" placeholder="Short" value={focusSettings.shortBreakDuration} onChange={e => updateFocusSettings({ shortBreakDuration: Number(e.target.value) })} />
                                    <input type="number" placeholder="Long" value={focusSettings.longBreakDuration} onChange={e => updateFocusSettings({ longBreakDuration: Number(e.target.value) })} />
                                </div>
                            </div>
                             <div className="flex items-center justify-between pt-2">
                                <label className="text-sm font-semibold">Auto-start timers</label>
                                <label className="switch">
                                    <input type="checkbox" checked={focusSettings.autoStart} onChange={e => updateFocusSettings({ autoStart: e.target.checked })} />
                                    <span className="slider"></span>
                                </label>
                            </div>
                             <div>
                                <label className="text-xs font-bold text-[rgba(var(--foreground-secondary-rgb))]">AMBIENT SOUND</label>
                                <div className="mt-2 relative">
                                    <Select
                                      className="w-full"
                                      fullWidth
                                      buttonClassName="w-full pr-10"
                                      value={focusSettings.sound}
                                      onChange={(val) => updateFocusSettings({ sound: val as AmbientSound })}
                                      options={Object.entries(AMBIENT_SOUNDS)
                                        .filter(([key, def]) => key === 'none' || def.srcs.length > 0)
                                        .map(([key, { label }]) => ({ value: key, label }))}
                                      size="md"
                                    />
                                    <button
                                      onClick={() => updateFocusSettings({ volume: focusSettings.volume > 0 ? 0 : 0.5 })}
                                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))]"
                                      aria-label={focusSettings.volume > 0 ? 'Mute ambient' : 'Unmute ambient'}
                                    >
                                        {focusSettings.volume > 0 ? <HiVolumeUp className="w-5 h-5"/> : <HiVolumeOff className="w-5 h-5"/>}
                                    </button>
                                </div>
                                <input type="range" min="0" max="1" step="0.05" value={focusSettings.volume} onChange={e => updateFocusSettings({ volume: Number(e.target.value)})} className="custom-slider mt-2" />
                                {(() => {
                                    const def = AMBIENT_SOUNDS[focusSettings.sound];
                                    const sources = def?.srcs ?? [];
                                    if (focusSettings.sound === 'none' || sources.length === 0) return null;
                                    const trackNames = sources.map((_, idx) => `${def.label} ${idx + 1}`);
                                    const currentIndex = typeof focusSettings.ambientTrackIndex === 'number' ? focusSettings.ambientTrackIndex : 0;
                                    return (
                                        <div className="mt-3">
                                            <label className="text-xs font-bold text-[rgba(var(--foreground-secondary-rgb))]">TRACK</label>
                                            <Select
                                              className="mt-1"
                                              fullWidth
                                              buttonClassName="w-full"
                                              size="md"
                                              value={String(Math.min(Math.max(currentIndex, 0), sources.length - 1))}
                                              onChange={(val) => updateFocusSettings({ ambientTrackIndex: Number(val) })}
                                              options={trackNames.map((name, idx) => ({ value: String(idx), label: name }))}
                                            />
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer / Sound Toggles */}
                <footer className="relative z-10 flex flex-col items-center justify-center gap-3 p-4 flex-shrink-0">
                    <div className="flex items-center flex-wrap gap-2">
                         {Object.entries(AMBIENT_SOUNDS)
                            .filter(([key, def]) => key !== 'none' && def.srcs.length > 0)
                            .map(([key, {label, srcs}]) => {
                              const isActive = focusSettings.sound === key;
                              const selectedIndex = typeof focusSettings.ambientTrackIndex === 'number' ? focusSettings.ambientTrackIndex : 0;
                              const safeIndex = Math.min(Math.max(selectedIndex, 0), srcs.length - 1);
                              const displayName = `${label} ${safeIndex + 1}`;
                              return (
                                <div key={key} className="relative" ref={isActive && trackMenuFor === key ? trackMenuRef : undefined}>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => updateFocusSettings({ sound: isActive ? 'none' : key as AmbientSound })}
                                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${isActive ? 'bg-[rgba(var(--accent-rgb),0.2)] border-[rgba(var(--accent-rgb))] text-[rgba(var(--accent-rgb))]' : 'border-[rgba(var(--border-primary-rgb))] text-[rgba(var(--foreground-secondary-rgb))] hover:bg-[rgba(var(--background-tertiary-rgb))]'}`}
                                      title={isActive ? displayName : label}
                                    >
                                      {isActive ? displayName : label}
                                    </button>
                                    {isActive && srcs.length > 1 && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const rect = (e.currentTarget.getBoundingClientRect && e.currentTarget.getBoundingClientRect()) || { top: 0, bottom: 0 } as DOMRect;
                                          const spaceBelow = window.innerHeight - rect.bottom;
                                          const spaceAbove = rect.top;
                                          const estimatedHeight = Math.min(srcs.length, 8) * 32 + 24; // approx item height + padding
                                          const placement: 'up' | 'down' = spaceBelow < estimatedHeight && spaceAbove > spaceBelow ? 'up' : 'down';
                                          setTrackMenuPlacement(placement);
                                          setTrackMenuFor(prev => prev === key as AmbientSound ? null : key as AmbientSound);
                                        }}
                                        className="px-2 py-1 text-xs rounded-full border transition-colors border-[rgba(var(--border-primary-rgb))] text-[rgba(var(--foreground-secondary-rgb))] hover:bg-[rgba(var(--background-tertiary-rgb))]"
                                        title={`Choose ${label} track`}
                                      >
                                        {trackMenuFor === key && trackMenuPlacement === 'up' ? '▲' : '▼'}
                                      </button>
                                    )}
                                  </div>
                                  {isActive && trackMenuFor === key && (
                                    <div className={`absolute left-0 ${trackMenuPlacement === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'} w-56 max-h-60 overflow-auto bg-[rgba(var(--background-primary-rgb))] rounded-lg shadow-lg border border-[rgba(var(--border-primary-rgb))] p-2 z-30 animate-fade-in`}>
                                      <ul className="space-y-1">
                                        {srcs.map((_, idx) => (
                                          <li key={idx}>
                                            <button
                                              type="button"
                                              onClick={() => { updateFocusSettings({ ambientTrackIndex: idx }); setTrackMenuFor(null); }}
                                              className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${safeIndex === idx ? 'bg-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-on-accent-rgb))]' : 'text-[rgba(var(--foreground-primary-rgb))] hover:bg-[rgba(var(--background-tertiary-rgb))]'}`}
                                            >
                                              {label} {idx + 1}
                                            </button>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                         <button
                            onClick={() => { setShowMusicPlayer(v => !v); if (!showMusicPlayer) updateFocusSettings({ sound: 'none' }); }}
                            className={`px-3 py-1 text-xs rounded-full border transition-colors ${showMusicPlayer ? 'bg-[rgba(var(--accent-rgb),0.2)] border-[rgba(var(--accent-rgb))] text-[rgba(var(--accent-rgb))]' : 'border-[rgba(var(--border-primary-rgb))] text-[rgba(var(--foreground-secondary-rgb))] hover:bg-[rgba(var(--background-tertiary-rgb))]'}`}
                         >
                            {musicTrackName ? `Music: ${musicTrackName}` : 'Custom Music'}
                         </button>
                    </div>
                </footer>
                
                <audio ref={ambientAudioRef} />
            </div>
        </div>
    );
};

export default FocusModeModal;