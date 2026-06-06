import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMusicStore } from "@/store/music-store";
import { normalizeMusicTrack } from "./core/normalize-track";
import type { HomeFeedResponse, MusicItem } from "./core/types";

interface FallbackTrack {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
}

interface FallbackResponse {
  tracks?: FallbackTrack[];
}

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

  const canGoPrevious = useMusicStore((state) => state.currentIndex > 0 || state.currentTime > 3);

  // Primary: live YTM history
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

  const liveTracks = useMemo(() => {
    return (data?.tracks || [])
      .map((track) => normalizeMusicTrack(track))
      .filter((track): track is MusicItem => track !== null);
  }, [data?.tracks]);

  // Session has expired when the API responded but returned 0 tracks
  const isSessionExpired = !isLoading && !error && liveTracks.length === 0;

  // Fallback: static offline library — only fetched when session is expired
  const { data: fallbackData, isLoading: isFallbackLoading } = useQuery<FallbackResponse>({
    queryKey: ["ytm-fallback"],
    queryFn: async () => {
      const response = await fetch("/api/ytm/fallback");
      if (!response.ok) throw new Error("Failed to fetch fallback");
      return response.json();
    },
    enabled: isSessionExpired,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const fallbackTracks: MusicItem[] = useMemo(() => {
    return (fallbackData?.tracks || []).map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artist,
      thumbnail: t.thumbnail,
    }));
  }, [fallbackData?.tracks]);

  const isUsingFallback = isSessionExpired && fallbackTracks.length > 0;
  const tracks = isUsingFallback ? fallbackTracks : liveTracks;

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
    isLoading: isLoading || (isSessionExpired && isFallbackLoading),
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
    isSessionExpired,
  };
}
