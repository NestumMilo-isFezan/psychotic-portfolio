import React, { useState, useEffect } from "react";
import { marked } from "marked";
import styles from "./markdown-viewer-app.module.css";
import type { AppProps } from "@/components/apps/app-registry";

export const MarkdownViewerApp: React.FC<AppProps> = ({ params }) => {
  const path = params?.path as string | undefined;
  const [content, setContent] = useState<string | null>(null);
  const [html, setHtml] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const filename = path ? path.split("/").pop() : null;

  useEffect(() => {
    if (!path) return;

    const loadContent = async () => {
      try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`HTTP_${response.status}`);
        const text = await response.text();
        setContent(text);

        const parsedHtml = await marked.parse(text);
        setHtml(parsedHtml);
      } catch (err) {
        setError(err instanceof Error ? err.message : "UNKNOWN_ERROR");
      }
    };

    void loadContent();
  }, [path]);

  if (!path) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>[ ERR: NO_PATH_SPECIFIED ]</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>[ ERR: {error} ]</div>
      </div>
    );
  }

  if (content === null) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <span>[ ACCESSING_NEURAL_DATA ]</span>
          <span className={styles.loadingCursor}>▮</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <span className={styles.toolbarDecoLeft}>▓▒░</span>
        <span className={styles.toolbarTitle}>{filename}</span>
        <span className={styles.toolbarDecoRight}>░▒▓</span>
      </div>
      <div className={styles.content} dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};
