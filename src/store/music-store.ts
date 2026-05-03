import { create } from "zustand";
import type { MusicItem } from "@/components/apps/music/core/types";

type PlaybackStatus = "idle" | "loading" | "playing" | "paused" | "error";

interface MusicState {
  currentTrack: MusicItem | null;
  queue: MusicItem[];
  currentIndex: number;
  status: PlaybackStatus;
  volume: number;
  duration: number;
  currentTime: number;
  streamLoadingTrackId: string | null;
  error: string | null;
  seekTarget: number | null;

  // Actions
  playTrack: (track: MusicItem, queue?: MusicItem[], startIndex?: number) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrevious: () => void;
  seek: (time: number) => void;
  clearSeekTarget: () => void;
  setVolume: (volume: number) => void;
  clearPlayer: () => void;

  // Sync Actions for GlobalPlayer
  setStatus: (status: PlaybackStatus) => void;
  setDuration: (duration: number) => void;
  updateProgress: (currentTime: number) => void;
  setError: (error: string | null) => void;
  handleTrackEnd: () => void;
}

export const useMusicStore = create<MusicState>((set, get) => ({
  currentTrack: null,
  queue: [],
  currentIndex: -1,
  status: "idle",
  volume: 0.7,
  duration: 0,
  currentTime: 0,
  streamLoadingTrackId: null,
  error: null,
  seekTarget: null,

  setStatus: (status) =>
    set((state) => ({
      status,
      streamLoadingTrackId: status === "playing" ? null : state.streamLoadingTrackId,
    })),
  setDuration: (duration) => set({ duration }),
  updateProgress: (currentTime) => set({ currentTime }),
  setError: (error) => set({ error, streamLoadingTrackId: null, status: error ? "error" : "idle" }),

  playTrack: (track, queue, startIndex) => {
    const state = get();

    if (state.currentTrack?.id === track.id) {
      // Same track re-selected: resume if paused, and optionally update the queue context
      if (state.status === "paused") {
        set({ status: "playing" });
      }
      if (queue && queue.length > 0) {
        set({ queue, currentIndex: startIndex ?? queue.findIndex((item) => item.id === track.id) });
      }
      return;
    }

    // New track: switch to it
    const nextQueue = queue && queue.length > 0 ? queue : state.queue;
    const nextIndex = startIndex ?? nextQueue.findIndex((item) => item.id === track.id);

    set({
      currentTrack: track,
      queue: nextQueue,
      currentIndex: nextIndex,
      status: "playing",
      currentTime: 0,
      duration: 0,
      error: null,
      seekTarget: null,
      streamLoadingTrackId: track.id,
    });
  },

  handleTrackEnd: () => {
    const { queue, currentIndex } = get();
    const nextTrack = queue[currentIndex + 1];

    if (nextTrack) {
      get().playTrack(nextTrack, queue, currentIndex + 1);
    } else {
      set({ status: "paused", currentTime: 0 });
    }
  },

  togglePlayPause: () => {
    const { status } = get();
    set({ status: status === "playing" ? "paused" : "playing" });
  },

  playNext: () => {
    const { queue, currentIndex } = get();
    const nextTrack = queue[currentIndex + 1];
    if (nextTrack) {
      get().playTrack(nextTrack, queue, currentIndex + 1);
    }
  },

  playPrevious: () => {
    const { currentIndex, currentTime, queue } = get();

    if (currentTime > 3) {
      get().seek(0);
      return;
    }

    if (currentIndex > 0) {
      const prevTrack = queue[currentIndex - 1];
      get().playTrack(prevTrack, queue, currentIndex - 1);
    }
  },

  seek: (time) => {
    set({ seekTarget: time, currentTime: time });
  },

  clearSeekTarget: () => set({ seekTarget: null }),

  setVolume: (volume) => set({ volume }),

  clearPlayer: () => {
    set({
      currentTrack: null,
      queue: [],
      currentIndex: -1,
      status: "idle",
      duration: 0,
      currentTime: 0,
      streamLoadingTrackId: null,
      error: null,
      seekTarget: null,
    });
  },
}));
