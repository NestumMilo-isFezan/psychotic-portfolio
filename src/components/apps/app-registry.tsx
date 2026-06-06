import { lazy, type FC } from "react";

export type AppName =
  | "WELCOME"
  | "TERMINAL"
  | "MUSIC"
  | "FILES"
  | "MD_VIEWER"
  | "IMAGE_VIEWER"
  | "PROFILE"
  | "CONTACT"
  | "PLACEHOLDER"
  | "TIMELINE"
  | "TRASH"
  | "BROWSER";

export interface AppProps {
  windowId: string;
  appName: AppName;
  iconName?: string;
  params?: Record<string, unknown>;
}

export interface AppDefinition {
  appName: AppName;
  title: string;
  iconName: string;
  desktopSize: { width: number; height: number };
  component: FC<AppProps>;
}

const components: Record<AppName, FC<AppProps>> = {
  WELCOME: lazy(() => import("./welcome/welcome-app").then((m) => ({ default: m.WelcomeApp }))),
  TERMINAL: lazy(() => import("./terminal/terminal-app").then((m) => ({ default: m.TerminalApp }))),
  MUSIC: lazy(() => import("./music/music-app").then((m) => ({ default: m.MusicApp }))),
  FILES: lazy(() => import("./files/files-app").then((m) => ({ default: m.FilesApp }))),
  MD_VIEWER: lazy(() =>
    import("./markdown-viewer/markdown-viewer-app").then((m) => ({ default: m.MarkdownViewerApp })),
  ),
  IMAGE_VIEWER: lazy(() =>
    import("./image-viewer/image-viewer-app").then((m) => ({ default: m.ImageViewerApp })),
  ),
  PROFILE: lazy(() => import("./profile/profile-app").then((m) => ({ default: m.ProfileApp }))),
  CONTACT: lazy(() => import("./contact/contact-app").then((m) => ({ default: m.ContactApp }))),
  PLACEHOLDER: lazy(() =>
    import("./placeholder/placeholder-app").then((m) => ({ default: m.PlaceholderApp })),
  ),
  TIMELINE: lazy(() => import("./timeline/timeline-app").then((m) => ({ default: m.TimelineApp }))),
  TRASH: lazy(() => import("./trash/trash-app").then((m) => ({ default: m.TrashApp }))),
  BROWSER: lazy(() => import("./browser/browser-app").then((m) => ({ default: m.BrowserApp }))),
};

const dimensions: Partial<Record<AppName, { width: number; height: number }>> = {
  WELCOME: { width: 1270, height: 720 },
  MUSIC: { width: 900, height: 700 },
  PROFILE: { width: 760, height: 580 },
  CONTACT: { width: 620, height: 420 },
  BROWSER: { width: 750, height: 580 },
  MD_VIEWER: { width: 600, height: 500 },
  IMAGE_VIEWER: { width: 400, height: 400 },
};

const iconNames: Record<AppName, string> = {
  FILES: "FS",
  WELCOME: "COMPASS",
  TERMINAL: "TERM",
  PROFILE: "USER",
  TIMELINE: "CAL",
  BROWSER: "WEB",
  CONTACT: "CONTACT",
  MUSIC: "AUDIO",
  TRASH: "NULL",
  MD_VIEWER: "MD",
  IMAGE_VIEWER: "IMG",
  PLACEHOLDER: "APP",
};

export const appRegistry = Object.fromEntries(
  (Object.keys(components) as AppName[]).map((appName) => [
    appName,
    {
      appName,
      title: `${appName.toLowerCase()}.app`,
      iconName: iconNames[appName],
      desktopSize: dimensions[appName] ?? { width: 600, height: 450 },
      component: components[appName],
    },
  ]),
) as Record<AppName, AppDefinition>;

export const getAppDefinition = (appName: AppName): AppDefinition => {
  return appRegistry[appName] ?? appRegistry.PLACEHOLDER;
};

export const getAppComponent = (appName: AppName): FC<AppProps> => {
  return getAppDefinition(appName).component;
};
