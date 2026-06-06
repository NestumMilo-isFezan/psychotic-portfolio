import React, { useCallback } from "react";
import styles from "./profile-app.module.css";
import { useAppStore } from "@/store/app-store";
import type { AppProps } from "@/components/apps/app-registry";

const MAX_MONTHS = 36;

const LANGS = [
  { label: "HTML / CSS", months: 36, display: "3 yrs" },
  { label: "PHP", months: 24, display: "2 yrs" },
  { label: "JS / TS", months: 18, display: "1.5 yrs" },
  { label: "Ruby", months: 6, display: "6 mo" },
  { label: "Python", months: 6, display: "6 mo" },
  { label: "Rust", months: 2, display: "2 mo" },
];

const SKILLS = ["Docker", "Linux", "DevOps Engineering", "System Design", "AI", "n8n"];

const DATABASES = ["PostgreSQL", "MySQL", "MariaDB", "SQLite"];

const CERTS = [{ name: "Fundamentals of DevOps", issuer: "Linux Foundation" }];

const SectionDivider: React.FC<{ title: string }> = ({ title }) => (
  <div className={styles.divider}>
    <span className={styles.dividerDecoLeft}>▓▒░</span>
    <span className={styles.dividerTitle}>{title}</span>
    <span className={styles.dividerDecoRight}>░▒▓</span>
  </div>
);

const StatBar: React.FC<{ label: string; months: number; display: string }> = ({
  label,
  months,
  display,
}) => {
  const filled = Math.round((months / MAX_MONTHS) * 10);
  const empty = 10 - filled;
  return (
    <div className={styles.statRow}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statBar}>
        {"█".repeat(filled)}
        <span className={styles.statBarEmpty}>{"░".repeat(empty)}</span>
      </span>
      <span className={styles.statPct}>{display}</span>
    </div>
  );
};

export const ProfileApp: React.FC<AppProps> = () => {
  const openApp = useAppStore((state) => state.openApp);

  const openPhoto = useCallback(() => {
    openApp("IMAGE_VIEWER", {
      title: "my-profile-pic.jpg",
      params: { path: "/profile/my-profile-pic.jpg" },
    });
  }, [openApp]);

  return (
    <div className={styles.container}>
      {/* ── HEADER ── */}
      <div className={styles.header}>
        <div
          className={styles.photoWrapper}
          onClick={openPhoto}
          data-cursor-mode="pointer"
          title="View photo"
        >
          <img src="/profile/my-profile-pic.jpg" alt="Nurahfezan Nordin" className={styles.photo} />
          <div className={styles.scanlines} aria-hidden="true" />
          <div className={styles.photoHint}>[ CLICK ]</div>
        </div>

        <div className={styles.identity}>
          <div className={styles.nameGlitch} data-text="NURAHFEZAN NORDIN">
            NURAHFEZAN NORDIN
          </div>
          <div className={styles.roles}>
            <span className={styles.roleBadge}>◈ FULL STACK MAGE</span>
            <span className={styles.roleBadge}>◈ DEVOPS SWORDSMAN</span>
          </div>
          <div className={styles.statusLine}>
            <span className={styles.statusPrompt}>&gt;</span>
            <span className={styles.statusText}>
              Crafting a cursed tome — Recommendation Knowledge Grimoire, powered by Rails
            </span>
            <span className={styles.cursor}>▮</span>
          </div>
          <div className={styles.location}>⌖ Sabah, Malaysia</div>
        </div>
      </div>

      {/* ── ABOUT ── */}
      <SectionDivider title="ABOUT" />
      <p className={styles.about}>
        Average tech enthusiast who loves anime cultures. Obsessed with building systems that are
        both elegant and a little bit unhinged.
      </p>

      {/* ── STATS ── */}
      <SectionDivider title="LANG PROFICIENCY" />
      <div className={styles.statsBlock}>
        {LANGS.map((s) => (
          <StatBar key={s.label} {...s} />
        ))}
      </div>

      {/* ── SKILLS ── */}
      <SectionDivider title="SKILLS & TOOLS" />
      <div className={styles.chips}>
        {SKILLS.map((s) => (
          <span key={s} className={styles.chip}>
            {s}
          </span>
        ))}
      </div>

      {/* ── DATABASES ── */}
      <SectionDivider title="DATABASE STACK" />
      <div className={styles.chips}>
        {DATABASES.map((d) => (
          <span key={d} className={`${styles.chip} ${styles.chipDb}`}>
            {d}
          </span>
        ))}
      </div>

      {/* ── CERTIFICATES ── */}
      <SectionDivider title="CERTIFICATES" />
      <div className={styles.certs}>
        {CERTS.map((c) => (
          <div key={c.name} className={styles.certEntry}>
            <span className={styles.certIcon}>◆</span>
            <div>
              <div className={styles.certName}>{c.name}</div>
              <div className={styles.certIssuer}>{c.issuer}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
