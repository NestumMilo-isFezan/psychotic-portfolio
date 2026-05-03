import { useEffect, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useShallow } from "zustand/react/shallow";
import { useWindowStore } from "./store/window-store";
import { useBootStore } from "./store/boot-store";
import { useMusicStore } from "./store/music-store";
import { Window } from "./components/window/window";
import { Topbar } from "./components/topbar/topbar";
import { Dock } from "./components/dock/dock";
import { Cursor } from "./components/cursor/cursor";
import { GlobalPlayer } from "./components/apps/music/core/global-player";
import { BootScreen } from "./screens/boot";
import { Wallpaper } from "./screens/wallpaper";
import styles from "./App.module.css";

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

function WindowById({ id }: { id: string }) {
  const windowData = useWindowStore(
    useShallow((state) => state.windows.find((w) => w.id === id)),
  );
  if (!windowData) return null;
  return <Window data={windowData} />;
}

function App() {
  const windowIds = useWindowStore(
    useShallow((state) => state.windows.map((w) => w.id)),
  );
  const addWindow = useWindowStore((state) => state.addWindow);
  const clearFocus = useWindowStore((state) => state.clearFocus);
  const isDone = useBootStore((state) => state.isDone);
  const hasStartedMusic = useMusicStore((state) => state.hasStartedMusic);
  const isPortrait = useIsPortrait();

  useEffect(() => {
    if (!isDone) return;
    addWindow({
      id: "welcome",
      title: "welcome.app",
      x: window.innerWidth / 2 - 635,
      y: window.innerHeight / 2 - 450,
      width: 1270,
      height: 720,
      appName: "WELCOME",
    });
  }, [isDone, addWindow]);

  return (
    <>
      <Cursor />
      {isPortrait && (
        <div className={styles.portraitBlock}>
          <div className={styles.portraitInner}>
            <div className={styles.portraitLogo}>PSYCHOS</div>
            <div className={styles.portraitCode}>ERR_ORIENTATION_MISMATCH</div>
            <p className={styles.portraitMsg}>
              This terminal wasn&apos;t built for portrait mode.
              <br />
              Rotate your screen to landscape — or hold on tight.
              <br />
              <span className={styles.portraitSub}>
                PSYCHOS mobile is loading in the void. Be patient.
              </span>
            </p>
            <div className={styles.portraitCode}>▮</div>
          </div>
          <div className={styles.portraitScanlines} aria-hidden="true" />
        </div>
      )}
      <AnimatePresence>
        {!isDone ? (
          <BootScreen key="boot" />
        ) : (
          <motion.div
            key="desktop"
            className="desktop"
            style={{ width: "100%", height: "100%", position: "relative" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            onClick={() => clearFocus()}
          >
            <Wallpaper />
            {hasStartedMusic && <GlobalPlayer />}
            <Topbar />

            <div
              style={{
                position: "absolute",
                top: 28,
                bottom: 0,
                left: 0,
                right: 0,
                overflow: "hidden",
              }}
            >
              {windowIds.map((id) => (
                <WindowById key={id} id={id} />
              ))}
            </div>

            <Dock />

            <div
              style={{
                position: "absolute",
                bottom: 10,
                right: 10,
                fontSize: "10px",
                opacity: 0.5,
                zIndex: 100,
                fontFamily: "var(--font-pixel)",
              }}
            >
              PSYCHOS // ONLINE
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
