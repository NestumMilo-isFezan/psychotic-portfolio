import { useState, useEffect, useRef } from "react";
import { Music2, Pause, Play, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useMusicStore } from "@/store/music-store";
import { useWindowStore } from "@/store/window-store";
import styles from "./music-item.module.css";

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

export const MusicItem: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const {
    currentTrack,
    status,
    queue,
    currentIndex,
    duration,
    currentTime,
    volume,
    error,
    togglePlayPause,
    playNext,
    playPrevious,
    seek,
    setVolume,
    setHasStartedMusic,
  } = useMusicStore(
    useShallow((state) => ({
      currentTrack: state.currentTrack,
      status: state.status,
      queue: state.queue,
      currentIndex: state.currentIndex,
      duration: state.duration,
      currentTime: state.currentTime,
      volume: state.volume,
      error: state.error,
      togglePlayPause: state.togglePlayPause,
      playNext: state.playNext,
      playPrevious: state.playPrevious,
      seek: state.seek,
      setVolume: state.setVolume,
      setHasStartedMusic: state.setHasStartedMusic,
    })),
  );

  const windows = useWindowStore((state) => state.windows);
  const addWindow = useWindowStore((state) => state.addWindow);
  const focusWindow = useWindowStore((state) => state.focusWindow);

  useEffect(() => {
    if (!currentTrack) setIsOpen(false);
  }, [currentTrack]);

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setIsOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("mousedown", handlePointerDown);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const openMusicWindow = () => {
    setHasStartedMusic(true);
    const existing = windows.find((w) => w.appName === "MUSIC");
    if (existing) {
      focusWindow(existing.id);
      setIsOpen(false);
      return;
    }
    addWindow({
      id: `music-${Date.now()}`,
      title: "music.app",
      x: Math.max(60, window.innerWidth / 2 - 450),
      y: Math.max(60, window.innerHeight / 2 - 350),
      width: 900,
      height: 700,
      appName: "MUSIC",
      iconName: "AUDIO",
    });
    setIsOpen(false);
  };

  const progress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;
  const isPlaying = status === "playing";
  const canPlay = Boolean(currentTrack) && status !== "loading";
  const canGoNext = currentIndex >= 0 && currentIndex < queue.length - 1;
  const canGoPrevious = currentIndex > 0 || currentTime > 3;

  if (!currentTrack) return null;

  return (
    <div className={styles.playerMenu} ref={ref}>
      <button
        className={`${styles.playerToggle} ${styles.playerToggleActive}`}
        onClick={() => setIsOpen((o) => !o)}
        data-cursor-mode="pointer"
        aria-label="Open music player"
      >
        <Music2 size={14} />
      </button>

      {isOpen && (
        <div className={styles.playerDropdown}>
          <div className={styles.playerHeader}>
            <span className={styles.playerEyebrow}>Menu Bar Player</span>
            <button
              className={styles.openMusicButton}
              onClick={openMusicWindow}
              data-cursor-mode="pointer"
            >
              Open Music
            </button>
          </div>

          <div className={styles.playerHero}>
            <div className={styles.playerArtworkWrap}>
              {currentTrack.thumbnail ? (
                <img
                  src={currentTrack.thumbnail}
                  alt={currentTrack.title}
                  className={styles.playerArtwork}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className={styles.playerArtworkFallback}>
                  <Music2 size={24} />
                </div>
              )}
            </div>
            <div className={styles.playerMeta}>
              <span className={styles.playerStatus}>
                {status === "loading" ? "BUFFERING" : status.toUpperCase()}
              </span>
              <strong className={styles.playerTitle}>
                {currentTrack.title || "No track selected"}
              </strong>
              <span className={styles.playerArtist}>
                {currentTrack.artist || "Open Music and choose a recent track."}
              </span>
            </div>
          </div>

          {error && <div className={styles.playerError}>{error}</div>}

          <div className={styles.playerControls}>
            <button
              className={styles.controlButton}
              onClick={() => playPrevious()}
              disabled={!canGoPrevious}
              data-cursor-mode="pointer"
              aria-label="Previous track"
            >
              <SkipBack size={16} />
            </button>
            <button
              className={styles.playButton}
              onClick={togglePlayPause}
              disabled={!canPlay}
              data-cursor-mode="pointer"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button
              className={styles.controlButton}
              onClick={() => playNext()}
              disabled={!canGoNext}
              data-cursor-mode="pointer"
              aria-label="Next track"
            >
              <SkipForward size={16} />
            </button>
          </div>

          <div className={styles.progressBlock}>
            <div className={styles.progressMeta}>
              <span>{formatTime(currentTime)}</span>
              <span>
                {currentTrack
                  ? `${Math.max(currentIndex + 1, 1)} / ${Math.max(queue.length, 1)}`
                  : "IDLE"}
              </span>
              <span>{formatTime(duration)}</span>
            </div>
            <input
              className={styles.progressSlider}
              type="range"
              min={0}
              max={duration || 0}
              step={1}
              value={Math.min(currentTime, duration || 0)}
              onChange={(e) => seek(Number(e.target.value))}
              disabled={!currentTrack || duration <= 0}
              data-cursor-mode="pointer"
              style={{ "--progress": `${progress}%` } as React.CSSProperties}
            />
          </div>

          <div className={styles.volumeRow}>
            <span className={styles.volumeLabel}>
              <Volume2 size={14} /> Volume
            </span>
            <input
              className={styles.volumeSlider}
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              data-cursor-mode="pointer"
              style={{ "--progress": `${volume * 100}%` } as React.CSSProperties}
            />
          </div>
        </div>
      )}
    </div>
  );
};
