import { useEffect, useRef } from "react";
import { FaMousePointer, FaHandPointer, FaHandPaper, FaHandRock, FaICursor } from "react-icons/fa";
import { MoveHorizontal, MoveVertical, MoveDiagonal, MoveDiagonal2 } from "lucide-react";
import { useCursorStore, type CursorMode } from "@/store/cursor-store";
import styles from "./cursor.module.css";

const cursorModes: CursorMode[] = [
  "default",
  "pointer",
  "text",
  "grab",
  "grabbing",
  "ns-resize",
  "ew-resize",
  "nwse-resize",
  "nesw-resize",
];

const isCursorMode = (value: string | null): value is CursorMode => {
  return value !== null && cursorModes.includes(value as CursorMode);
};

export const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const mode = useCursorStore((state) => state.activeMode ?? state.hoverMode);
  const activeMode = useCursorStore((state) => state.activeMode);
  const hidden = useCursorStore((state) => state.hidden);
  const setHoverMode = useCursorStore((state) => state.setHoverMode);
  const clearHoverMode = useCursorStore((state) => state.clearHoverMode);
  const setHidden = useCursorStore((state) => state.setHidden);

  useEffect(() => {
    const resolveHoverMode = (target: HTMLElement): CursorMode => {
      const explicitMode =
        target.closest<HTMLElement>("[data-cursor-mode]")?.dataset.cursorMode ?? null;

      if (isCursorMode(explicitMode)) {
        return explicitMode;
      }

      if (
        target.closest(
          'button, a, [role="button"], [class*="menuItem"], [class*="dockItem"], [class*="btn"]',
        )
      ) {
        return "pointer";
      }

      if (target.closest('input, textarea, [contenteditable="true"]')) {
        return "text";
      }

      if (target.closest("p, h1, h2, h3, span, code, pre, li")) {
        return "text";
      }

      return "default";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      setHidden(false);

      const target = e.target as HTMLElement | null;
      if (!target) {
        clearHoverMode();
        return;
      }

      setHoverMode(resolveHoverMode(target));
    };

    const onMouseLeave = () => {
      setHidden(true);
      clearHoverMode();
    };

    const onMouseEnter = () => {
      setHidden(false);
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
    };
  }, [clearHoverMode, setHidden, setHoverMode]);

  const renderIcon = () => {
    const color = "#ffffff";
    const size = 20;
    const faStyle = {
      stroke: "#000000",
      strokeWidth: "30px",
      paintOrder: "stroke fill" as const,
    };
    switch (mode) {
      case "pointer":
        return <FaHandPointer size={size} color={color} style={faStyle} />;
      case "grab":
        return <FaHandPaper size={size} color={color} style={faStyle} />;
      case "grabbing":
        return <FaHandRock size={size} color={color} style={faStyle} />;
      case "text":
        return <FaICursor size={size} color={color} style={faStyle} />;
      case "ns-resize":
        return <MoveVertical size={size} color={color} strokeWidth={2.75} absoluteStrokeWidth />;
      case "ew-resize":
        return <MoveHorizontal size={size} color={color} strokeWidth={2.75} absoluteStrokeWidth />;
      case "nwse-resize":
        return <MoveDiagonal2 size={size} color={color} strokeWidth={2.75} absoluteStrokeWidth />;
      case "nesw-resize":
        return <MoveDiagonal size={size} color={color} strokeWidth={2.75} absoluteStrokeWidth />;
      default:
        return <FaMousePointer size={size} color={color} style={faStyle} />;
    }
  };

  const getTransform = () => {
    switch (mode) {
      case "pointer":
        return "translate(-4px, 0px)";
      case "default":
        return "translate(-1px, -1px)";
      default:
        return "translate(-50%, -50%)";
    }
  };

  return (
    <div
      ref={cursorRef}
      className={`${styles.cursor} ${hidden ? styles.hidden : ""}`}
      data-active-cursor={activeMode ?? undefined}
    >
      <div style={{ transform: getTransform(), display: "flex" }}>{renderIcon()}</div>
    </div>
  );
};
