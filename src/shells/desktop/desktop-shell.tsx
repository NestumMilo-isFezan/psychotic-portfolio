import { useEffect } from "react";
import { motion } from "motion/react";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "@/store/app-store";
import { useWindowStore } from "@/store/window-store";
import { Window } from "@/components/window/window";
import { Topbar } from "@/components/topbar/topbar";
import { Dock } from "@/components/dock/dock";
import { Cursor } from "@/components/cursor/cursor";
import { Wallpaper } from "@/screens/wallpaper";
import { getAppDefinition } from "@/components/apps/app-registry";

export function DesktopShell() {
  const apps = useAppStore(useShallow((state) => state.apps));
  const activeAppId = useAppStore((state) => state.activeAppId);
  const activateApp = useAppStore((state) => state.activateApp);
  const ensureWindow = useWindowStore((state) => state.ensureWindow);
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const clearFocus = useWindowStore((state) => state.clearFocus);

  useEffect(() => {
    const appIds = new Set<string>(apps.map((app) => app.id));
    const windowState = useWindowStore.getState();

    for (const app of apps) {
      if (windowState.windows[app.id]) continue;
      const { width, height } = getAppDefinition(app.appName).desktopSize;
      ensureWindow(app.id, {
        width,
        height,
        x: Math.max(50, window.innerWidth / 2 - width / 2 + Math.random() * 80 - 40),
        y: Math.max(40, window.innerHeight / 2 - height / 2 + Math.random() * 60 - 30),
      });
    }

    for (const windowId of Object.keys(windowState.windows)) {
      if (!appIds.has(windowId)) closeWindow(windowId);
    }
    if (activeAppId) focusWindow(activeAppId);
  }, [activeAppId, apps, closeWindow, ensureWindow, focusWindow]);

  return (
    <>
      <Cursor />
      <motion.div
        className="desktop"
        style={{ width: "100%", height: "100%", position: "relative" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        onClick={() => clearFocus()}
      >
        <Wallpaper />
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
          {apps.map((app) => (
            <Window key={app.id} app={app} onActivate={() => activateApp(app.id)} />
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
    </>
  );
}
