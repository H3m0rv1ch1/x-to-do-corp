import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { HiX, HiPlay, HiPause, HiRefresh, HiCog, HiCheck, HiArrowsExpand, HiOutlineArrowsExpand, HiVolumeUp, HiVolumeOff } from 'react-icons/hi';
import { useAppContext } from '@/hooks/useAppContext';
import { SessionMode, AmbientSound } from '@/contexts/AppContext';


const AMBIENT_SOUNDS: Record<AmbientSound, { label: string, src: string }> = {
    none: { label: 'None', src: '' },
    rain: { label: 'Rain', src: 'data:audio/wav;base64,UklGRigSAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABgAZGF0YRIgAADI/wA5APsA7QEnAUABDgImAhoCgAHw/3D/ov+w/7L/w//D/8wA0wDeAPEBIgEsATgBPwFOAVIBWAFhAW4BdQF9AYcBkQGbAZ8BpQGpAawBswG+AccB0QHXAdwB4gHjAecB7AHwAfQB+gH/AgECCQIhAk0CWQJlAnECdQJ7ApECmwKlAq0CtgLBAsoCzQLUAt4C5ALoAvAC+wMBAwYDDQMhAyADIwMmAysDNwNIA1sDYwNzA3gDggOOA5IDlwOgA6gDrgO7A8ED0wPgA+wD+gQABAkEGQQvBDYEUQRgBGwEcQR+BJgEoASsBLYExATGxPbk9uT35vlq+sr7/v1L/ZMBFwL/A/gEhgT4BOwFKwX3Be8GIwdDB0wHiwfZB/cJEgnSCgIKsAr0CzsLzQwIDRENPg2ADZsOEQ5DD0EPig/jEBgREhGfEewTKhOkFEgU8xXDFewWKBfIGCYYpRlBGd0doh36HxgfMyAyISQhpiGzIe0i+yPjI/slAyoDKsMrwy7EMM8xSzEgMfkyhTMoM7sz6DQaNRA17jZcNv83/jgVORA5hDqHOwM8DT2LPrM/9EBlQhJDeET8RkZIF0k/SppKm0sNS0VMMU0zTldOWk9/UChQqlFuUnNTzVTuVWxXcFh6WX9aSVrLW8Vdrl+WYG1jjGO/ZQBmK2f/aNRpy2rua/Jsm2+ccBtxhXSauOQ51joKOr878DwSPJ498D42P/ZA8kIeQ/JFJkVcSSZLIkxcTl5Po1DZUv9VF1gGWcJaFlwAXiBhgmP4ZQBmBWhgaP1q+mzWb/VxRXOjdQF2DXlVeyV/NYBdg6WHvY6Vkv+UvZrfnZSdoZ5noJagpqGnsaimqKqrqqysrq+wsLCysrO0tLS1tba3t7e4ubm5uru7u7y8vLz9/f3+/v7////AAAAA==' },
    cafe: { label: 'Cafe', src: 'data:audio/wav;base64,UklGRkYVAABXQVZFZm10IBAAAAABAAIARKwAAIhYAQAEABgAZGF0YUAWAAARABkAIwAoAD0AVABpAH8AigCWAJwAnwCiAKgArACzALsAwwDPANMA1gDeAOEA5wDsAPYA+AEFAQ4BJgEsAT8BUgFeAWYBbAF4AYMBhQGTAaEBoQGlAbABtQG/AcIBxwHTAeIB6QHyAfsCAQIFAgsCEgIbAikCQQJGAlACXAJmAnoCewKFApsCogKyAs8C4wLsAv0DDwMVAyEDJQMvAzUDQQNKAzIDNgNIA1sDWgNkA2kDewOCA4YDkQOXA5kDoQOmA60DtQPEA8sD1APbA+AD5wP6BAQECgQaBCcENQRCBFIEYARqBHMEmgSpBLYExQTPBNwE6QTYBO0E7QT6BP8FAgUABQQGBAUEBwQIBQcFCAQIBgYJCAcFCAkFCQYIBwkHCggJBQgIBwkHCQcJBwkHCQcJBwkHCAcJBwkHCQcJBwkHCAcJBwkHCQcJBwkHCAcJBwkHCQcJBwkHCAgJBwkHCAgJBwkHCAgJBwkHCAcJBwkHCAgIBwkHCAgJBwkHCAgJBwkHCAgIBwkHCAgIBwkHCAgJBwkHCAgJBwkHCAcIBwkHCAcIBwkHCAgIBwkHCAcIBwkHCAcIBwkHCAcJBwkHCAcJBwkHCAgJBwkHCAgJBwkHCAgJBwkHCAcJBwkHCAcJBwkHCAgJBwkHCAgJBwkHCAcJBwkHCAgJBwkHCAcJBwkHCAgIBwkHCAgIBwkHCAcJBwkHCAcJBwkHCAcIBwkHCAcJBwkHCQcJBwkHCQcJBwkHCAcJBwkHCQcIBwkHCAcIBw==' },
    forest: { label: 'Forest', src: 'data:audio/wav;base64,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4UoR4bN91DDFhCbyh5hIlskdObuKNRt4nIStwI9QADFhQdKk08Skhg1m/Wf3SN8ZnNpl+u1sjQ0+nh4PLW+s8AIhO+Ims4xkWGYG9yNn+LiXyRnpTCm2GgqaRhrGmuwbiXwrnFlsrBzeTQ89d628ve9+N35O3oN+wA7kLwM/H88+H1F/Zk9xb3o/g9+Xj6Eftc/P7+wAFwAvoC8wVDBq0IsQrGDMMOLhH1E2gV/RdgGQgbMB4nIC8iZyS7Jv0rhy9/MS0zwzXPN8U6zDyJPgRB7kVoSnFOiVQnWDRhH2cjc2x5e4N+RYOJim2PoJVwmV+g0abHr/XEjcsj0hXaT+Ew6K7wQvnqARUJfBEcGO4jVzLqOlU//EigTe5Z82iMdqN9yIVGjh6YjJ70p761o724xr3LIdTB3PXm8vLu+t7+1AJaC3cQ1hglHpUv1DkORfNO11tLdLJ/b4Wcj3OY2qQtt53IuNLa4m/zQAFaFCEi2DfIQ7dQdWFzcrF8qISUjmKQxpX+n4Kq4rVrvX7CycV0zF/TQtj/4Dbn/OnK8Mvz5fke/d8C0g+FGoIifzN2Qf5MBlNlW0FjM2oHc056Rnx/hUWK2o/sljKacp8NqOStz70GxoXNYdWV4S7qdfL9/JIC6g8VGl0j3DHnQC9LaVTpX11l82vJdN98eH89hfeNx5V4nC6imKjDr73Cr8e6z+bV/eCA58fsh/WbAB4S3R+FL8E/3k26WeZlK3P+fHiE95H3mOCg46fBrpW+J8bYztnbLeYt8d8BwRC3HIAvKUSuYI5uYnqshf+OWJj+n1+1p8vj2Nfx+AIgFrwa/B72ImYxUDqgQMZGQU5LVFNgS2NRaU5lVmpcb1B1X3ldf2FzZHRnZWhia2Rqa3BrbW5wcnV1dHZ5fH19f3+BgYKBhYWGh4eIiYmKjIyMi4yOj4+QkJGSkpKSkpOUlZaXl5eYmZmampubnJ2en5+goaKjpKSkpaanqKmqq6ytrq+wsbKztLS0tba3ubq7vL2+v8DBwsPExcZHyMnKy8zNzc7P0NHS09TV1tfY2drb3N3e3+Di4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/BgsHCQcJBwkHCQcJBwkHCAcJBwkHCQcJBwkHCAcJBwkHCQcJBwkHCAcJBwkHCQcJBwkHCAcJBwkHCQcJBwkHCAgIBwkHCAcJBwkHCAgIBwkHCAgJBwkHCQcIBwkHCAgIBwkHCQcJBwkHCQcIBwkHCAcIBwkHCAgIBwkHCQcIBwkHCAcJBwkHCAgIBwkHCQcJBwkHCAcJBwkHCQcJBwkHCAcJBwkHCAcJBwkHCAcJBwkHCQcJBwkHCAcIBwkHCAcJBwkHCQcJBwkHCAcIBwkHCAcJBwkHCAcIBwkHCAcJBwkHCAgIBwkHCAgIBwkHCAcIBwkHCAcIBwkHCAcJBwkHCAgJBwkHCAgJBwkHCAgJBwkHCAgJBwkHCAcJBwkHCAcJBwkHCAcJBwkHCAcJBwkHCAcJBwkHCQcJBwkHCAcJBwkHCAcJBwkHCAcJBwkHCQcIBw==' },
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
    
    const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
    const modalContentRef = useRef<HTMLDivElement>(null);
    
    const resetTimer = useCallback(() => {
        const duration = (mode === 'focus' ? focusSettings.focusDuration : mode === 'shortBreak' ? focusSettings.shortBreakDuration : focusSettings.longBreakDuration) * 60;
        changeFocusMode(mode);
    }, [mode, focusSettings, changeFocusMode]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };
    
    // Ambient Sound
    useEffect(() => {
        const audio = ambientAudioRef.current;
        if(audio) {
            if(focusSettings.sound !== 'none' && AMBIENT_SOUNDS[focusSettings.sound].src && isActive) {
                if(audio.src !== AMBIENT_SOUNDS[focusSettings.sound].src) {
                    audio.src = AMBIENT_SOUNDS[focusSettings.sound].src;
                }
                audio.loop = true;
                audio.volume = focusSettings.volume;
                audio.play().catch(e => console.error("Audio play failed:", e));
            } else {
                audio.pause();
            }
        }
    }, [focusSettings.sound, focusSettings.volume, isActive]);
    
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

    useEffect(() => {
        const handleFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFullScreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
    }, []);

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
                className={`relative bg-[rgba(var(--background-primary-rgb))] w-full h-full transform transition-all flex flex-col ${isFullScreen ? '' : 'sm:rounded-2xl sm:shadow-lg sm:max-w-2xl sm:max-h-[90vh]'}`}
            >
                {/* Visual Timer Background */}
                 <div className="focus-bg-gradient" style={{ height: `${100 - progress}%` }} />
                 <div className="focus-bg-gradient" style={{ top: 'auto', bottom: 0, height: `${progress}%` }}></div>


                {/* Header */}
                <header className="relative z-10 flex items-center justify-between p-4 flex-shrink-0">
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
                <main className="focus-main-content relative z-10 p-6 sm:p-8 text-center flex-grow flex flex-col justify-center items-center overflow-y-auto">
                    <p className="text-lg text-[rgba(var(--foreground-secondary-rgb))] mb-2">Focusing on:</p>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-6 truncate max-w-full">{activeFocusTodo.text}</h3>
                    
                    <div className="flex items-center justify-center space-x-2 my-6">
                        <ModeButton value="focus" label="Focus" />
                        <ModeButton value="shortBreak" label="Short Break" />
                        <ModeButton value="longBreak" label="Long Break" />
                    </div>

                    <div className="my-8">
                        <div className={`focus-timer text-7xl sm:text-8xl font-bold ${isActive ? 'animate-focus-pulse' : ''}`}>{formatTime(timeRemaining)}</div>
                    </div>

                    <div className="flex justify-center items-center space-x-4">
                         <button onClick={toggleFocusSessionActive} className="bg-[rgba(var(--accent-rgb))] text-[rgba(var(--foreground-on-accent-rgb))] w-20 h-20 rounded-full flex items-center justify-center text-3xl shadow-lg hover:opacity-90 transition-opacity">
                            {isActive ? <HiPause className="w-10 h-10"/> : <HiPlay className="w-10 h-10"/>}
                        </button>
                         <button onClick={resetTimer} className="bg-[rgba(var(--background-secondary-rgb),0.5)] backdrop-blur-sm text-[rgba(var(--foreground-primary-rgb))] w-14 h-14 rounded-full flex items-center justify-center text-xl shadow-lg hover:bg-[rgba(var(--border-primary-rgb))] transition-colors">
                            <HiRefresh className="w-7 h-7"/>
                        </button>
                    </div>

                    <p className="text-sm text-[rgba(var(--foreground-secondary-rgb))] mt-6">
                        Completed Cycles: <span className="font-bold text-[rgba(var(--foreground-primary-rgb))]">{cycles}</span>
                    </p>

                    {/* Subtasks */}
                    {activeFocusTodo.subtasks && activeFocusTodo.subtasks.length > 0 && (
                        <div className="w-full max-w-sm mt-8 p-4 bg-[rgba(var(--background-secondary-rgb),0.5)] backdrop-blur-sm rounded-lg text-left">
                            <h4 className="font-bold mb-2">Subtasks</h4>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
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
                        </div>
                    )}
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
                                <div className="flex items-center space-x-2 mt-2">
                                    <select value={focusSettings.sound} onChange={e => updateFocusSettings({ sound: e.target.value as AmbientSound })}>
                                        {Object.entries(AMBIENT_SOUNDS).map(([key, {label}]) => <option key={key} value={key}>{label}</option>)}
                                    </select>
                                    <button onClick={() => updateFocusSettings({ volume: focusSettings.volume > 0 ? 0 : 0.5 })} className="p-2">
                                        {focusSettings.volume > 0 ? <HiVolumeUp className="w-5 h-5"/> : <HiVolumeOff className="w-5 h-5"/>}
                                    </button>
                                </div>
                                <input type="range" min="0" max="1" step="0.05" value={focusSettings.volume} onChange={e => updateFocusSettings({ volume: Number(e.target.value)})} className="custom-slider mt-2" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer / Sound Player */}
                <footer className="relative z-10 flex items-center justify-center p-4 flex-shrink-0">
                    <div className="flex items-center space-x-2">
                         {Object.entries(AMBIENT_SOUNDS).map(([key, {label}]) => key !== 'none' && (
                            <button key={key} onClick={() => updateFocusSettings({ sound: focusSettings.sound === key ? 'none' : key as AmbientSound })} className={`px-3 py-1 text-xs rounded-full border transition-colors ${focusSettings.sound === key ? 'bg-[rgba(var(--accent-rgb),0.2)] border-[rgba(var(--accent-rgb))] text-[rgba(var(--accent-rgb))]' : 'border-transparent text-[rgba(var(--foreground-secondary-rgb))] hover:bg-[rgba(var(--background-tertiary-rgb))]'}`}>{label}</button>
                         ))}
                    </div>
                </footer>
                
                <audio ref={ambientAudioRef} />
            </div>
        </div>
    );
};

export default FocusModeModal;