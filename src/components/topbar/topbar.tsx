import { useState, useEffect } from "react";
import { Wifi, Bluetooth, Settings2, Atom } from "lucide-react";
import { useWindowStore } from "@/store/window-store";
import { CalendarItem } from "./items/calendar/calendar-item";
import { MusicItem } from "./items/music/music-item";
import { BatteryItem } from "./items/battery/battery-item";
import styles from "./topbar.module.css";

export const Topbar = () => {
  const [time, setTime] = useState(new Date());

  const activeTitle = useWindowStore((state) => {
    const focusedWindow = state.windows.find((w) => w.focused);
    return focusedWindow
      ? focusedWindow.title.replace(".app", "").replace(".txt", "").toUpperCase()
      : "PSYCHOS";
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.topbar} onClick={(e) => e.stopPropagation()}>
      <div className={styles.left}>
        <span className={`${styles.menuItem} ${styles.brand}`} data-cursor-mode="pointer">
          <Atom size={14} />
        </span>
        <span className={`${styles.menuItem} ${styles.activeTitle}`} data-cursor-mode="pointer">
          {activeTitle}
        </span>
        <span className={styles.menuItem} data-cursor-mode="pointer">File</span>
        <span className={styles.menuItem} data-cursor-mode="pointer">Edit</span>
        <span className={styles.menuItem} data-cursor-mode="pointer">View</span>
        <span className={styles.menuItem} data-cursor-mode="pointer">Help</span>
      </div>

      <div className={styles.right}>
        <MusicItem />

        <div className={styles.iconGroup}>
          <Wifi size={14} />
          <Bluetooth size={14} />
        </div>
        <BatteryItem />
        <span className={styles.menuItem} data-cursor-mode="pointer">
          <Settings2 size={14} />
        </span>

        <CalendarItem time={time} />
      </div>
    </div>
  );
};
