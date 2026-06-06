import { create } from "zustand";
import type { AppName } from "../components/apps/app-registry";

export type AppSnapshots = Partial<Record<AppName, string>>;

interface AppSnapshotState {
  snapshots: AppSnapshots;
  setSnapshot: (appName: AppName, image: string) => void;
  removeSnapshot: (appName: AppName) => void;
  clearSnapshots: () => void;
  pruneSnapshots: (runningApps: AppName[]) => void;
}

export const useAppSnapshotStore = create<AppSnapshotState>((set) => ({
  snapshots: {},
  setSnapshot: (appName, image) =>
    set((state) => ({
      snapshots: { ...state.snapshots, [appName]: image },
    })),
  removeSnapshot: (appName) =>
    set((state) => {
      const { [appName]: _, ...remaining } = state.snapshots;
      return { snapshots: remaining };
    }),
  clearSnapshots: () => set({ snapshots: {} }),
  pruneSnapshots: (runningApps) =>
    set((state) => {
      const runningIds = new Set(runningApps);
      return {
        snapshots: Object.fromEntries(
          Object.entries(state.snapshots).filter(([appName]) => runningIds.has(appName as AppName)),
        ),
      };
    }),
}));
