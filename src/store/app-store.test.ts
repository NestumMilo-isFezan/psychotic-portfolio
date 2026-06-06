import { beforeEach, describe, expect, test } from "bun:test";
import { useAppStore } from "./app-store";
import { useMusicStore } from "./music-store";

beforeEach(() => {
  useAppStore.setState({
    apps: [],
    activeAppId: null,
    previousActiveAppId: null,
    mobileSurface: "home",
  });
  useMusicStore.getState().clearPlayer();
});

describe("app lifecycle", () => {
  test("opens only one instance of an app", () => {
    const { openApp } = useAppStore.getState();
    openApp("PROFILE");
    openApp("PROFILE");

    expect(useAppStore.getState().apps).toHaveLength(1);
    expect(useAppStore.getState().activeAppId).toBe("PROFILE");
  });

  test("replaces singleton viewer content", () => {
    const { openApp } = useAppStore.getState();
    openApp("IMAGE_VIEWER", { title: "first.jpg", params: { path: "/first.jpg" } });
    openApp("IMAGE_VIEWER", { title: "second.jpg", params: { path: "/second.jpg" } });

    expect(useAppStore.getState().apps).toEqual([
      expect.objectContaining({
        id: "IMAGE_VIEWER",
        title: "second.jpg",
        params: { path: "/second.jpg" },
      }),
    ]);
  });

  test("touches recency when an app is activated", () => {
    const originalNow = Date.now;
    let now = 1;
    Date.now = () => now++;
    try {
      const { openApp, activateApp } = useAppStore.getState();
      openApp("FILES");
      openApp("PROFILE");
      activateApp("FILES");

      const files = useAppStore.getState().apps.find((app) => app.id === "FILES");
      const profile = useAppStore.getState().apps.find((app) => app.id === "PROFILE");
      expect(files!.lastOpenedAt).toBeGreaterThan(profile!.lastOpenedAt);
    } finally {
      Date.now = originalNow;
    }
  });

  test("keeps recency deterministic when apps open in the same millisecond", () => {
    const originalNow = Date.now;
    Date.now = () => 1;
    try {
      const { openApp } = useAppStore.getState();
      openApp("TIMELINE");
      openApp("PROFILE");

      const recentApps = [...useAppStore.getState().apps].sort(
        (a, b) => b.lastOpenedAt - a.lastOpenedAt,
      );
      expect(recentApps.map((app) => app.id)).toEqual(["PROFILE", "TIMELINE"]);
    } finally {
      Date.now = originalNow;
    }
  });

  test("closes one app and clears all running apps", () => {
    const { openApp, closeApp, closeAllApps } = useAppStore.getState();
    openApp("FILES");
    openApp("PROFILE");
    closeApp("FILES");
    expect(useAppStore.getState().apps.map((app) => app.id)).toEqual(["PROFILE"]);

    closeAllApps();
    expect(useAppStore.getState().apps).toHaveLength(0);
    expect(useAppStore.getState().mobileSurface).toBe("home");
  });

  test("clear all does not reset global music playback", () => {
    const track = { id: "track", title: "Track", artist: "Artist", thumbnail: "" };
    useMusicStore.getState().playTrack(track, [track], 0);
    useAppStore.getState().openApp("MUSIC");

    useAppStore.getState().closeAllApps();

    expect(useMusicStore.getState().currentTrack?.id).toBe("track");
    expect(useMusicStore.getState().hasStartedMusic).toBe(true);
  });
});
