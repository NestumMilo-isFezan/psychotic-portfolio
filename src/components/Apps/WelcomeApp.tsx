import React from "react";
import styles from "./WelcomeApp.module.css";
import type { AppProps } from "./appRegistry";

export const WelcomeApp: React.FC<AppProps> = () => {
  return (
    <div className={styles.container}>
      <div className={styles.leftPane}>
        <div className={styles.nameBlock}>
          <div className={styles.name}>NURAHFEZAN</div>
          <div className={styles.name}>NORDIN</div>
        </div>
        <p className={styles.tagline}>
          &ldquo;I research, craft, and refine my work for the satisfactions&rdquo;
        </p>
      </div>
      <div className={styles.rightPane}>
        <img src="/welcome/ascii-mountain.jpg" alt="ascii mountain" className={styles.mountainImg} />
      </div>
    </div>
  );
};
