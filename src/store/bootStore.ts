import { create } from "zustand";

interface BootPhase {
  threshold: number;
  text: string;
}

const PHASES: BootPhase[] = [
  { threshold: 0, text: "INITIALIZING PSYCHOS OS..." },
  { threshold: 15, text: "LOADING KERNEL MODULES..." },
  { threshold: 30, text: "MOUNTING FILE SYSTEMS..." },
  { threshold: 50, text: "SPAWNING DAEMON PROCESSES..." },
  { threshold: 65, text: "CALIBRATING REALITY ENGINE..." },
  { threshold: 80, text: "SYNCING NEURAL INTERFACE..." },
  { threshold: 95, text: "HANDSHAKE COMPLETE. WELCOME." },
];

function getStatusText(progress: number): string {
  let current = PHASES[0].text;
  for (const phase of PHASES) {
    if (progress >= phase.threshold) {
      current = phase.text;
    }
  }
  return current;
}

interface BootState {
  progress: number;
  statusText: string;
  isDone: boolean;
  start: () => void;
}

export const useBootStore = create<BootState>((set, get) => ({
  progress: 0,
  statusText: PHASES[0].text,
  isDone: false,

  start: () => {
    const PHASE_THRESHOLDS = PHASES.map((p) => p.threshold);
    let lastPhaseIndex = 0;

    const tick = () => {
      const { progress } = get();

      if (progress >= 100) {
        set({ progress: 100, isDone: true, statusText: PHASES[PHASES.length - 1].text });
        return;
      }

      // Slow down near phase boundaries to let text breathe
      const nextPhaseIdx = PHASE_THRESHOLDS.findIndex((t, i) => i > lastPhaseIndex && t > progress);
      const nextThreshold = nextPhaseIdx !== -1 ? PHASE_THRESHOLDS[nextPhaseIdx] : 100;
      const distanceToNext = nextThreshold - progress;

      let step: number;
      if (distanceToNext <= 2) {
        step = 0.5;
      } else {
        step = Math.random() * 2.5 + 0.5;
      }

      const newProgress = Math.min(progress + step, 100);
      const newText = getStatusText(newProgress);
      const newPhaseIdx = PHASE_THRESHOLDS.filter((t) => newProgress >= t).length - 1;

      if (newPhaseIdx > lastPhaseIndex) {
        lastPhaseIndex = newPhaseIdx;
      }

      set({ progress: newProgress, statusText: newText });

      if (newProgress >= 100) {
        set({ isDone: true });
        return;
      }

      const delay = distanceToNext <= 2 ? 80 : Math.random() * 40 + 20;
      setTimeout(tick, delay);
    };

    setTimeout(tick, 300);
  },
}));
