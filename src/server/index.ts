import "dotenv/config";
import { Hono } from "hono";
import { Innertube } from "youtubei.js";
import { readdir } from "node:fs/promises";
import { join, extname } from "node:path";

const app = new Hono();

let yt: Innertube | null = null;

// Initialize YouTubei.js on first request or at startup
const ensureInitialized = async () => {
  if (!yt) {
    const cookie = process.env.YTM_COOKIE;
    yt = await Innertube.create({
      cookie: cookie || "",
      generate_session_locally: true,
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        headers.set(
          "User-Agent",
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36",
        );
        return fetch(input, { ...init, headers });
      },
    });
    console.log("Session Logged In:", yt.session.logged_in);
  }
};

app.get("/api/hello", (c) => {
  return c.json({
    message: "Hello from Hono!",
    time: new Date().toISOString(),
  });
});

interface FileItem {
  name: string;
  type: "folder" | "file";
  extension?: string;
  path: string;
  contents?: FileItem[];
}

app.get("/api/files", async (c) => {
  const rootDir = join(process.cwd(), "public", "files");

  const scan = async (dir: string, relativePath: string = ""): Promise<FileItem[]> => {
    try {
      const HIDDEN_DIRS = new Set(["trash"]);
      const entries = await readdir(dir, { withFileTypes: true });
      const items = await Promise.all(
        entries
          .filter((entry) => !(entry.isDirectory() && HIDDEN_DIRS.has(entry.name)))
          .map(async (entry) => {
            const fullPath = join(dir, entry.name);
            const relPath = join(relativePath, entry.name).replace(/\\/g, "/");

            if (entry.isDirectory()) {
              return {
                name: entry.name,
                type: "folder" as const,
                path: `/${relPath}`,
                contents: await scan(fullPath, relPath),
              };
            } else {
              return {
                name: entry.name,
                type: "file" as const,
                extension: extname(entry.name).slice(1).toLowerCase(),
                path: `/files/${relPath}`,
              };
            }
          }),
      );
      return items;
    } catch {
      return [];
    }
  };

  const fileTree = await scan(rootDir);
  return c.json({ tree: fileTree });
});

app.get("/api/ytm/search", async (c) => {
  const query = c.req.query("q");
  if (!query) return c.json({ error: "Missing query" }, 400);

  await ensureInitialized();
  const results = await yt!.music.search(query);
  return c.json(results);
});

app.get("/api/ytm/home", async (c) => {
  await ensureInitialized();
  try {
    const homeFeed = await yt!.music.getHomeFeed();
    return c.json(homeFeed);
  } catch (error) {
    return c.json({ error: "Failed to fetch home sections", details: String(error) }, 500);
  }
});

app.get("/api/ytm/liked", async (c) => {
  await ensureInitialized();
  try {
    const playlist = await yt!.music.getPlaylist("LM");
    return c.json(playlist);
  } catch (error) {
    return c.json({ error: "Failed to fetch liked songs", details: String(error) }, 500);
  }
});

interface YTMItem {
  item_type?: string;
  [key: string]: unknown;
}

interface YTMShelf {
  header?: {
    title?: {
      text?: string;
    };
  };
  contents?: YTMItem[];
}

app.get("/api/ytm/history", async (c) => {
  await ensureInitialized();
  try {
    const home = await yt!.music.getHomeFeed();
    const sections = (home.sections as unknown as YTMShelf[]) || [];

    // Find "Listen again" shelf
    const listenAgainShelf =
      sections.find((s) => s.header?.title?.text?.toLowerCase().includes("listen again")) ||
      sections[0];

    let tracks: YTMItem[] = [];
    if (listenAgainShelf && listenAgainShelf.contents) {
      tracks = listenAgainShelf.contents
        .filter((item) => item.item_type === "video" || item.item_type === "song")
        .slice(0, 8);
    }

    return c.json({ tracks });
  } catch (error) {
    return c.json({ error: "Failed to fetch music history", details: String(error) }, 500);
  }
});

// Eager initialization on startup
void ensureInitialized();

// Production static serving
if (process.env.NODE_ENV === "production") {
  const { serveStatic } = await import("hono/bun");
  app.use("/*", serveStatic({ root: "./dist" }));
}

const port = Number(process.env.PORT) || 3000;

export default {
  port,
  fetch: app.fetch,
};
