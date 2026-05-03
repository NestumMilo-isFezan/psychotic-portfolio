import React from "react";
import { Terminal, Globe, Music, Folder, Trash2, User, Compass } from "lucide-react";
import styles from "./PlaceholderApp.module.css";

import type { AppProps } from "./appRegistry";

export const PlaceholderApp: React.FC<AppProps> = ({ appName, iconName }) => {
  const icons: Record<string, React.ElementType> = {
    TERM: Terminal,
    WEB: Globe,
    AUDIO: Music,
    FS: Folder,
    NULL: Trash2,
    USER: User,
    COMPASS: Compass,
  };
  const IconComponent = iconName ? icons[iconName] || Terminal : Terminal;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <IconComponent size={32} color="var(--cyan)" />
        <h3 className={styles.title}>{appName}</h3>
      </div>
      <p className={styles.ghostText}>Running {iconName} protocol...</p>
      <div className={styles.dataLink}>{Array(5).fill("DATA_LINK_v2.0 ").join("")}</div>
      <div className={styles.syncContainer}>
        <p>SYNCING WAVES...</p>
      </div>
    </div>
  );
};
