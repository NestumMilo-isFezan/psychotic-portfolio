import React, { useState, useEffect, useRef, useCallback } from "react";
import { marked } from "marked";
import { FaFileLines, FaTrashCan } from "react-icons/fa6";
import { FaChevronLeft } from "react-icons/fa6";
import { useTrashStore } from "@/store/trash-store";
import type { AppProps } from "@/components/apps/app-registry";
import styles from "./trash-app.module.css";

const NOVEL_PATH = "/files/trash/draft-light-novel.md";
const WARNING_MARKER = "## ⚠ WARNING";

const REBOOT_LINES = [
  "BIOS v6.6.6 ............ OK",
  "NEURAL_BRIDGE .......... SEVERED",
  "MEMORY SCAN ............ CORRUPTED",
  "EMOTIONAL_CACHE ........ PURGING",
  "LOADING PSYCHOS ........ FAILED",
  "RECOVERY MODE .......... IMPOSSIBLE",
  "FILESYSTEM ............. WIPED",
  "[ SYSTEM HALTED ]",
];

type Phase = "idle" | "glitch" | "blank" | "done";
type View = "list" | "reader";

export const TrashApp: React.FC<AppProps> = () => {
  const novelExists = useTrashStore((s) => s.novelExists);
  const destroyNovel = useTrashStore((s) => s.destroyNovel);

  const [view, setView] = useState<View>("list");
  const [content, setContent] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [visibleRebootLines, setVisibleRebootLines] = useState(0);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const hasTriggered = useRef(false);

  const openNovel = useCallback(async () => {
    if (content === null && !loadError) {
      try {
        const res = await fetch(NOVEL_PATH);
        if (!res.ok) throw new Error(`HTTP_${res.status}`);
        setContent(await res.text());
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : "UNKNOWN_ERROR");
      }
    }
    setView("reader");
    // Reset trigger guard if novel was re-opened after restore
    hasTriggered.current = false;
    setPhase("idle");
    setVisibleRebootLines(0);
  }, [content, loadError]);

  const closeReader = useCallback(() => {
    setView("list");
  }, []);

  // Glitch → blank → reboot → destroy sequence
  const triggerSequence = useCallback(() => {
    if (hasTriggered.current) return;
    hasTriggered.current = true;

    setPhase("glitch");

    setTimeout(() => {
      setPhase("blank");
      setVisibleRebootLines(0);
      REBOOT_LINES.forEach((_, i) => {
        setTimeout(() => setVisibleRebootLines(i + 1), 1200 + i * 180);
      });
    }, 2000);

    const totalBlankTime = 1200 + REBOOT_LINES.length * 180 + 600;
    setTimeout(() => {
      setPhase("done");
      destroyNovel();
      setView("list");
    }, 2000 + totalBlankTime);
  }, [destroyNovel]);

  // Observe sentinel only while in reader view with content loaded
  useEffect(() => {
    if (view !== "reader" || !content || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          triggerSequence();
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [view, content, triggerSequence]);

  // Reset reader state when novel is restored
  useEffect(() => {
    if (novelExists) {
      setContent(null);
      setLoadError(null);
      hasTriggered.current = false;
      setPhase("idle");
    }
  }, [novelExists]);

  const splitContent = (raw: string) => {
    const idx = raw.indexOf(WARNING_MARKER);
    if (idx === -1) return { before: raw, after: "" };
    return { before: raw.slice(0, idx), after: raw.slice(idx) };
  };

  const isGlitching = phase === "glitch";
  const isBlank = phase === "blank" || phase === "done";

  // ── LIST VIEW ──
  if (view === "list") {
    return (
      <div className={styles.container}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.pathBar}>
            <span className={styles.pathPrompt}>&gt;</span>
            <span className={styles.pathText}>~/trash</span>
          </div>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Sidebar */}
          <div className={styles.sidebar}>
            <div className={styles.sidebarTitle}>VOLUMES</div>
            <div className={`${styles.sidebarItem} ${styles.sidebarActive}`}>
              <FaTrashCan size={13} className={styles.sidebarIcon} />
              <span>trash</span>
            </div>
          </div>

          {/* File panel */}
          <div className={styles.filePanel}>
            {!novelExists ? (
              <div className={styles.empty}>[ VOID IS EMPTY ]</div>
            ) : (
              <table className={styles.fileTable}>
                <thead>
                  <tr className={styles.tableHead}>
                    <th className={styles.colName}>NAME</th>
                    <th className={styles.colType}>TYPE</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    className={styles.fileRow}
                    onClick={openNovel}
                    data-cursor-mode="pointer"
                  >
                    <td className={styles.colName}>
                      <span className={styles.rowIcon}>
                        <FaFileLines size={14} />
                      </span>
                      <span className={styles.rowName}>draft-light-novel.md</span>
                    </td>
                    <td className={styles.colType}>
                      <span className={`${styles.badge} ${styles.badgeMD}`}>MD</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── READER VIEW ──
  const beforeHtml = content ? (marked.parse(splitContent(content).before) as string) : "";
  const afterHtml = content ? (marked.parse(splitContent(content).after) as string) : "";

  return (
    <div className={`${styles.container} ${isGlitching ? styles.glitching : ""}`}>
      {isGlitching && <div className={styles.crtOverlay} aria-hidden="true" />}

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <button
          className={styles.backBtn}
          onClick={closeReader}
          data-cursor-mode="pointer"
          title="Back"
          disabled={isGlitching || isBlank}
        >
          <FaChevronLeft size={14} />
        </button>
        <div className={styles.pathBar}>
          <span className={styles.pathPrompt}>&gt;</span>
          <span className={styles.pathText}>~/trash/draft-light-novel.md</span>
        </div>
      </div>

      {/* Reader body */}
      <div className={styles.body}>
        <div className={styles.readerPanel}>
          {loadError ? (
            <div className={styles.errorState}>[ ERR: {loadError} ]</div>
          ) : content === null ? (
            <div className={styles.loadingState}>
              <span>[ DECRYPTING CURSED DATA ]</span>
              <span className={styles.loadingCursor}>▮</span>
            </div>
          ) : (
            <div className={styles.readerContent}>
              <div dangerouslySetInnerHTML={{ __html: beforeHtml }} />
              <div ref={sentinelRef} className={styles.sentinel} />
              {afterHtml && <div dangerouslySetInnerHTML={{ __html: afterHtml }} />}
            </div>
          )}
        </div>
      </div>

      {/* Blank screen overlay */}
      {isBlank && (
        <div className={styles.blankScreen}>
          <div className={styles.purgeText}>&gt; NEURAL LINK SEVERED</div>
          <div className={styles.rebootLines}>
            {REBOOT_LINES.slice(0, visibleRebootLines).map((line, i) => (
              <div key={i} className={styles.rebootLine}>{line}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
