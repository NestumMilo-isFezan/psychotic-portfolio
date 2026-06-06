import { useEffect, useSyncExternalStore } from "react";
import { AnimatePresence } from "motion/react";
import { useBootStore } from "./store/boot-store";
import { useMusicStore } from "./store/music-store";
import { useAppStore } from "./store/app-store";
import { GlobalPlayer } from "./components/apps/music/core/global-player";
import { BootScreen } from "./screens/boot";
import { DesktopShell } from "./shells/desktop/desktop-shell";
import { MobileShell } from "./shells/mobile/mobile-shell";

const portraitQuery = window.matchMedia("(orientation: portrait)");

function useIsPortrait() {
  return useSyncExternalStore(
    (cb) => {
      portraitQuery.addEventListener("change", cb);
      return () => portraitQuery.removeEventListener("change", cb);
    },
    () => portraitQuery.matches,
  );
}

function App() {
  const openApp = useAppStore((state) => state.openApp);
  const isDone = useBootStore((state) => state.isDone);
  const hasStartedMusic = useMusicStore((state) => state.hasStartedMusic);
  const isPortrait = useIsPortrait();

  useEffect(() => {
    if (!isDone) return;
    if (!isPortrait && useAppStore.getState().apps.length === 0) openApp("WELCOME");
  }, [isDone, isPortrait, openApp]);

  return (
    <>
      {hasStartedMusic && <GlobalPlayer />}
      <AnimatePresence mode="wait">
        {!isDone ? (
          <BootScreen key="boot" />
        ) : isPortrait ? (
          <MobileShell key="mobile" />
        ) : (
          <DesktopShell key="desktop" />
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
