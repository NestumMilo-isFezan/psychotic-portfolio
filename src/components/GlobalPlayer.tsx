import ReactPlayer from "react-player";
import { useMusicStore } from "../store/musicStore";
import { useEffect, useRef, type SyntheticEvent } from "react";

export const GlobalPlayer = () => {
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

  if (!currentTrack) return null;

  return (
    <div
      style={{
        position: "absolute",
        width: 0,
        height: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <ReactPlayer
        ref={playerRef}
        src={`https://www.youtube.com/watch?v=${currentTrack.id}`}
        playing={status === "playing"}
        volume={volume}
        controls={false}
        width="0"
        height="0"
        onReady={() => {
          setStatus("playing");
        }}
        onWaiting={() => setStatus("loading")}
        onPlay={() => setStatus("playing")}
        onDurationChange={(e: SyntheticEvent<HTMLVideoElement>) => {
          const video = e.target as HTMLVideoElement;
          if (video.duration) {
            setDuration(video.duration);
          }
        }}
        onTimeUpdate={(e: SyntheticEvent<HTMLVideoElement>) => {
          const video = e.target as HTMLVideoElement;
          if (video.currentTime) {
            updateProgress(video.currentTime);
          }
        }}
        onEnded={() => {
          handleTrackEnd();
        }}
        onError={() => {
          setError("Failed to play YouTube track. It might be restricted or unavailable.");
        }}
      />
    </div>
  );
};
