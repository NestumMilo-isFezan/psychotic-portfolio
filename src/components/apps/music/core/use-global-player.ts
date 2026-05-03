import { useEffect, useRef } from "react";
import { useMusicStore } from "@/store/music-store";

export function useGlobalPlayer() {
  const playerRef = useRef<HTMLVideoElement>(null);
  const currentTrack = useMusicStore((state) => state.currentTrack);
  const status = useMusicStore((state) => state.status);
  const volume = useMusicStore((state) => state.volume);
  const seekTarget = useMusicStore((state) => state.seekTarget);
  const setStatus = useMusicStore((state) => state.setStatus);
  const setDuration = useMusicStore((state) => state.setDuration);
  const updateProgress = useMusicStore((state) => state.updateProgress);
  const setError = useMusicStore((state) => state.setError);
  const handleTrackEnd = useMusicStore((state) => state.handleTrackEnd);
  const clearSeekTarget = useMusicStore((state) => state.clearSeekTarget);

  useEffect(() => {
    if (seekTarget !== null && playerRef.current) {
      playerRef.current.currentTime = seekTarget;
      clearSeekTarget();
    }
  }, [seekTarget, clearSeekTarget]);

  return {
    playerRef,
    currentTrack,
    status,
    volume,
    setStatus,
    setDuration,
    updateProgress,
    setError,
    handleTrackEnd,
  };
}
