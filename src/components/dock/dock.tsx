import { useAppStore } from "@/store/app-store";
import { Howl } from "howler";
import { useMemo, useCallback } from "react";
import type { AppName } from "@/components/apps/app-registry";
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
  { name: "FILES" as AppName, Icon: Folder, title: "Files" },
  { name: "WELCOME" as AppName, Icon: Compass, title: "Welcome" },
  { name: "TERMINAL" as AppName, Icon: Terminal, title: "Terminal" },
  { name: "PROFILE" as AppName, Icon: User, title: "Profile" },
  { name: "TIMELINE" as AppName, Icon: Calendar, title: "Timeline" },
  { name: "BROWSER" as AppName, Icon: Globe, title: "Browser" },
  { name: "CONTACT" as AppName, Icon: FaAddressBook, title: "Contact" },
  { name: "MUSIC" as AppName, Icon: Music, title: "Music" },
  { name: "TRASH" as AppName, Icon: Trash2, title: "Trash" },
];

let spawnSound: Howl | null = null;

const getSpawnSound = () => {
  if (!spawnSound) {
    spawnSound = new Howl({
      src: ["https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"],
      volume: 0.5,
    });
  }
  return spawnSound;
};

export const Dock = () => {
  const openApp = useAppStore((state) => state.openApp);
  const apps = useAppStore((state) => state.apps);
  const activateApp = useAppStore((state) => state.activateApp);

  const handleAppClick = useCallback(
    (appName: AppName) => {
      if (apps.some((app) => app.id === appName)) activateApp(appName);
      else {
        getSpawnSound().play();
        openApp(appName);
      }
    },
    [activateApp, apps, openApp],
  );

  const displayApps = useMemo(() => {
    const dynamicApps: typeof PERMANENT_APPS = [];

    // Check for running viewers that aren't in PERMANENT_APPS
    const runningAppNames = Array.from(new Set(apps.map((app) => app.appName)));

    runningAppNames.forEach((name) => {
      if (!PERMANENT_APPS.some((a) => a.name === name)) {
        if (name === "MD_VIEWER") {
          dynamicApps.push({
            name: "MD_VIEWER",
            Icon: FileText,
            title: "Markdown Viewer",
          });
        } else if (name === "IMAGE_VIEWER") {
          dynamicApps.push({
            name: "IMAGE_VIEWER",
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
  }, [apps]);

  return (
    <div className={styles.dockContainer} onClick={(e) => e.stopPropagation()}>
      {displayApps.map((app) => {
        const isActive = apps.some((runningApp) => runningApp.appName === app.name);
        return (
          <div key={app.name} className={styles.dockItemWrapper}>
            <div className={styles.tooltip}>{app.title}</div>
            <div
              className={styles.dockItem}
              data-cursor-mode="pointer"
              onClick={() => handleAppClick(app.name)}
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
