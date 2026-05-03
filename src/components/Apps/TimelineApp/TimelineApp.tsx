import React from "react";
import { motion } from "motion/react";
import { timelineData } from "./timelineData";
import styles from "./TimelineApp.module.css";
import type { AppProps } from "../appRegistry";

export const TimelineApp: React.FC<AppProps> = () => {
  return (
    <div className={styles.container}>
      {/* ── HEADER ── */}
      <div className={styles.header}>
        <div className={styles.divider}>
          <span className={styles.dividerDecoLeft}>▓▒░</span>
          <span className={styles.dividerTitle}>EXP LOG</span>
          <span className={styles.dividerDecoRight}>░▒▓</span>
        </div>
        <div className={styles.subtitle}>
          <span className={styles.subtitlePrompt}>&gt;</span>
          <span className={styles.subtitleText}>Chronicling the neural memory banks</span>
          <span className={styles.subtitleCursor}>▮</span>
        </div>
      </div>

      {/* ── TIMELINE ── */}
      <div className={styles.timelineWrapper}>
        <div className={styles.spine} />

        {timelineData.map((entry, index) => (
          <motion.div
            key={entry.id}
            className={styles.entry}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: index * 0.15,
              duration: 0.5,
              type: "spring",
              stiffness: 100,
            }}
          >
            <div className={styles.marker}>◆</div>
            <div className={styles.card}>
              <div className={styles.cardMeta}>
                <span className={styles.dateBadge}>{entry.date}</span>
                <span className={styles.cardTitle}>{entry.title}</span>
              </div>
              <div className={styles.description}>{entry.description}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
