import { create } from "zustand";

export interface WindowLayout {
  x: number;
  y: number;
  width: number | string;
  height: number | string;
}

export interface WindowData {
  id: string;
  title: string;
  z: number;
  focused: boolean;
  minimized?: boolean;
  appName: string;
  iconName?: string;
  params?: Record<string, unknown>;
}

interface WindowState {
  windows: WindowData[];
  layouts: Record<string, WindowLayout>;
  maxZ: number;
  addWindow: (window: Omit<WindowData, "z" | "focused"> & WindowLayout) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  clearFocus: () => void;
  updatePosition: (id: string, x: number, y: number) => void;
  updateSize: (id: string, width: number | string, height: number | string) => void;
}

export const useWindowStore = create<WindowState>((set) => ({
  windows: [],
  layouts: {},
  maxZ: 10,
  addWindow: (window) =>
    set((state) => {
      const exists = state.windows.some((w) => w.id === window.id);
      const newZ = state.maxZ + 1;

      const { x, y, width, height, ...lifecycle } = window;
      const layout: WindowLayout = { x, y, width, height };

      if (exists) {
        return {
          windows: state.windows.map((w) =>
            w.id === window.id
              ? { ...w, z: newZ, focused: true, minimized: false }
              : { ...w, focused: false },
          ),
          layouts: {
            ...state.layouts,
            [window.id]: layout,
          },
          maxZ: newZ,
        };
      }

      return {
        windows: [
          ...state.windows.map((w) => ({ ...w, focused: false })),
          { ...lifecycle, z: newZ, focused: true, minimized: false },
        ],
        layouts: {
          ...state.layouts,
          [window.id]: layout,
        },
        maxZ: newZ,
      };
    }),
  closeWindow: (id) =>
    set((state) => {
      const { [id]: _, ...remainingLayouts } = state.layouts;
      return {
        windows: state.windows.filter((w) => w.id !== id),
        layouts: remainingLayouts,
      };
    }),
  focusWindow: (id) =>
    set((state) => {
      const newZ = state.maxZ + 1;
      return {
        windows: state.windows.map((w) =>
          w.id === id
            ? { ...w, z: newZ, focused: true, minimized: false }
            : { ...w, focused: false },
        ),
        maxZ: newZ,
      };
    }),
  minimizeWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, minimized: true, focused: false } : w,
      ),
    })),
  clearFocus: () =>
    set((state) => ({
      windows: state.windows.map((w) => ({ ...w, focused: false })),
    })),
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
