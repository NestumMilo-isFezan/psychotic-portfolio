import React, { useState, useCallback } from "react";
import { RefreshCw, Globe } from "lucide-react";
import { useWindowStore } from "@/store/window-store";
import type { AppProps } from "@/components/apps/app-registry";
import styles from "./browser-app.module.css";

const QUOTES = [
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    text: "Code is like humor. When you have to explain it, it's bad.",
    author: "Cory House",
  },
  {
    text: "First, solve the problem. Then, write the code.",
    author: "John Johnson",
  },
  {
    text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    author: "Martin Fowler",
  },
  {
    text: "Simplicity is the soul of efficiency.",
    author: "Austin Freeman",
  },
  {
    text: "Make it work, make it right, make it fast.",
    author: "Kent Beck",
  },
  {
    text: "The best error message is the one that never shows up.",
    author: "Thomas Fuchs",
  },
  {
    text: "Talk is cheap. Show me the code.",
    author: "Linus Torvalds",
  },
];

const STATUS_ITEMS = [
  "Work on the 2 main projects",
  "Exploring good manga series",
  "Watching tech stacks improved and agonizing",
  "Open to find advance hands-on docker deployment",
];

const SectionDivider: React.FC<{ title: string }> = ({ title }) => (
  <div className={styles.divider}>
    <span className={styles.dividerDecoLeft}>▓▒░</span>
    <span className={styles.dividerTitle}>{title}</span>
    <span className={styles.dividerDecoRight}>░▒▓</span>
  </div>
);

const getRandomIndex = (exclude: number, max: number): number => {
  if (max <= 1) return 0;
  let next: number;
  do {
    next = Math.floor(Math.random() * max);
  } while (next === exclude);
  return next;
};

export const BrowserApp: React.FC<AppProps> = () => {
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [rerolling, setRerolling] = useState(false);
  const addWindow = useWindowStore((s) => s.addWindow);

  const reroll = useCallback(() => {
    setRerolling(true);
    setTimeout(() => {
      setQuoteIndex((prev) => getRandomIndex(prev, QUOTES.length));
      setRerolling(false);
    }, 300);
  }, []);

  const openContact = useCallback(() => {
    addWindow({
      id: "contact",
      title: "contact.app",
      x: Math.random() * (window.innerWidth - 650) + 50,
      y: Math.random() * (window.innerHeight - 450) + 50,
      width: 620,
      height: 420,
      appName: "CONTACT",
      iconName: "CONTACT",
    });
  }, [addWindow]);

  const quote = QUOTES[quoteIndex];

  return (
    <div className={styles.container}>
      {/* ── FAKE BROWSER CHROME ── */}
      <div className={styles.browserChrome}>
        <Globe size={12} className={styles.chromeGlobe} />
        <div className={styles.addressBar}>
          <span className={styles.addressScheme}>psychos://</span>
          <span className={styles.addressPath}>dashboard</span>
        </div>
        <div className={styles.chromeDot} />
        <div className={styles.chromeDot} />
        <div className={styles.chromeDot} />
      </div>

      <div className={styles.page}>
        {/* ── MOTIVATION ── */}
        <SectionDivider title="MOTIVATION_FEED" />
        <div className={`${styles.quoteBlock} ${rerolling ? styles.fadeOut : styles.fadeIn}`}>
          <div className={styles.quoteText}>&ldquo;{quote.text}&rdquo;</div>
          <div className={styles.quoteAuthor}>— {quote.author}</div>
        </div>
        <div className={styles.rerollRow}>
          <button
            className={styles.rerollBtn}
            onClick={reroll}
            disabled={rerolling}
            data-cursor-mode="pointer"
          >
            <RefreshCw size={12} className={rerolling ? styles.spinning : ""} />
            REROLL
          </button>
          <span className={styles.quoteCounter}>
            [{quoteIndex + 1}/{QUOTES.length}]
          </span>
        </div>

        {/* ── CURRENT STATUS ── */}
        <SectionDivider title="CURRENT_STATUS" />
        <div className={styles.statusList}>
          {STATUS_ITEMS.map((item, i) => (
            <div key={i} className={styles.statusItem}>
              <span className={styles.statusMarker}>◈</span>
              <span className={styles.statusText}>{item}</span>
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <SectionDivider title="ESTABLISH_CONNECTION" />
        <div className={styles.ctaBlock}>
          <p className={styles.ctaText}>
            <span className={styles.ctaPrompt}>&gt;</span>
            Got a project, collab idea, or just want to say hi?
            <span className={styles.ctaCursor}>▮</span>
          </p>
          <button className={styles.ctaBtn} onClick={openContact} data-cursor-mode="pointer">
            CONTACT NOW
          </button>
        </div>
      </div>
    </div>
  );
};
