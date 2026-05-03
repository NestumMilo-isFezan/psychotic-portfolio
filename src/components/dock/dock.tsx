import { useWindowStore } from "@/store/window-store";
import { Howl } from "howler";
import { useMemo, useCallback } from "react";
import {
  Terminal,
  Globe,
  Music,
  Folder,
  Trash2,
  User,
  Compass,
  FileText,
  ImageIcon,
  Calendar,
} from "lucide-react";
import { FaAddressBook } from "react-icons/fa6";
import styles from "./dock.module.css";

const PERMANENT_APPS = [
  { name: "FILES", iconName: "FS", Icon: Folder, title: "Files" },
  { name: "WELCOME", iconName: "COMPASS", Icon: Compass, title: "Welcome", id: "welcome" },
  { name: "TERMINAL", iconName: "TERM", Icon: Terminal, title: "Terminal" },
  { name: "PROFILE", iconName: "USER", Icon: User, title: "Profile" },
  { name: "TIMELINE", iconName: "CAL", Icon: Calendar, title: "Timeline" },
  { name: "BROWSER", iconName: "WEB", Icon: Globe, title: "Browser" },
  { name: "CONTACT", iconName: "CONTACT", Icon: FaAddressBook, title: "Contact" },
  { name: "MUSIC", iconName: "AUDIO", Icon: Music, title: "Music" },
  { name: "TRASH", iconName: "NULL", Icon: Trash2, title: "Trash" },
];

export const Dock = () => {
  const addWindow = useWindowStore((state) => state.addWindow);
  const windows = useWindowStore((state) => state.windows);
  const focusWindow = useWindowStore((state) => state.focusWindow);

  const spawnSound = useMemo(
    () =>
      new Howl({
        src: ["https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"],
        volume: 0.5,
      }),
    [],
  );

  const handleAppClick = useCallback(
    (appName: string, iconName: string, defaultId?: string) => {
      const appWindows = windows.filter((w) => w.appName === appName);

      if (appWindows.length > 0) {
        // Logic for existing windows
        const focusedWindow = appWindows.find((w) => w.focused);

        if (focusedWindow) {
          // If one is already focused, cycle to the next one
          const currentIndex = appWindows.indexOf(focusedWindow);
          const nextIndex = (currentIndex + 1) % appWindows.length;
          focusWindow(appWindows[nextIndex].id);
        } else {
          // If none focused, focus the one with highest Z (most recent)
          const topWindow = appWindows.reduce((prev, current) =>
            prev.z > current.z ? prev : current,
          );
          focusWindow(topWindow.id);
        }
        return;
      }

      // Only launch if it's a permanent app (file viewers are launched from Files)
      const isPermanent = PERMANENT_APPS.some((a) => a.name === appName);
      if (!isPermanent) return;

      spawnSound.play();
      const id = defaultId || `app-${Date.now()}`;
      const width = appName === "WELCOME" ? 1270 : appName === "MUSIC" ? 900 : appName === "PROFILE" ? 760 : appName === "CONTACT" ? 620 : appName === "BROWSER" ? 750 : 600;
      const height = appName === "WELCOME" ? 720 : appName === "MUSIC" ? 700 : appName === "PROFILE" ? 580 : appName === "CONTACT" ? 420 : appName === "BROWSER" ? 580 : 450;
      const x = appName === "WELCOME" ? window.innerWidth / 2 - 635 : Math.random() * (window.innerWidth - width - 100) + 50;
      const y = appName === "WELCOME" ? window.innerHeight / 2 - 450 : Math.random() * (window.innerHeight - height - 100) + 50;

      addWindow({
        id,
        title: `${appName.toLowerCase()}.app`,
        x,
        y,
        width,
        height,
        appName,
        iconName,
      });
    },
    [addWindow, windows, focusWindow, spawnSound],
  );

  const displayApps = useMemo(() => {
    const dynamicApps: typeof PERMANENT_APPS = [];

    // Check for running viewers that aren't in PERMANENT_APPS
    const runningAppNames = Array.from(new Set(windows.map((w) => w.appName)));

    runningAppNames.forEach((name) => {
      if (!PERMANENT_APPS.some((a) => a.name === name)) {
        if (name === "MD_VIEWER") {
          dynamicApps.push({
            name: "MD_VIEWER",
            iconName: "MD",
            Icon: FileText,
            title: "Markdown Viewer",
          });
        } else if (name === "IMAGE_VIEWER") {
          dynamicApps.push({
            name: "IMAGE_VIEWER",
            iconName: "IMG",
            Icon: ImageIcon,
            title: "Image Viewer",
          });
        }
      }
    });

    // Separating Trash to ensure it's always last
    const otherPermanent = PERMANENT_APPS.filter((app) => app.name !== "TRASH");
    const trashApp = PERMANENT_APPS.find((app) => app.name === "TRASH");

    return [...otherPermanent, ...dynamicApps, ...(trashApp ? [trashApp] : [])];
  }, [windows]);

  return (
    <div className={styles.dockContainer} onClick={(e) => e.stopPropagation()}>
      {displayApps.map((app) => {
        const isActive = windows.some((w) => w.appName === app.name);
        return (
          <div key={app.name} className={styles.dockItemWrapper}>
            <div className={styles.tooltip}>{app.title}</div>
            <div
              className={styles.dockItem}
              data-cursor-mode="pointer"
              onClick={() => handleAppClick(app.name, app.iconName, app.id)}
            >
              <app.Icon size={28} />
            </div>
            {isActive && <div className={styles.activeIndicator} />}
          </div>
        );
      })}
    </div>
  );
};
