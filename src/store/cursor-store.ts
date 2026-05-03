import { create } from "zustand";

export type CursorMode =
  | "default"
  | "pointer"
  | "text"
  | "grab"
  | "grabbing"
  | "ns-resize"
  | "ew-resize"
  | "nwse-resize"
  | "nesw-resize";

export type ResizeCursorDirection =
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "topRight"
  | "bottomRight"
  | "bottomLeft"
  | "topLeft";

const resizeDirectionToMode: Record<ResizeCursorDirection, CursorMode> = {
  top: "ns-resize",
  right: "ew-resize",
  bottom: "ns-resize",
  left: "ew-resize",
  topRight: "nesw-resize",
  bottomRight: "nwse-resize",
  bottomLeft: "nesw-resize",
  topLeft: "nwse-resize",
};

interface CursorState {
  hoverMode: CursorMode;
  activeMode: CursorMode | null;
  hidden: boolean;
  isDragging: boolean;
  isResizing: boolean;
  setHoverMode: (mode: CursorMode) => void;
  clearHoverMode: () => void;
  setHidden: (hidden: boolean) => void;
  startDragging: () => void;
  stopDragging: () => void;
  startResizing: (direction: ResizeCursorDirection) => void;
  stopResizing: () => void;
}

export const useCursorStore = create<CursorState>((set) => ({
  hoverMode: "default",
  activeMode: null,
  hidden: false,
  isDragging: false,
  isResizing: false,
  setHoverMode: (mode) => set({ hoverMode: mode }),
  clearHoverMode: () => set({ hoverMode: "default" }),
  setHidden: (hidden) => set({ hidden }),
  startDragging: () => set({ activeMode: "grabbing", isDragging: true, isResizing: false }),
  stopDragging: () => set({ activeMode: null, isDragging: false }),
  startResizing: (direction) =>
    set({
      activeMode: resizeDirectionToMode[direction],
      isDragging: false,
      isResizing: true,
    }),
  stopResizing: () => set({ activeMode: null, isResizing: false }),
}));
