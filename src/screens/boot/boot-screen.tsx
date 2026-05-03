import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useBootStore } from "@/store/boot-store";
import styles from "./boot-screen.module.css";

export const BootScreen = () => {
  const progress = useBootStore((state) => state.progress);
  const statusText = useBootStore((state) => state.statusText);
  const start = useBootStore((state) => state.start);
  const started = useRef(false);

  useEffect(() => {
    if (!started.current) {
      started.current = true;
      start();
    }
  }, [start]);

  const filledBlocks = Math.round((progress / 100) * 30);
  const emptyBlocks = 30 - filledBlocks;
  const progressBar = "█".repeat(filledBlocks) + "░".repeat(emptyBlocks);

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <div className={styles.inner}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoText}>PSYCHOS</div>
        </div>

        <div className={styles.version}>PSYCHOS OS v1.0.0 — BUILD 2026</div>

        {/* Progress bar */}
        <div className={styles.progressSection}>
          <div className={styles.progressBar}>{progressBar}</div>
          <div className={styles.progressPct}>{Math.floor(progress)}%</div>
        </div>

        {/* Changing status text */}
        <div className={styles.statusWrapper}>
          <AnimatePresence mode="wait">
            <motion.div
              key={statusText}
              className={styles.statusText}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <span className={styles.prompt}>&gt; </span>
              {statusText}
              <span className={styles.cursor}>▮</span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Scanline overlay */}
      <div className={styles.scanlines} aria-hidden="true" />
    </motion.div>
  );
};
