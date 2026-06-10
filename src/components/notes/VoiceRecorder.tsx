import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HiMicrophone, HiStop, HiPlay, HiTrash, HiPause } from 'react-icons/hi';
import { loadAudioBlob, saveAudioBlob, deleteAudioBlob } from '@/services/db';

// Detect supported mime types for cross-browser recording
function getSupportedMimeType(): string {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
  for (const t of types) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return 'audio/webm'; // Fallback
}

// ─── Live waveform component (Web Audio API) ───────────────────

interface WaveformProps {
  isPlaying: boolean;
  audioEl: HTMLAudioElement | null;
}

const BAR_COUNT = 40;

const LiveWaveform: React.FC<WaveformProps> = ({ isPlaying, audioEl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const lastAudioElRef = useRef<HTMLAudioElement | null>(null);

  // Size canvas to match container dimensions (handles HiDPI + CSS stretching)
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = container.clientWidth;
      const h = container.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Set up / tear down audio graph and animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!isPlaying || !audioEl || !canvas) {
      // Pause: suspend context (don't close — keep source connection alive)
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
        audioCtxRef.current.suspend().catch(() => {});
      }
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let audioCtx = audioCtxRef.current;

    // Create AudioContext once, reuse across play/pause cycles
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
    }

    // Resume context (needed for autoplay policy — context starts suspended)
    audioCtx.resume().catch(() => {});

    // Create analyser once
    if (!analyserRef.current) {
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.7;
      analyserRef.current = analyser;
    }

    // Reset source when audio element changes (delete→re-record→play scenario)
    if (audioEl !== lastAudioElRef.current) {
      sourceRef.current = null;
      lastAudioElRef.current = audioEl;
    }

    // Connect source ONCE per audio element (createMediaElementSource can only be called once)
    if (!sourceRef.current) {
      try {
        sourceRef.current = audioCtx.createMediaElementSource(audioEl);
        sourceRef.current.connect(analyserRef.current!);
        analyserRef.current!.connect(audioCtx.destination);
      } catch {
        // Element already has a source connected; skip
      }
    }

    const analyser = analyserRef.current!;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!canvas || !ctx) return;
      animRef.current = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const step = Math.floor(bufferLength / BAR_COUNT);
      const barWidth = (width / BAR_COUNT) * 0.7;
      const gap = (width / BAR_COUNT) * 0.3;

      for (let i = 0; i < BAR_COUNT; i++) {
        let sum = 0;
        const binStart = i * step;
        const binEnd = Math.min(binStart + step, bufferLength);
        for (let j = binStart; j < binEnd; j++) sum += dataArray[j];
        const avg = sum / (binEnd - binStart);
        const barHeight = Math.max(2, (avg / 255) * height);

        const x = i * (barWidth + gap);
        const y = height - barHeight;

        const hue = 200 + (i / BAR_COUNT) * 30;
        const lightness = 45 + (avg / 255) * 20;
        ctx.fillStyle = `hsla(${hue}, 80%, ${lightness}%, 0.9)`;

        const radius = Math.min(barWidth / 2, 3);
        ctx.beginPath();
        ctx.moveTo(x, y + barHeight);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.lineTo(x + barWidth - radius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        ctx.lineTo(x + barWidth, y + barHeight);
        ctx.closePath();
        ctx.fill();
      }
    };

    draw();

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
      // Suspend on pause (don't close — keeps source connection valid)
      if (audioCtx.state === 'running') {
        audioCtx.suspend().catch(() => {});
      }
    };
  }, [isPlaying, audioEl]);

  // Final cleanup: close AudioContext only on unmount
  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (audioCtxRef.current?.state !== 'closed') {
        audioCtxRef.current?.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-8">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};


interface VoiceRecorderProps {
  noteId: string;
  audioUrl: string | null;
  onAudioChange: (audioUrl: string | null) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ noteId, audioUrl, onAudioChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load existing audio on mount/change
  useEffect(() => {
    if (audioUrl && audioUrl.startsWith('opfs-audio://')) {
      loadAudioBlob(noteId).then((url) => {
        if (url) setPlaybackUrl(url);
      });
    } else {
      setPlaybackUrl(null);
    }
    return () => {
      if (playbackUrl) URL.revokeObjectURL(playbackUrl);
    };
  }, [audioUrl, noteId]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (playbackUrl) URL.revokeObjectURL(playbackUrl);
    };
  }, [playbackUrl]);

  // Cleanup MediaRecorder on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const mimeType = getSupportedMimeType();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      const selectedMimeType = mimeType;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks
        stream.getTracks().forEach((t) => t.stop());

        const blob = new Blob(chunksRef.current, { type: selectedMimeType });
        try {
          const ref = await saveAudioBlob(noteId, blob);
          onAudioChange(ref);
        } catch (e) {
          setError('Failed to save recording');
          console.error('Save audio error:', e);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch (e) {
      if ((e as DOMException).name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone permissions.');
      } else {
        setError('Could not start recording.');
      }
      console.error('Recording error:', e);
    }
  }, [noteId, onAudioChange]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const togglePlayback = useCallback(() => {
    if (!playbackUrl) return;
    if (!audioRef.current) {
      const audio = new Audio(playbackUrl);
      audio.crossOrigin = 'anonymous';
      audio.onended = () => setIsPlaying(false);
      audio.onpause = () => setIsPlaying(false);
      audio.onplay = () => setIsPlaying(true);
      audioRef.current = audio;
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => setError('Could not play audio'));
    }
  }, [playbackUrl, isPlaying]);

  const handleDelete = useCallback(async () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    // Revoke the blob URL before deleting
    if (playbackUrl) {
      URL.revokeObjectURL(playbackUrl);
      setPlaybackUrl(null);
    }
    await deleteAudioBlob(noteId);
    onAudioChange(null);
  }, [noteId, onAudioChange, playbackUrl]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const hasAudio = !!(audioUrl && audioUrl.startsWith('opfs-audio://'));

  return (
    <div className="flex items-center gap-2 p-3 border border-[rgba(var(--border-primary-rgb))] rounded-xl bg-[rgba(var(--background-secondary-rgb),0.3)]">
      {isRecording ? (
        <>
          {/* Recording indicator */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[rgba(var(--danger-rgb))] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[rgba(var(--danger-rgb))]" />
            </span>
            <span className="text-sm font-mono text-[rgba(var(--danger-rgb))] font-medium tabular-nums">
              {formatTime(duration)}
            </span>
            {/* Waveform bars */}
            <div className="flex items-end gap-[2px] h-5 flex-1 min-w-0 opacity-70">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-[rgba(var(--danger-rgb))] rounded-full animate-pulse"
                  style={{
                    height: `${40 + Math.random() * 60}%`,
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: '0.8s',
                  }}
                />
              ))}
            </div>
          </div>
          <button
            onClick={stopRecording}
            className="flex-shrink-0 p-2 rounded-full bg-[rgba(var(--danger-rgb))] text-white hover:opacity-90 transition-opacity"
            aria-label="Stop recording"
          >
            <HiStop className="w-5 h-5" />
          </button>
        </>
      ) : hasAudio ? (
        <>
          {/* Playback controls */}
          <button
            onClick={togglePlayback}
            className="flex-shrink-0 p-2 rounded-full hover:bg-[rgba(var(--accent-rgb),0.15)] text-[rgba(var(--accent-rgb))] transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <HiPause className="w-5 h-5" /> : <HiPlay className="w-5 h-5" />}
          </button>
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            {isPlaying ? (
              <LiveWaveform isPlaying={isPlaying} audioEl={audioRef.current} />
            ) : (
              <>
                <p className="text-sm text-[rgba(var(--foreground-primary-rgb))] font-medium truncate">
                  Voice note
                </p>
                <p className="text-xs text-[rgba(var(--foreground-secondary-rgb))]">Tap to play</p>
              </>
            )}
          </div>
          <button
            onClick={handleDelete}
            className="flex-shrink-0 p-2 rounded-full hover:bg-[rgba(var(--danger-rgb),0.1)] text-[rgba(var(--foreground-secondary-rgb))] hover:text-[rgba(var(--danger-rgb))] transition-colors"
            aria-label="Delete recording"
          >
            <HiTrash className="w-4 h-4" />
          </button>
          <button
            onClick={startRecording}
            className="flex-shrink-0 p-2 rounded-full hover:bg-[rgba(var(--danger-rgb),0.1)] text-[rgba(var(--foreground-secondary-rgb))] hover:text-[rgba(var(--danger-rgb))] transition-colors"
            aria-label="Re-record"
            title="Re-record"
          >
            <HiMicrophone className="w-4 h-4" />
          </button>
        </>
      ) : (
        <>
          {/* No recording yet */}
          <button
            onClick={startRecording}
            className="flex-shrink-0 p-2 rounded-full hover:bg-[rgba(var(--accent-rgb),0.15)] text-[rgba(var(--accent-rgb))] transition-colors"
            aria-label="Start recording"
            title="Record voice note"
          >
            <HiMicrophone className="w-5 h-5" />
          </button>
          <span className="text-sm text-[rgba(var(--foreground-secondary-rgb))] flex-1">
            Record a voice note
          </span>
        </>
      )}

      {error && (
        <span className="text-xs text-[rgba(var(--danger-rgb))] absolute -bottom-6 left-0">
          {error}
        </span>
      )}
    </div>
  );
};

export default VoiceRecorder;
