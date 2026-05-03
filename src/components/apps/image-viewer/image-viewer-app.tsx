import React, { useEffect, useState } from "react";
import { useWindowStore } from "@/store/window-store";
import styles from "./image-viewer-app.module.css";

import type { AppProps } from "@/components/apps/app-registry";

export const ImageViewerApp: React.FC<AppProps> = ({ windowId, params }) => {
  const path = params?.path as string | undefined;
  const updateSize = useWindowStore((state) => state.updateSize);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!path) return;

    const img = new Image();
    img.src = path;
    img.onload = () => {
      // Calculate dimensions with padding
      // Title bar is ~30px, padding is 40px total
      const paddingX = 40;
      const paddingY = 70; // 30 (header) + 40 (bottom/top padding)

      let targetWidth = img.naturalWidth + paddingX;
      let targetHeight = img.naturalHeight + paddingY;

      // Viewport constraints (max 85% of viewport)
      const maxWidth = window.innerWidth * 0.85;
      const maxHeight = window.innerHeight * 0.85;

      if (targetWidth > maxWidth) {
        const ratio = maxWidth / targetWidth;
        targetWidth = maxWidth;
        targetHeight = (targetHeight - paddingY) * ratio + paddingY;
      }

      if (targetHeight > maxHeight) {
        const ratio = maxHeight / targetHeight;
        targetHeight = maxHeight;
        targetWidth = (targetWidth - paddingX) * ratio + paddingX;
      }

      updateSize(windowId, Math.round(targetWidth), Math.round(targetHeight));
      setIsLoaded(true);
    };
  }, [path, windowId, updateSize]);

  const filename = path ? path.split("/").pop() : null;

  if (!path) {
    return (
      <div className={styles.container}>
        <div className={styles.placeholder}>
          <span>[ NO_VISUAL_SIGNAL ]</span>
          <span className={styles.placeholderCursor}>▮</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.imageArea}>
        <div className={`${styles.imageWrapper} ${isLoaded ? styles.visible : ""}`}>
          <img src={path} alt="File Preview" className={styles.image} />
        </div>
      </div>
      <div className={styles.pathBar}>
        <span className={styles.pathBarDecoLeft}>▓▒░</span>
        <span className={styles.pathBarName}>{filename}</span>
        <span className={styles.pathBarDecoRight}>░▒▓</span>
      </div>
    </div>
  );
};
