import { lazy, type FC } from "react";

export interface AppProps {
  windowId: string;
  appName: string;
  iconName?: string;
  params?: Record<string, any>;
}

export const appRegistry: Record<string, FC<AppProps>> = {
  WELCOME: lazy(() => import("./welcome/welcome-app").then(m => ({ default: m.WelcomeApp }))),
  TERMINAL: lazy(() => import("./terminal/terminal-app").then(m => ({ default: m.TerminalApp }))),
  MUSIC: lazy(() => import("./music/music-app").then(m => ({ default: m.MusicApp }))),
  FILES: lazy(() => import("./files/files-app").then(m => ({ default: m.FilesApp }))),
  MD_VIEWER: lazy(() => import("./markdown-viewer/markdown-viewer-app").then(m => ({ default: m.MarkdownViewerApp }))),
  IMAGE_VIEWER: lazy(() => import("./image-viewer/image-viewer-app").then(m => ({ default: m.ImageViewerApp }))),
  PROFILE: lazy(() => import("./profile/profile-app").then(m => ({ default: m.ProfileApp }))),
  CONTACT: lazy(() => import("./contact/contact-app").then(m => ({ default: m.ContactApp }))),
  PLACEHOLDER: lazy(() => import("./placeholder/placeholder-app").then(m => ({ default: m.PlaceholderApp }))),
  TIMELINE: lazy(() => import("./timeline/timeline-app").then(m => ({ default: m.TimelineApp }))),
  TRASH: lazy(() => import("./trash/trash-app").then(m => ({ default: m.TrashApp }))),
  BROWSER: lazy(() => import("./browser/browser-app").then(m => ({ default: m.BrowserApp }))),
};

export const getAppComponent = (appName: string): FC<AppProps> => {
  return appRegistry[appName] || appRegistry.PLACEHOLDER;
};
