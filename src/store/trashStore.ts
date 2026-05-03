import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TrashState {
  novelExists: boolean;
  restoreNovel: () => void;
  destroyNovel: () => void;
}

export const useTrashStore = create<TrashState>()(
  persist(
    (set) => ({
      novelExists: true,
      restoreNovel: () => set({ novelExists: true }),
      destroyNovel: () => set({ novelExists: false }),
    }),
    {
      name: "trash-store",
    },
  ),
);
