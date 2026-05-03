import React, { Suspense } from "react";
import { Rnd, type HandleComponent, type HandleStyles } from "react-rnd";
import { motion } from "motion/react";
import type { ResizeDirection } from "re-resizable";
import { useCursorStore, type ResizeCursorDirection } from "../../store/cursorStore";
import { useWindowStore } from "../../store/windowStore";
import type { WindowData } from "../../store/windowStore";
import { getAppComponent } from "../Apps/appRegistry";
import { LoadingApp } from "../Apps/LoadingApp";
import styles from "./Window.module.css";

interface WindowProps {
  data: WindowData;
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

export const Window: React.FC<WindowProps> = ({ data }) => {
  const focusWindow = useWindowStore((state) => state.focusWindow);
  const closeWindow = useWindowStore((state) => state.closeWindow);
  const minimizeWindow = useWindowStore((state) => state.minimizeWindow);
  const updatePosition = useWindowStore((state) => state.updatePosition);
  const updateSize = useWindowStore((state) => state.updateSize);
  const startDragging = useCursorStore((state) => state.startDragging);
  const stopDragging = useCursorStore((state) => state.stopDragging);
  const startResizing = useCursorStore((state) => state.startResizing);
  const stopResizing = useCursorStore((state) => state.stopResizing);

  const renderContent = () => {
    const AppComponent = getAppComponent(data.appName);

    return (
      <Suspense fallback={<LoadingApp />}>
        <AppComponent
          windowId={data.id}
          appName={data.appName}
          iconName={data.iconName}
          params={data.params}
        />
      </Suspense>
    );
  };

  return (
    <Rnd
      size={{ width: data.width, height: data.height }}
      position={{ x: data.x, y: data.y }}
      onDragStart={() => {
        focusWindow(data.id);
        startDragging();
      }}
      onDragStop={(_e, d) => {
        updatePosition(data.id, d.x, d.y);
        stopDragging();
      }}
      onResizeStart={(_e, direction) => {
        focusWindow(data.id);
        startResizing(resizeDirectionMap[direction]);
      }}
      onResizeStop={(_e, _direction, ref, _delta, position) => {
        updateSize(data.id, ref.style.width, ref.style.height);
        updatePosition(data.id, position.x, position.y);
        stopResizing();
      }}
      dragHandleClassName={styles.titleBar}
      resizeHandleClasses={resizeHandleClassNames}
      resizeHandleStyles={resizeHandleStyles}
      resizeHandleComponent={resizeHandleComponents}
      bounds="window"
      style={{ zIndex: data.z, display: data.minimized ? "none" : "block" }}
      onMouseDown={(e) => {
        e.stopPropagation();
        focusWindow(data.id);
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
        <div className={`${styles.windowShadow} ${data.focused ? styles.focused : ""}`} />
        <div className={`${styles.window} ${data.focused ? styles.focused : ""}`}>
          <div className={styles.titleBar} data-cursor-mode="grab">
            <div className={styles.controls}>
              <div
                className={`${styles.btn} ${styles.closeBtn}`}
                data-cursor-mode="pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  closeWindow(data.id);
                }}
              />
              <div
                className={`${styles.btn} ${styles.minimizeBtn}`}
                data-cursor-mode="pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  minimizeWindow(data.id);
                }}
              />
              <div className={`${styles.btn} ${styles.maximizeBtn}`} data-cursor-mode="pointer" />
            </div>
            <div className={styles.title}>{data.title}</div>
          </div>
          <div className={styles.content}>{renderContent()}</div>
        </div>
      </motion.div>
    </Rnd>
  );
};
