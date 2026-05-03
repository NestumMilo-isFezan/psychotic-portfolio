import type { MusicItem } from "./types";

const extractThumbnailUrl = (obj: unknown): string => {
  if (!obj || typeof obj !== "object") return "";

  const record = obj as Record<string, unknown>;
  const potentialUrl = record.url || record.src;

  if (
    typeof potentialUrl === "string" &&
    (potentialUrl.startsWith("http") || potentialUrl.startsWith("//"))
  ) {
    return potentialUrl.startsWith("//") ? `https:${potentialUrl}` : potentialUrl;
  }

  const keysToSearch = [
    "thumbnails",
    "thumbnail",
    "contents",
    "image",
    "thumbnails_overlay",
    "thumbnail_renderer",
    "music_thumbnail_renderer",
    "header",
    "icon",
    "icons",
  ];

  for (const key of keysToSearch) {
    const value = record[key];
    if (!value) continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        const url = extractThumbnailUrl(item);
        if (url) return url;
      }
      continue;
    }

    if (typeof value === "object") {
      const url = extractThumbnailUrl(value);
      if (url) return url;
    }
  }

  if (typeof record.videoId === "string") {
    return `https://i.ytimg.com/vi/${record.videoId}/mqdefault.jpg`;
  }

  if (typeof record.id === "string" && record.id.length === 11) {
    return `https://i.ytimg.com/vi/${record.id}/mqdefault.jpg`;
  }

  return "";
};

export const normalizeMusicTrack = (track: Record<string, unknown>): MusicItem | null => {
  const id =
    typeof track.id === "string"
      ? track.id
      : typeof track.videoId === "string"
        ? track.videoId
        : "";

  if (!id) return null;

  const titleValue = track.title;
  const authorValue = track.author;
  const subtitleValue = track.subtitle;

  const title =
    typeof titleValue === "object" && titleValue && "text" in titleValue
      ? String(titleValue.text)
      : typeof titleValue === "string"
        ? titleValue
        : "Unknown Title";

  const artist =
    typeof authorValue === "object" && authorValue && "name" in authorValue
      ? String(authorValue.name)
      : typeof subtitleValue === "object" && subtitleValue && "text" in subtitleValue
        ? String(subtitleValue.text)
        : typeof authorValue === "string"
          ? authorValue
          : "Unknown Artist";

  return {
    id,
    title,
    artist,
    thumbnail: extractThumbnailUrl(track),
    raw: track,
  };
};
