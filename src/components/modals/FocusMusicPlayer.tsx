import React, { useEffect, useMemo, useRef, useState } from 'react';
import { HiPlay, HiPause, HiChevronLeft, HiChevronRight, HiVolumeUp, HiVolumeOff, HiUpload, HiTrash, HiRefresh } from 'react-icons/hi';
import { getValue, putValue } from '@/services/db';
import { useAppContext } from '@/hooks/useAppContext';

interface Track {
  id: string;
  name: string;
  url: string;
  blob?: Blob;
}

const PLAYLIST_KV_ID = 'focus_music_tracks_v1';

type Props = {
  visible?: boolean;
  onTrackNameChange?: (name: string | null) => void;
};

const FocusMusicPlayer: React.FC<Props> = ({ visible = true, onTrackNameChange }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(() => {
    try { return Number(localStorage.getItem('musicVolume') || '0.7'); } catch { return 0.7; }
  });
  const [muted, setMuted] = useState<boolean>(false);
  const [shuffle, setShuffle] = useState<boolean>(() => {
    try { return localStorage.getItem('musicShuffle') === '1'; } catch { return false; }
  });
  const [repeat, setRepeat] = useState<boolean>(() => {
    try { return localStorage.getItem('musicRepeat') === '1'; } catch { return false; }
  });
  const { updateFocusSettings } = useAppContext();

  useEffect(() => {
    try { localStorage.setItem('musicVolume', String(volume)); } catch {}
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  useEffect(() => {
    try { localStorage.setItem('musicShuffle', shuffle ? '1' : '0'); } catch {}
  }, [shuffle]);

  useEffect(() => {
    try { localStorage.setItem('musicRepeat', repeat ? '1' : '0'); } catch {}
  }, [repeat]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const track = tracks[currentIndex];
    if (!track) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    if (audio.src !== track.url) {
      audio.src = track.url;
    }
    audio.loop = repeat;
    audio.onended = () => {
      if (repeat) {
        setIsPlaying(true);
        audio.play().catch(() => setIsPlaying(false));
        return;
      }
      if (shuffle && tracks.length > 1) {
        const next = getRandomNextIndex(currentIndex, tracks.length);
        setCurrentIndex(next);
        setIsPlaying(true);
        return;
      }
      if (currentIndex < tracks.length - 1) {
        setCurrentIndex(i => i + 1);
        setIsPlaying(true);
      } else {
        setIsPlaying(false);
      }
    };
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
  }, [tracks, currentIndex, isPlaying]);

  const getRandomNextIndex = (current: number, length: number) => {
    let next = current;
    if (length <= 1) return current;
    while (next === current) {
      next = Math.floor(Math.random() * length);
    }
    return next;
  };

  useEffect(() => {
    // Load persisted playlist from IndexedDB KV store
    const load = async () => {
      const record = await getValue(PLAYLIST_KV_ID);
      const persisted: Array<{ id: string; name: string; blob: Blob }> | undefined = record?.value;
      if (persisted && Array.isArray(persisted)) {
        const loaded = persisted.map(item => ({ id: item.id, name: item.name, url: URL.createObjectURL(item.blob), blob: item.blob }));
        setTracks(loaded);
      }
    };
    load();
    return () => {
      // cleanup object URLs
      setTracks(prev => {
        prev.forEach(t => { try { URL.revokeObjectURL(t.url); } catch {} });
        return prev;
      });
    };
  }, []);

  const persistTracks = async (list: Track[]) => {
    const serializable = list.filter(t => t.blob).map(t => ({ id: t.id, name: t.name, blob: t.blob as Blob }));
    await putValue(PLAYLIST_KV_ID, serializable);
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newTracks: Track[] = [];
    for (const file of Array.from(files)) {
      const url = URL.createObjectURL(file);
      const id = (crypto && 'randomUUID' in crypto) ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
      newTracks.push({ id, name: file.name, url, blob: file });
    }
    setTracks(prev => {
      const combined = [...prev, ...newTracks];
      void persistTracks(combined);
      return combined;
    });
    if (tracks.length === 0) {
      setCurrentIndex(0);
      setIsPlaying(true);
      // Auto-disable ambient when user music starts
      updateFocusSettings({ sound: 'none' });
    }
  };

  const playPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!tracks[currentIndex]) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
        updateFocusSettings({ sound: 'none' });
      }).catch(() => setIsPlaying(false));
    }
  };

  const prevTrack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
      setIsPlaying(true);
    }
  };

  const nextTrack = () => {
    if (shuffle && tracks.length > 1) {
      const next = getRandomNextIndex(currentIndex, tracks.length);
      setCurrentIndex(next);
      setIsPlaying(true);
      return;
    }
    if (currentIndex < tracks.length - 1) {
      setCurrentIndex(i => i + 1);
      setIsPlaying(true);
    }
  };

  const toggleMute = () => setMuted(m => !m);

  const removeTrack = (id: string) => {
    setTracks(prev => {
      const idx = prev.findIndex(t => t.id === id);
      if (idx !== -1) {
        try { URL.revokeObjectURL(prev[idx].url); } catch {}
      }
      const updated = prev.filter(t => t.id !== id);
      void persistTracks(updated);
      if (updated.length === 0) {
        setIsPlaying(false);
      } else if (currentIndex >= updated.length) {
        setCurrentIndex(updated.length - 1);
      }
      return updated;
    });
  };

  const clearPlaylist = () => {
    setTracks(prev => {
      prev.forEach(t => { try { URL.revokeObjectURL(t.url); } catch {} });
      void persistTracks([]);
      return [];
    });
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFilesSelected(files);
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const currentTrackName = useMemo(() => tracks[currentIndex]?.name ?? 'No music selected', [tracks, currentIndex]);

  useEffect(() => {
    if (!onTrackNameChange) return;
    const name = tracks[currentIndex]?.name || null;
    onTrackNameChange(name);
  }, [tracks, currentIndex, onTrackNameChange]);

  return (
    <div className="w-full p-3 rounded-xl bg-[rgba(var(--background-secondary-rgb),0.6)] backdrop-blur-md border border-[rgba(var(--border-primary-rgb))]" onDrop={onDrop} onDragOver={onDragOver} style={{ display: visible ? 'block' : 'none' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="file"
              accept="audio/*"
              multiple
              onChange={e => handleFilesSelected(e.target.files)}
              className="hidden"
            />
            <span className="p-2 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))]" title="Add music files">
              <HiUpload className="w-5 h-5" />
            </span>
            <span className="text-sm text-[rgba(var(--foreground-secondary-rgb))]">Add music</span>
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={prevTrack} className="p-2 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))]" title="Previous">
            <HiChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={playPause} className="p-2 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))]" title={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <HiPause className="w-6 h-6" /> : <HiPlay className="w-6 h-6" />}
          </button>
          <button onClick={nextTrack} className="p-2 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))]" title="Next">
            <HiChevronRight className="w-5 h-5" />
          </button>
          <button onClick={toggleMute} className="p-2 rounded-full hover:bg-[rgba(var(--background-tertiary-rgb))]" title={muted ? 'Unmute' : 'Mute'}>
            {muted ? <HiVolumeOff className="w-5 h-5" /> : <HiVolumeUp className="w-5 h-5" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={muted ? 0 : volume}
            onChange={e => setVolume(Number(e.target.value))}
            className="custom-slider w-28"
            aria-label="Music volume"
          />
        </div>
      </div>
      <div className="mt-2 text-xs text-[rgba(var(--foreground-secondary-rgb))] truncate">
        {`Now playing: ${currentTrackName}`}
      </div>

      {/* Playlist controls */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => setShuffle(s => !s)} className={`px-3 py-1 text-xs rounded-full border transition-colors ${shuffle ? 'bg-[rgba(var(--accent-rgb),0.2)] border-[rgba(var(--accent-rgb))] text-[rgba(var(--accent-rgb))]' : 'border-[rgba(var(--border-primary-rgb))] text-[rgba(var(--foreground-secondary-rgb))] hover:bg-[rgba(var(--background-tertiary-rgb))]'}`}>Shuffle</button>
          <button onClick={() => setRepeat(r => !r)} className={`px-3 py-1 text-xs rounded-full border transition-colors ${repeat ? 'bg-[rgba(var(--accent-rgb),0.2)] border-[rgba(var(--accent-rgb))] text-[rgba(var(--accent-rgb))]' : 'border-[rgba(var(--border-primary-rgb))] text-[rgba(var(--foreground-secondary-rgb))] hover:bg-[rgba(var(--background-tertiary-rgb))]'}`}>Repeat</button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={clearPlaylist} className="px-3 py-1 text-xs rounded-full border border-[rgba(var(--border-primary-rgb))] text-[rgba(var(--foreground-secondary-rgb))] hover:bg-[rgba(var(--background-tertiary-rgb))] flex items-center gap-1" title="Clear playlist">
            <HiTrash className="w-4 h-4" /> Clear
          </button>
        </div>
      </div>

      {/* Track list */}
      {tracks.length > 0 && (
        <ul className="mt-2 max-h-36 overflow-y-auto divide-y divide-[rgba(var(--border-primary-rgb))]">
          {tracks.map((t, idx) => (
            <li key={t.id} className={`py-1 px-1 flex items-center justify-between ${idx === currentIndex ? 'bg-[rgba(var(--background-tertiary-rgb),0.4)] rounded' : ''}`}>
              <button onClick={() => { setCurrentIndex(idx); setIsPlaying(true); }} className="text-sm text-left truncate flex-1">
                {t.name}
              </button>
              <div className="flex items-center gap-2 ml-2">
                <button onClick={() => removeTrack(t.id)} className="p-1 rounded hover:bg-[rgba(var(--background-tertiary-rgb))]" title="Remove">
                  <HiTrash className="w-4 h-4" />
                </button>
                {/* Simple re-order controls */}
                <button onClick={() => {
                  if (idx === 0) return;
                  setTracks(prev => {
                    const copy = [...prev];
                    [copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]];
                    void persistTracks(copy);
                    return copy;
                  });
                }} className="p-1 rounded hover:bg-[rgba(var(--background-tertiary-rgb))]" title="Move up">
                  <HiChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => {
                  if (idx === tracks.length - 1) return;
                  setTracks(prev => {
                    const copy = [...prev];
                    [copy[idx + 1], copy[idx]] = [copy[idx], copy[idx + 1]];
                    void persistTracks(copy);
                    return copy;
                  });
                }} className="p-1 rounded hover:bg-[rgba(var(--background-tertiary-rgb))]" title="Move down">
                  <HiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <audio ref={audioRef} />
    </div>
  );
};

export default FocusMusicPlayer;