import { create } from "zustand";

export interface WindowData {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number | string;
  height: number | string;
  z: number;
  focused: boolean;
  minimized?: boolean;
  appName: string;
  iconName?: string;
  params?: Record<string, unknown>;
}

interface WindowState {
  windows: WindowData[];
  maxZ: number;
  addWindow: (window: Omit<WindowData, "z" | "focused">) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  clearFocus: () => void;
  updatePosition: (id: string, x: number, y: number) => void;
  updateSize: (id: string, width: number | string, height: number | string) => void;
}

export const useWindowStore = create<WindowState>((set) => ({
  windows: [],
  maxZ: 10,
  addWindow: (window) =>
    set((state) => {
      const exists = state.windows.some((w) => w.id === window.id);
      const newZ = state.maxZ + 1;

      if (exists) {
        return {
          windows: state.windows.map((w) =>
            w.id === window.id
              ? { ...w, z: newZ, focused: true, minimized: false }
              : { ...w, focused: false },
          ),
          maxZ: newZ,
        };
      }

      return {
        windows: [
          ...state.windows.map((w) => ({ ...w, focused: false })),
          { ...window, z: newZ, focused: true, minimized: false },
        ],
        maxZ: newZ,
      };
    }),
  closeWindow: (id) =>
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== id),
    })),
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
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, x, y } : w)),
    })),
  updateSize: (id, width, height) =>
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, width, height } : w)),
    })),
}));
