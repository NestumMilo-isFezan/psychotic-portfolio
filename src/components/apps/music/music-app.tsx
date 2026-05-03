import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Pause,
  Play,
  RefreshCw,
  SkipBack,
  SkipForward,
  Volume2,
  Music2,
} from "lucide-react";
import styles from "./music-app.module.css";
import { normalizeMusicTrack } from "../../../features/music/normalizeTrack";
import type { HomeFeedResponse, MusicItem } from "../../../features/music/types";
import { useMusicStore } from "@/store/music-store";
import type { AppProps } from "@/components/apps/app-registry";

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const SectionDivider: React.FC<{ title: string }> = ({ title }) => (
  <div className={styles.divider}>
    <span className={styles.dividerDecoLeft}>▓▒░</span>
    <span className={styles.dividerTitle}>{title}</span>
    <span className={styles.dividerDecoRight}>░▒▓</span>
  </div>
);

export const MusicApp: React.FC<AppProps> = ({ windowId }) => {
  void windowId;
  const currentTrack = useMusicStore((state) => state.currentTrack);
  const status = useMusicStore((state) => state.status);
  const queue = useMusicStore((state) => state.queue);
  const currentIndex = useMusicStore((state) => state.currentIndex);
  const volume = useMusicStore((state) => state.volume);
  const duration = useMusicStore((state) => state.duration);
  const currentTime = useMusicStore((state) => state.currentTime);
  const streamLoadingTrackId = useMusicStore((state) => state.streamLoadingTrackId);
  const playTrack = useMusicStore((state) => state.playTrack);
  const togglePlayPause = useMusicStore((state) => state.togglePlayPause);
  const playNext = useMusicStore((state) => state.playNext);
  const playPrevious = useMusicStore((state) => state.playPrevious);
  const seek = useMusicStore((state) => state.seek);
  const setVolume = useMusicStore((state) => state.setVolume);

  const { data, isLoading, error, refetch, isFetching } = useQuery<HomeFeedResponse>({
    queryKey: ["ytm-history"],
    queryFn: async () => {
      const response = await fetch("/api/ytm/history");
      if (!response.ok) throw new Error("Failed to fetch history");
      return response.json();
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const tracks = (data?.tracks || [])
    .map((track) => normalizeMusicTrack(track))
    .filter((track): track is MusicItem => track !== null);

  const progress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;
  const isPlaying = status === "playing";
  const canPlay = Boolean(currentTrack) && status !== "loading";
  const canGoNext = currentIndex >= 0 && currentIndex < queue.length - 1;
  const canGoPrevious = currentIndex > 0 || currentTime > 3;

  const handleTrackSelect = (track: MusicItem, index: number) => {
    playTrack(track, tracks, index);
  };

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
      return (
        <div className={styles.stateMessage}>
          ERR_MEMORY: {(error as Error).message}
        </div>
      );
    }

    if (tracks.length === 0) {
      return <div className={styles.stateMessage}>NO_TRACKS_IN_VOID</div>;
    }

    return (
      <div className={styles.trackList}>
        {tracks.map((track, index) => {
          const isCurrentPlaying = currentTrack?.id === track.id;
          const isItemLoading = streamLoadingTrackId === track.id;

          return (
            <div
              key={`${track.id}-${index}`}
              className={`${styles.trackItem} ${isCurrentPlaying ? styles.activeTrack : ""}`}
              onClick={() => handleTrackSelect(track, index)}
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
        })}
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
            <div className={styles.nowPlayingTitle}>
              {currentTrack?.title || "—"}
            </div>
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

          {/* Progress */}
          <div className={styles.progressSection}>
            <div className={styles.progressMeta}>
              <span>{formatTime(currentTime)}</span>
              <span className={styles.queuePosition}>
                {currentTrack ? `${currentIndex + 1} / ${queue.length}` : "—"}
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
              disabled={!currentTrack || duration <= 0}
              data-cursor-mode="pointer"
              style={{ "--progress": `${progress}%` } as React.CSSProperties}
            />
          </div>

          {/* Volume */}
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
        </div>
      </div>

      {/* ── TRACK BROWSER ── */}
      <div className={styles.browserHeaderRow}>
        <SectionDivider title="LISTEN_AGAIN" />
        <div className={styles.browserMeta}>
          {tracks.length > 0 && (
            <span className={styles.countBadge}>{tracks.length} tracks</span>
          )}
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
