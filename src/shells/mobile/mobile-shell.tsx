import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, type PanInfo } from "motion/react";
import { toPng } from "html-to-image";
import {
  ArrowLeft,
  Calendar,
  Compass,
  FileText,
  Folder,
  Globe,
  Home,
  ImageIcon,
  Music,
  Radio,
  Signal,
  SquareStack,
  Terminal,
  Trash2,
  User,
  Wifi,
  X,
} from "lucide-react";
import { FaAddressBook } from "react-icons/fa6";
import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "@/store/app-store";
import { useAppSnapshotStore } from "@/store/app-snapshot-store";
import type { AppName } from "@/components/apps/app-registry";
import { AppRenderer } from "@/components/apps/app-renderer";
import {
  MobileNavigationProvider,
  useMobileNavigation,
} from "@/components/apps/mobile-navigation-context";
import { Wallpaper } from "@/screens/wallpaper";
import { BatteryItem } from "@/components/topbar/items/battery/battery-item";
import { ClockWidget } from "@/components/widgets/clock";
import { WelcomeWidget } from "@/components/widgets/welcome";
import styles from "./mobile-shell.module.css";

const mobileApps: { appName: AppName; label: string; Icon: React.ElementType }[] = [
  { appName: "PROFILE", label: "Profile", Icon: User },
  { appName: "TIMELINE", label: "Timeline", Icon: Calendar },
  { appName: "FILES", label: "Files", Icon: Folder },
  { appName: "TERMINAL", label: "Terminal", Icon: Terminal },
  { appName: "BROWSER", label: "Browser", Icon: Globe },
  { appName: "CONTACT", label: "Contact", Icon: FaAddressBook },
  { appName: "MUSIC", label: "Music", Icon: Music },
  { appName: "TRASH", label: "Trash", Icon: Trash2 },
];

const iconMap: Record<AppName, React.ElementType> = {
  WELCOME: Compass,
  PROFILE: User,
  TIMELINE: Calendar,
  FILES: Folder,
  TERMINAL: Terminal,
  BROWSER: Globe,
  CONTACT: FaAddressBook,
  MUSIC: Music,
  TRASH: Trash2,
  MD_VIEWER: FileText,
  IMAGE_VIEWER: ImageIcon,
  PLACEHOLDER: Radio,
};

function StatusBar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className={styles.statusBar}>
      <span>{time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
      <span className={styles.statusIcons}>
        <Signal size={12} />
        <Wifi size={12} />
        <BatteryItem />
      </span>
    </div>
  );
}

function MobileShellContent() {
  const appSurfaceRefs = useRef<Partial<Record<AppName, HTMLElement>>>({});
  const recentCarouselRef = useRef<HTMLDivElement>(null);
  const [focusedRecentId, setFocusedRecentId] = useState<AppName | null>(null);
  const snapshots = useAppSnapshotStore((state) => state.snapshots);
  const setSnapshot = useAppSnapshotStore((state) => state.setSnapshot);
  const removeSnapshot = useAppSnapshotStore((state) => state.removeSnapshot);
  const clearSnapshots = useAppSnapshotStore((state) => state.clearSnapshots);
  const pruneSnapshots = useAppSnapshotStore((state) => state.pruneSnapshots);
  const {
    apps,
    activeAppId,
    previousActiveAppId,
    mobileSurface,
    openApp,
    activateApp,
    closeApp,
    closeAllApps,
    showHome,
    showRecents,
    mobileBack,
  } = useAppStore(
    useShallow((state) => ({
      apps: state.apps,
      activeAppId: state.activeAppId,
      previousActiveAppId: state.previousActiveAppId,
      mobileSurface: state.mobileSurface,
      openApp: state.openApp,
      activateApp: state.activateApp,
      closeApp: state.closeApp,
      closeAllApps: state.closeAllApps,
      showHome: state.showHome,
      showRecents: state.showRecents,
      mobileBack: state.mobileBack,
    })),
  );

  const recentApps = useMemo(
    () => [...apps].sort((a, b) => b.lastOpenedAt - a.lastOpenedAt),
    [apps],
  );
  const navigation = useMobileNavigation();

  const captureApp = useCallback(
    async (appName: AppName | null) => {
      if (!appName) return;
      const node = appSurfaceRefs.current[appName];
      if (!node || node.offsetParent === null) return;

      try {
        const snapshot = await toPng(node, {
          backgroundColor: "#0d0a1a",
          cacheBust: true,
          pixelRatio: 1,
          skipFonts: true,
          imagePlaceholder:
            "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'/%3E",
        });
        setSnapshot(appName, snapshot);
      } catch {
        removeSnapshot(appName);
      }
    },
    [removeSnapshot, setSnapshot],
  );

  const handleOpenApp = useCallback(
    async (appName: AppName) => {
      if (mobileSurface === "app") await captureApp(activeAppId);
      openApp(appName);
    },
    [activeAppId, captureApp, mobileSurface, openApp],
  );

  const handleActivateApp = useCallback(
    (appName: AppName) => {
      activateApp(appName);
    },
    [activateApp],
  );

  const handleCloseApp = useCallback(
    (appName: AppName) => {
      removeSnapshot(appName);
      closeApp(appName);
      if (useAppStore.getState().apps.length === 0) {
        showHome();
      }
    },
    [closeApp, removeSnapshot, showHome],
  );

  const handleCloseAll = useCallback(() => {
    clearSnapshots();
    closeAllApps();
  }, [clearSnapshots, closeAllApps]);

  const handleShowHome = useCallback(async () => {
    if (mobileSurface === "app") await captureApp(activeAppId);
    showHome();
  }, [activeAppId, captureApp, mobileSurface, showHome]);

  const handleShowRecents = useCallback(async () => {
    if (mobileSurface === "recents") {
      showHome();
      return;
    }
    if (mobileSurface === "app") await captureApp(activeAppId);
    setFocusedRecentId(activeAppId ?? previousActiveAppId ?? recentApps[0]?.id ?? null);
    showRecents();
  }, [activeAppId, captureApp, mobileSurface, previousActiveAppId, recentApps, showHome, showRecents]);

  const handleBack = async () => {
    if (mobileSurface === "app" && navigation?.handleBack(activeAppId)) return;
    if (mobileSurface === "app") await captureApp(activeAppId);
    mobileBack();
  };

  useEffect(() => {
    pruneSnapshots(apps.map((app) => app.id));
  }, [apps, pruneSnapshots]);

  useEffect(() => {
    if (
      mobileSurface === "recents" &&
      (!focusedRecentId || !recentApps.some((app) => app.id === focusedRecentId))
    ) {
      setFocusedRecentId(recentApps[0]?.id ?? null);
    }
  }, [focusedRecentId, mobileSurface, recentApps]);

  useEffect(() => {
    if (mobileSurface !== "recents" || !focusedRecentId) return;
    const frame = requestAnimationFrame(() => {
      recentCarouselRef.current
        ?.querySelector<HTMLElement>(`[data-recent-id="${focusedRecentId}"]`)
        ?.scrollIntoView({ behavior: "instant", block: "nearest", inline: "center" });
    });
    return () => cancelAnimationFrame(frame);
  }, [focusedRecentId, mobileSurface]);

  const handleRecentScroll = useCallback(() => {
    const carousel = recentCarouselRef.current;
    if (!carousel) return;
    const carouselCenter = carousel.scrollLeft + carousel.clientWidth / 2;
    const cards = Array.from(carousel.querySelectorAll<HTMLElement>("[data-recent-id]"));
    const closest = cards.reduce<{ id: AppName; distance: number } | null>((current, card) => {
      const id = card.dataset.recentId as AppName | undefined;
      if (!id) return current;
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(carouselCenter - cardCenter);
      return !current || distance < current.distance ? { id, distance } : current;
    }, null);
    if (closest) setFocusedRecentId(closest.id);
  }, []);

  return (
    <motion.div
      className={styles.shell}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Wallpaper />
      <StatusBar />

      <main className={styles.screen}>
        <section
          className={`${styles.homeScreen} ${mobileSurface === "home" ? styles.visible : ""}`}
        >
          <ClockWidget />
          <div className={styles.appGrid}>
            <WelcomeWidget onOpen={() => void handleOpenApp("WELCOME")} />
            {Array.from({ length: 4 }, (_, i) => (
              <div key={`spacer-${i}`} className={styles.gridSpacer} />
            ))}
            {mobileApps.map(({ appName, label, Icon }) => (
              <button
                key={appName}
                type="button"
                className={styles.appIcon}
                onClick={() => void handleOpenApp(appName)}
              >
                <span className={styles.appIconGlyph}>
                  <Icon size={25} />
                </span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </section>

        <section
          className={`${styles.appLayer} ${mobileSurface === "app" ? styles.visible : ""}`}
          aria-hidden={mobileSurface !== "app"}
        >
          {apps.map((app) => (
            <article
              key={app.id}
              ref={(node) => {
                if (node) appSurfaceRefs.current[app.id] = node;
                else delete appSurfaceRefs.current[app.id];
              }}
              data-app-id={app.id}
              className={`${styles.appSurface} ${activeAppId === app.id ? styles.activeApp : ""}`}
            >
              <div className={styles.appContent}>
                <AppRenderer app={app} />
              </div>
            </article>
          ))}
        </section>

        <section
          className={`${styles.recents} ${mobileSurface === "recents" ? styles.visible : ""}`}
          aria-hidden={mobileSurface !== "recents"}
          onClick={() => { if (mobileSurface === "recents") showHome(); }}
        >
          <header className={styles.recentsHeader} onClick={(e) => e.stopPropagation()}>
            <span>PROCESS_MANAGER</span>
            <strong>{recentApps.length} RUNNING</strong>
          </header>
          <div
            ref={recentCarouselRef}
            className={styles.recentCarousel}
            onScroll={handleRecentScroll}
            onClick={(e) => e.stopPropagation()}
          >
            {recentApps.length === 0 ? (
              <div className={styles.emptyRecents}>[ NO_ACTIVE_PROCESSES ]</div>
            ) : (
              recentApps.map((app) => {
                const Icon = iconMap[app.appName];
                return (
                  <motion.article
                    key={app.id}
                    data-recent-id={app.id}
                    className={`${styles.recentCard} ${
                      focusedRecentId === app.id ? styles.focusedRecentCard : ""
                    }`}
                    drag="y"
                    dragConstraints={{ top: -120, bottom: 0 }}
                    dragElastic={0.35}
                    onDragEnd={(_event, info: PanInfo) => {
                      if (info.offset.y < -80 || info.velocity.y < -500) handleCloseApp(app.id);
                    }}
                  >
                    <div className={styles.recentCardHeader}>
                      <span className={styles.recentIdentity}>
                        <Icon size={16} />
                        <strong>{app.title}</strong>
                      </span>
                      <button
                        type="button"
                        className={styles.recentClose}
                        onClick={() => handleCloseApp(app.id)}
                        aria-label={`Close ${app.title}`}
                      >
                        <X size={17} />
                      </button>
                    </div>
                    <button
                      type="button"
                      className={styles.recentPreview}
                      onClick={() => handleActivateApp(app.id)}
                    >
                      {snapshots[app.id] ? (
                        <img src={snapshots[app.id]} alt={`${app.title} frozen preview`} />
                      ) : (
                        <span className={styles.previewFallback}>
                          <Icon size={48} />
                          <strong>{app.title}</strong>
                          <small>PREVIEW_SIGNAL_UNAVAILABLE</small>
                        </span>
                      )}
                    </button>
                  </motion.article>
                );
              })
            )}
          </div>
          {recentApps.length > 0 && (
            <button type="button" className={styles.clearAll} onClick={(e) => { e.stopPropagation(); handleCloseAll(); }}>
              CLEAR ALL
            </button>
          )}
        </section>
      </main>

      <nav className={styles.navigation} aria-label="Mobile navigation">
        <button type="button" onClick={() => void handleBack()} aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <button type="button" onClick={() => void handleShowHome()} aria-label="Home">
          <Home size={20} />
        </button>
        <button type="button" onClick={() => void handleShowRecents()} aria-label="Recent apps">
          <SquareStack size={20} />
        </button>
      </nav>
    </motion.div>
  );
}

export function MobileShell() {
  return (
    <MobileNavigationProvider>
      <MobileShellContent />
    </MobileNavigationProvider>
  );
}
