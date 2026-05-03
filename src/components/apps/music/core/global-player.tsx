import ReactPlayer from "react-player";
import { useGlobalPlayer } from "./use-global-player";

export const GlobalPlayer = () => {
  const {
    playerRef,
    currentTrack,
    status,
    volume,
    setStatus,
    setDuration,
    updateProgress,
    setError,
    handleTrackEnd,
  } = useGlobalPlayer();

  if (!currentTrack) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: -9999,
        left: -9999,
        width: "1px",
        height: "1px",
        opacity: 0,
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
        width="100%"
        height="100%"
        onReady={() => {
          setStatus("playing");
        }}
        onWaiting={() => setStatus("loading")}
        onPlaying={() => setStatus("playing")}
        onPlay={() => setStatus("playing")}
        onPause={() => setStatus("paused")}
        onDurationChange={(e: any) => {
          setDuration(e.currentTarget.duration);
        }}
        onTimeUpdate={(e: any) => {
          updateProgress(e.currentTarget.currentTime);
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
