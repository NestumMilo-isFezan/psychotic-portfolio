import React from "react";
import { Rnd, type HandleComponent, type HandleStyles } from "react-rnd";
import { motion } from "motion/react";
import type { ResizeDirection } from "re-resizable";
import { useCursorStore, type ResizeCursorDirection } from "@/store/cursor-store";
import { useAppStore, type AppInstance } from "@/store/app-store";
import { useWindowStore } from "@/store/window-store";
import { AppRenderer } from "../apps/app-renderer";
import styles from "./window.module.css";

interface WindowProps {
  app: AppInstance;
  onActivate: () => void;
}

const resizeHandleClassNames = {
  top: "resize-handle resize-handle-n",
  right: "resize-handle resize-handle-e",
  bottom: "resize-handle resize-handle-s",
  left: "resize-handle resize-handle-w",
  topRight: "resize-handle resize-handle-ne",
  bottomRight: "resize-handle resize-handle-se",
  bottomLeft: "resize-handle resize-handle-sw",
  topLeft: "resize-handle resize-handle-nw",
};

const resizeHandleStyles: HandleStyles = {
  top: { top: "-6px", left: "18px", right: "18px", height: "12px" },
  right: { right: "-6px", top: "18px", bottom: "18px", width: "12px" },
  bottom: { bottom: "-6px", left: "18px", right: "18px", height: "12px" },
  left: { left: "-6px", top: "18px", bottom: "18px", width: "12px" },
  topRight: { top: "-9px", right: "-9px", width: "18px", height: "18px" },
  bottomRight: { bottom: "-9px", right: "-9px", width: "18px", height: "18px" },
  bottomLeft: { bottom: "-9px", left: "-9px", width: "18px", height: "18px" },
  topLeft: { top: "-9px", left: "-9px", width: "18px", height: "18px" },
};

const resizeHandleComponents: HandleComponent = {
  top: (
    <div className={styles.resizeHandle} data-cursor-mode="ns-resize" data-resize-direction="top" />
  ),
  right: (
    <div
      className={styles.resizeHandle}
      data-cursor-mode="ew-resize"
      data-resize-direction="right"
    />
  ),
  bottom: (
    <div
      className={styles.resizeHandle}
      data-cursor-mode="ns-resize"
      data-resize-direction="bottom"
    />
  ),
  left: (
    <div
      className={styles.resizeHandle}
      data-cursor-mode="ew-resize"
      data-resize-direction="left"
    />
  ),
  topRight: (
    <div
      className={styles.resizeHandle}
      data-cursor-mode="nesw-resize"
      data-resize-direction="topRight"
    />
  ),
  bottomRight: (
    <div
      className={styles.resizeHandle}
      data-cursor-mode="nwse-resize"
      data-resize-direction="bottomRight"
    />
  ),
  bottomLeft: (
    <div
      className={styles.resizeHandle}
      data-cursor-mode="nesw-resize"
      data-resize-direction="bottomLeft"
    />
  ),
  topLeft: (
    <div
      className={styles.resizeHandle}
      data-cursor-mode="nwse-resize"
      data-resize-direction="topLeft"
    />
  ),
};

const resizeDirectionMap: Record<ResizeDirection, ResizeCursorDirection> = {
  top: "top",
  right: "right",
  bottom: "bottom",
  left: "left",
  topRight: "topRight",
  bottomRight: "bottomRight",
  bottomLeft: "bottomLeft",
  topLeft: "topLeft",
};

export const Window = React.memo(({ app, onActivate }: WindowProps) => {
  const windowEntry = useWindowStore((state) => state.windows[app.id]);
  const focused = useWindowStore((state) => state.focusedId === app.id);
  const layout = useWindowStore((state) => state.layouts[app.id]);
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const closeApp = useAppStore((state) => state.closeApp);
  const minimizeWindow = useWindowStore((state) => state.minimizeWindow);
  const updatePosition = useWindowStore((state) => state.updatePosition);
  const updateSize = useWindowStore((state) => state.updateSize);
  const startDragging = useCursorStore((state) => state.startDragging);
  const stopDragging = useCursorStore((state) => state.stopDragging);
  const startResizing = useCursorStore((state) => state.startResizing);
  const stopResizing = useCursorStore((state) => state.stopResizing);
  const isDragging = useCursorStore((state) => state.isDragging);
  const isResizing = useCursorStore((state) => state.isResizing);

  if (!layout || !windowEntry) return null;

  const z = windowEntry.z;
  const minimized = windowEntry.minimized ?? false;
  const isInteracting = (isDragging || isResizing) && focused;

  return (
    <Rnd
      size={{ width: layout.width, height: layout.height }}
      position={{ x: layout.x, y: layout.y }}
      onDragStart={() => {
        focusWindow(app.id);
        onActivate();
        startDragging();
      }}
      onDragStop={(_e, d) => {
        updatePosition(app.id, d.x, d.y);
        stopDragging();
      }}
      onResizeStart={(_e, direction) => {
        focusWindow(app.id);
        onActivate();
        startResizing(resizeDirectionMap[direction]);
      }}
      onResizeStop={(_e, _direction, ref, _delta, position) => {
        updateSize(app.id, ref.style.width, ref.style.height);
        updatePosition(app.id, position.x, position.y);
        stopResizing();
      }}
      dragHandleClassName={styles.titleBar}
      resizeHandleClasses={resizeHandleClassNames}
      resizeHandleStyles={resizeHandleStyles}
      resizeHandleComponent={resizeHandleComponents}
      bounds="window"
      style={{ zIndex: z, display: minimized ? "none" : "block" }}
      onMouseDown={(e) => {
        e.stopPropagation();
        focusWindow(app.id);
        onActivate();
      }}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        className={styles.windowWrapper}
      >
        <div className={`${styles.windowShadow} ${focused ? styles.focused : ""}`} />
        <div
          className={`${styles.window} ${focused ? styles.focused : ""} ${isInteracting ? styles.interacting : ""}`}
        >
          <div className={styles.titleBar} data-cursor-mode="grab">
            <div className={styles.controls}>
              <div
                className={`${styles.btn} ${styles.closeBtn}`}
                data-cursor-mode="pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  closeApp(app.id);
                }}
              />
              <div
                className={`${styles.btn} ${styles.minimizeBtn}`}
                data-cursor-mode="pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  minimizeWindow(app.id);
                }}
              />
              <div className={`${styles.btn} ${styles.maximizeBtn}`} data-cursor-mode="pointer" />
            </div>
            <div className={styles.title}>{app.title}</div>
          </div>
          <div className={styles.content}>
            <AppRenderer app={app} />
          </div>
        </div>
      </motion.div>
    </Rnd>
  );
});
