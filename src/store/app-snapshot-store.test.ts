import { beforeEach, describe, expect, test } from "bun:test";
import { useAppSnapshotStore } from "./app-snapshot-store";

beforeEach(() => {
  useAppSnapshotStore.setState({ snapshots: {} });
});

describe("app snapshot lifecycle", () => {
  test("keeps snapshots in shared memory", () => {
    const { setSnapshot } = useAppSnapshotStore.getState();
    setSnapshot("PROFILE", "profile-image");
    setSnapshot("FILES", "files-image");

    expect(useAppSnapshotStore.getState().snapshots).toEqual({
      PROFILE: "profile-image",
      FILES: "files-image",
    });
  });

  test("removes only the closed app snapshot", () => {
    const { setSnapshot, removeSnapshot } = useAppSnapshotStore.getState();
    setSnapshot("PROFILE", "profile-image");
    setSnapshot("FILES", "files-image");
    removeSnapshot("PROFILE");

    expect(useAppSnapshotStore.getState().snapshots).toEqual({
      FILES: "files-image",
    });
  });

  test("prunes snapshots without running apps", () => {
    const { setSnapshot, pruneSnapshots } = useAppSnapshotStore.getState();
    setSnapshot("PROFILE", "profile-image");
    setSnapshot("FILES", "files-image");
    pruneSnapshots(["PROFILE"]);

    expect(useAppSnapshotStore.getState().snapshots).toEqual({
      PROFILE: "profile-image",
    });
  });

  test("clears every snapshot", () => {
    const { setSnapshot, clearSnapshots } = useAppSnapshotStore.getState();
    setSnapshot("PROFILE", "profile-image");
    clearSnapshots();

    expect(useAppSnapshotStore.getState().snapshots).toEqual({});
  });
});
