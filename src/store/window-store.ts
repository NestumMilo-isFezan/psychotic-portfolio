import { create } from "zustand";

export interface WindowLayout {
  x: number;
  y: number;
  width: number | string;
  height: number | string;
}

export interface WindowData {
  z: number;
  minimized?: boolean;
}

interface WindowState {
  windows: Record<string, WindowData>;
  focusedId: string | null;
  layouts: Record<string, WindowLayout>;
  maxZ: number;
  ensureWindow: (id: string, layout: WindowLayout) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  clearFocus: () => void;
  updatePosition: (id: string, x: number, y: number) => void;
  updateSize: (id: string, width: number | string, height: number | string) => void;
}

export const useWindowStore = create<WindowState>((set) => ({
  windows: {},
  focusedId: null,
  layouts: {},
  maxZ: 10,
  ensureWindow: (id, layout) =>
    set((state) => {
      if (state.windows[id]) return state;
      const newZ = state.maxZ + 1;

      return {
        windows: {
          ...state.windows,
          [id]: { z: newZ, minimized: false },
        },
        focusedId: id,
        layouts: {
          ...state.layouts,
          [id]: layout,
        },
        maxZ: newZ,
      };
    }),
  closeWindow: (id) =>
    set((state) => {
      const windows = Object.fromEntries(
        Object.entries(state.windows).filter(([key]) => key !== id),
      );
      const { [id]: _, ...remainingLayouts } = state.layouts;
      return {
        windows,
        layouts: remainingLayouts,
        focusedId: state.focusedId === id ? null : state.focusedId,
      };
    }),
  focusWindow: (id) =>
    set((state) => {
      const existing = state.windows[id];
      if (!existing) return state;
      const newZ = state.maxZ + 1;
      return {
        windows: {
          ...state.windows,
          [id]: { ...existing, z: newZ, minimized: false },
        },
        focusedId: id,
        maxZ: newZ,
      };
    }),
  minimizeWindow: (id) =>
    set((state) => {
      const existing = state.windows[id];
      if (!existing) return state;
      return {
        windows: {
          ...state.windows,
          [id]: { ...existing, minimized: true },
        },
        focusedId: null,
      };
    }),
  clearFocus: () => set({ focusedId: null }),
  updatePosition: (id, x, y) =>
    set((state) => {
      if (!state.layouts[id]) return state;
      return {
        layouts: {
          ...state.layouts,
          [id]: { ...state.layouts[id], x, y },
        },
      };
    }),
  updateSize: (id, width, height) =>
    set((state) => {
      if (!state.layouts[id]) return state;
      return {
        layouts: {
          ...state.layouts,
          [id]: { ...state.layouts[id], width, height },
        },
      };
    }),
}));
