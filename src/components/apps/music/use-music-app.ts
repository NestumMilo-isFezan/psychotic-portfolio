import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMusicStore } from "@/store/music-store";
import { normalizeMusicTrack } from "./core/normalize-track";
import type { HomeFeedResponse, MusicItem } from "./core/types";

export function useMusicApp() {
  const currentTrack = useMusicStore((state) => state.currentTrack);
  const status = useMusicStore((state) => state.status);
  const queue = useMusicStore((state) => state.queue);
  const currentIndex = useMusicStore((state) => state.currentIndex);
  const streamLoadingTrackId = useMusicStore((state) => state.streamLoadingTrackId);
  const playTrack = useMusicStore((state) => state.playTrack);
  const togglePlayPause = useMusicStore((state) => state.togglePlayPause);
  const playNext = useMusicStore((state) => state.playNext);
  const playPrevious = useMusicStore((state) => state.playPrevious);

  // Use a selector for canGoPrevious to only re-render when it actually changes
  const canGoPrevious = useMusicStore(
    (state) => state.currentIndex > 0 || state.currentTime > 3,
  );

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

  const tracks = useMemo(() => {
    return (data?.tracks || [])
      .map((track) => normalizeMusicTrack(track))
      .filter((track): track is MusicItem => track !== null);
  }, [data?.tracks]);

  const isPlaying = status === "playing";
  const canPlay = Boolean(currentTrack) && status !== "loading";
  const canGoNext = currentIndex >= 0 && currentIndex < queue.length - 1;

  const handleTrackSelect = (track: MusicItem, index: number) => {
    playTrack(track, tracks, index);
  };

  return {
    currentTrack,
    status,
    queue,
    currentIndex,
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
  };
}
