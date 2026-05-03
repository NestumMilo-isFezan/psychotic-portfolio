import { lazy, type FC } from "react";

export interface AppProps {
  windowId: string;
  appName: string;
  iconName?: string;
  params?: Record<string, any>;
}

export const appRegistry: Record<string, FC<AppProps>> = {
  WELCOME: lazy(() => import("./WelcomeApp").then(m => ({ default: m.WelcomeApp }))),
  TERMINAL: lazy(() => import("./TerminalApp").then(m => ({ default: m.TerminalApp }))),
  MUSIC: lazy(() => import("./MusicApp").then(m => ({ default: m.MusicApp }))),
  FILES: lazy(() => import("./FilesApp").then(m => ({ default: m.FilesApp }))),
  MD_VIEWER: lazy(() => import("./MarkdownViewerApp").then(m => ({ default: m.MarkdownViewerApp }))),
  IMAGE_VIEWER: lazy(() => import("./ImageViewerApp").then(m => ({ default: m.ImageViewerApp }))),
  PROFILE: lazy(() => import("./ProfileApp").then(m => ({ default: m.ProfileApp }))),
  CONTACT: lazy(() => import("./ContactApp").then(m => ({ default: m.ContactApp }))),
  PLACEHOLDER: lazy(() => import("./PlaceholderApp").then(m => ({ default: m.PlaceholderApp }))),
  TIMELINE: lazy(() => import("./TimelineApp/TimelineApp").then(m => ({ default: m.TimelineApp }))),
  TRASH: lazy(() => import("./TrashApp").then(m => ({ default: m.TrashApp }))),
  BROWSER: lazy(() => import("./BrowserApp").then(m => ({ default: m.BrowserApp }))),
};

export const getAppComponent = (appName: string): FC<AppProps> => {
  return appRegistry[appName] || appRegistry.PLACEHOLDER;
};
