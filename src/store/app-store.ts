import { create } from "zustand";
import { getAppDefinition, type AppName } from "../components/apps/app-registry";

export interface AppInstance {
  id: AppName;
  appName: AppName;
  title: string;
  iconName: string;
  params?: Record<string, unknown>;
  lastOpenedAt: number;
}

export type MobileSurface = "home" | "app" | "recents";

interface OpenAppOptions {
  title?: string;
  params?: Record<string, unknown>;
}

interface AppState {
  apps: AppInstance[];
  activeAppId: AppName | null;
  previousActiveAppId: AppName | null;
  mobileSurface: MobileSurface;
  openApp: (appName: AppName, options?: OpenAppOptions) => void;
  activateApp: (appName: AppName) => void;
  updateAppParams: (appName: AppName, params: Record<string, unknown>) => void;
  closeApp: (appName: AppName) => void;
  closeAllApps: () => void;
  showHome: () => void;
  showRecents: () => void;
  mobileBack: () => void;
}

let latestOpenedAt = 0;

const getNextOpenedAt = () => {
  latestOpenedAt = Math.max(Date.now(), latestOpenedAt + 1);
  return latestOpenedAt;
};

const touchApp = (app: AppInstance): AppInstance => ({ ...app, lastOpenedAt: getNextOpenedAt() });

export const useAppStore = create<AppState>((set) => ({
  apps: [],
  activeAppId: null,
  previousActiveAppId: null,
  mobileSurface: "home",

  openApp: (appName, options) =>
    set((state) => {
      const definition = getAppDefinition(appName);
      const existing = state.apps.find((app) => app.id === appName);
      const nextApp: AppInstance = {
        id: appName,
        appName,
        title: options?.title ?? existing?.title ?? definition.title,
        iconName: definition.iconName,
        params: options?.params ?? existing?.params,
        lastOpenedAt: getNextOpenedAt(),
      };

      return {
        apps: existing
          ? state.apps.map((app) => (app.id === appName ? nextApp : app))
          : [...state.apps, nextApp],
        previousActiveAppId: state.activeAppId,
        activeAppId: appName,
        mobileSurface: "app",
      };
    }),

  activateApp: (appName) =>
    set((state) => {
      if (!state.apps.some((app) => app.id === appName)) return state;
      return {
        apps: state.apps.map((app) => (app.id === appName ? touchApp(app) : app)),
        previousActiveAppId: state.activeAppId,
        activeAppId: appName,
        mobileSurface: "app",
      };
    }),

  updateAppParams: (appName, params) =>
    set((state) => ({
      apps: state.apps.map((app) =>
        app.id === appName ? { ...app, params, lastOpenedAt: getNextOpenedAt() } : app,
      ),
    })),

  closeApp: (appName) =>
    set((state) => {
      const apps = state.apps.filter((app) => app.id !== appName);
      const wasActive = state.activeAppId === appName;
      return {
        apps,
        activeAppId: wasActive ? null : state.activeAppId,
        previousActiveAppId:
          state.previousActiveAppId === appName ? null : state.previousActiveAppId,
        mobileSurface: wasActive && state.mobileSurface === "app" ? "home" : state.mobileSurface,
      };
    }),

  closeAllApps: () =>
    set({
      apps: [],
      activeAppId: null,
      previousActiveAppId: null,
      mobileSurface: "home",
    }),

  showHome: () =>
    set((state) => ({
      previousActiveAppId: state.activeAppId,
      activeAppId: null,
      mobileSurface: "home",
    })),

  showRecents: () =>
    set((state) => ({
      previousActiveAppId: state.activeAppId ?? state.previousActiveAppId,
      mobileSurface: "recents",
    })),

  mobileBack: () =>
    set((state) => {
      if (state.mobileSurface === "recents" && state.previousActiveAppId) {
        return {
          activeAppId: state.previousActiveAppId,
          mobileSurface: "app",
        };
      }
      if (state.mobileSurface !== "home") {
        return {
          previousActiveAppId: state.activeAppId,
          activeAppId: null,
          mobileSurface: "home",
        };
      }
      return state;
    }),
}));
