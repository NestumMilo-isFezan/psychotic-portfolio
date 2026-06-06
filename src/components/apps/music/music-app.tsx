import React, { memo } from "react";
import { Pause, Play, RefreshCw, SkipBack, SkipForward, Volume2, Music2, WifiOff } from "lucide-react";
import styles from "./music-app.module.css";
import type { AppProps } from "@/components/apps/app-registry";
import { useMusicStore } from "@/store/music-store";
import { useMusicApp } from "./use-music-app";
import type { MusicItem } from "./core/types";

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const SectionDivider: React.FC<{ title: string }> = memo(({ title }) => (
  <div className={styles.divider}>
    <span className={styles.dividerDecoLeft}>▓▒░</span>
    <span className={styles.dividerTitle}>{title}</span>
    <span className={styles.dividerDecoRight}>░▒▓</span>
  </div>
));

SectionDivider.displayName = "SectionDivider";

const PlaybackProgress: React.FC = () => {
  const currentTime = useMusicStore((state) => state.currentTime);
  const duration = useMusicStore((state) => state.duration);
  const currentIndex = useMusicStore((state) => state.currentIndex);
  const queue = useMusicStore((state) => state.queue);
  const currentTrack = useMusicStore((state) => state.currentTrack);
  const seek = useMusicStore((state) => state.seek);
  const setSeeking = useMusicStore((state) => state.setSeeking);

  const progress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;
  const hasTrack = !!currentTrack;

  return (
    <div className={styles.progressSection}>
      <div className={styles.progressMeta}>
        <span>{formatTime(currentTime)}</span>
        <span className={styles.queuePosition}>
          {hasTrack ? `${currentIndex + 1} / ${queue.length}` : "—"}
        </span>
        <span>{formatTime(duration)}</span>
      </div>
      <input
        className={styles.slider}
        type="range"
        min={0}
        max={duration || 0}
        step={1}
        value={Math.min(currentTime, duration || 0)}
        onChange={(e) => seek(Number(e.target.value))}
        onMouseDown={() => setSeeking(true)}
        onMouseUp={() => setSeeking(false)}
        onTouchStart={() => setSeeking(true)}
        onTouchEnd={() => setSeeking(false)}
        disabled={!hasTrack || duration <= 0}
        data-cursor-mode="pointer"
        style={{ "--progress": `${progress}%` } as React.CSSProperties}
      />
    </div>
  );
};

const VolumeControl: React.FC = () => {
  const volume = useMusicStore((state) => state.volume);
  const setVolume = useMusicStore((state) => state.setVolume);

  return (
    <div className={styles.volumeRow}>
      <Volume2 size={13} />
      <input
        className={styles.slider}
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        data-cursor-mode="pointer"
        style={{ "--progress": `${volume * 100}%` } as React.CSSProperties}
      />
      <span className={styles.volumeValue}>{Math.round(volume * 100)}%</span>
    </div>
  );
};

interface TrackItemProps {
  track: MusicItem;
  index: number;
  isCurrentPlaying: boolean;
  isItemLoading: boolean;
  isPlaying: boolean;
  onSelect: (track: MusicItem, index: number) => void;
}

const TrackItem: React.FC<TrackItemProps> = memo(
  ({ track, index, isCurrentPlaying, isItemLoading, isPlaying, onSelect }) => {
    return (
      <div
        className={`${styles.trackItem} ${isCurrentPlaying ? styles.activeTrack : ""}`}
        onClick={() => onSelect(track, index)}
        data-cursor-mode="pointer"
      >
        <div className={styles.trackThumbnail}>
          {track.thumbnail && (
            <img
              src={track.thumbnail}
              alt={track.title}
              className={styles.thumbnailImg}
              referrerPolicy="no-referrer"
            />
          )}
          <div className={styles.thumbnailOverlay}>
            {isItemLoading ? (
              <RefreshCw className={styles.refreshing} size={18} />
            ) : isCurrentPlaying ? (
              <Volume2 size={18} />
            ) : (
              <Play size={18} />
            )}
          </div>
        </div>

        <div className={styles.trackInfo}>
          <div className={styles.trackName}>{track.title}</div>
          <div className={styles.trackArtist}>{track.artist}</div>
        </div>

        <div className={styles.trackStatus}>
          {isCurrentPlaying && (
            <span className={styles.statusBadge}>
              {isItemLoading ? "TUNING" : isPlaying ? "LIVE" : "PAUSED"}
            </span>
          )}
        </div>
      </div>
    );
  },
);

TrackItem.displayName = "TrackItem";

export const MusicApp: React.FC<AppProps> = ({ windowId }) => {
  void windowId;
  const {
    currentTrack,
    status,
    streamLoadingTrackId,
    isLoading,
    error,
    refetch,
    isFetching,
    tracks,
    isPlaying,
    canPlay,
    canGoNext,
    canGoPrevious,
    handleTrackSelect,
    togglePlayPause,
    playNext,
    playPrevious,
    isUsingFallback,
  } = useMusicApp();

  const renderTrackList = () => {
    if (isLoading) {
      return (
        <div className={styles.stateMessage}>
          <RefreshCw size={14} className={styles.refreshing} />
          LOADING_HISTORY...
        </div>
      );
    }

    if (error) {
      return <div className={styles.stateMessage}>ERR_MEMORY: {(error as Error).message}</div>;
    }

    if (tracks.length === 0) {
      return <div className={styles.stateMessage}>NO_TRACKS_IN_VOID</div>;
    }

    return (
      <div className={styles.trackList}>
        {tracks.map((track, index) => (
          <TrackItem
            key={`${track.id}-${index}`}
            track={track}
            index={index}
            isCurrentPlaying={currentTrack?.id === track.id}
            isItemLoading={streamLoadingTrackId === track.id}
            isPlaying={isPlaying}
            onSelect={handleTrackSelect}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* ── PLAYER HEADER ── */}
      <SectionDivider title="AUDITORY_SYNC" />
      <div className={styles.subtitle}>
        <span className={styles.subtitlePrompt}>&gt;</span>
        <span className={styles.subtitleText}>
          {currentTrack ? currentTrack.title : "Select a track to begin transmission"}
        </span>
        <span className={styles.subtitleCursor}>▮</span>
      </div>

      {/* ── SESSION EXPIRED BANNER ── */}
      {isUsingFallback && (
        <div className={styles.offlineBanner}>
          <WifiOff size={11} />
          <span>SESSION_EXPIRED // PLAYING OFFLINE LIBRARY</span>
        </div>
      )}

      {/* ── DECK ── */}
      <div className={styles.deck}>
        <div className={styles.artworkFrame}>
          {currentTrack?.thumbnail ? (
            <img
              src={currentTrack.thumbnail}
              alt={currentTrack.title}
              className={styles.artworkImg}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className={styles.artworkFallback}>
              <Music2 size={36} />
            </div>
          )}
          <div className={styles.scanlines} aria-hidden="true" />
          <div className={styles.statusBadgeOverlay}>
            {status === "loading" ? "TUNING" : status.toUpperCase()}
          </div>
        </div>

        <div className={styles.deckBody}>
          {/* Track identity */}
          <div className={styles.trackMeta}>
            <div className={styles.nowPlayingLabel}>NOW PLAYING</div>
            <div className={styles.nowPlayingTitle}>{currentTrack?.title || "—"}</div>
            <div className={styles.nowPlayingArtist}>
              {currentTrack?.artist || "Awaiting signal..."}
            </div>
          </div>

          {/* Transport */}
          <div className={styles.transport}>
            <button
              className={styles.controlBtn}
              onClick={() => playPrevious()}
              disabled={!canGoPrevious}
              data-cursor-mode="pointer"
              aria-label="Previous track"
            >
              <SkipBack size={16} />
            </button>
            <button
              className={styles.playBtn}
              onClick={togglePlayPause}
              disabled={!canPlay}
              data-cursor-mode="pointer"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button
              className={styles.controlBtn}
              onClick={() => playNext()}
              disabled={!canGoNext}
              data-cursor-mode="pointer"
              aria-label="Next track"
            >
              <SkipForward size={16} />
            </button>
          </div>

          <PlaybackProgress />
          <VolumeControl />
        </div>
      </div>

      {/* ── TRACK BROWSER ── */}
      <div className={styles.browserHeaderRow}>
        <SectionDivider title={isUsingFallback ? "OFFLINE_LIBRARY" : "LISTEN_AGAIN"} />
        <div className={styles.browserMeta}>
          {tracks.length > 0 && <span className={styles.countBadge}>{tracks.length} tracks</span>}
          <button
            className={styles.refreshBtn}
            onClick={() => refetch()}
            disabled={isFetching}
            data-cursor-mode="pointer"
          >
            <RefreshCw size={11} className={isFetching ? styles.refreshing : ""} />
            {isFetching ? "REFRESHING" : "REFRESH"}
          </button>
        </div>
      </div>

      {renderTrackList()}
    </div>
  );
};
