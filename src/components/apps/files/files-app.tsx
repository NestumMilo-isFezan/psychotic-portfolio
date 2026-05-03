import React, { useState, useCallback, useEffect } from "react";
import { FaFolder, FaFolderOpen, FaFileLines, FaImage, FaChevronLeft } from "react-icons/fa6";
import { useWindowStore } from "@/store/window-store";
import styles from "./files-app.module.css";

interface FileItem {
  name: string;
  type: "folder" | "file";
  extension?: string;
  path: string;
  contents?: FileItem[];
}

import type { AppProps } from "@/components/apps/app-registry";

function getTypeBadge(item: FileItem): string {
  if (item.type === "folder") return "DIR";
  const ext = item.extension?.toUpperCase();
  if (ext === "MD") return "MD";
  if (ext === "GIF") return "GIF";
  if (["JPEG", "JPG", "PNG", "WEBP"].includes(ext || "")) return "IMG";
  return ext || "FILE";
}

export const FilesApp: React.FC<AppProps> = () => {
  const [currentPath, setCurrentPath] = useState("/");
  const [fileTree, setFileTree] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const addWindow = useWindowStore((state) => state.addWindow);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch("/api/files");
        const data = await res.json();
        setFileTree(data.tree);
      } catch (e) {
        console.error("Failed to fetch files:", e);
      } finally {
        setLoading(false);
      }
    };
    void fetchFiles();
  }, []);

  const items = (() => {
    if (currentPath === "/") return fileTree;

    const parts = currentPath.split("/").filter(Boolean);
    let current = fileTree;
    for (const part of parts) {
      const found = current.find((i) => i.name === part && i.type === "folder");
      if (found && found.contents) {
        current = found.contents;
      } else {
        return [];
      }
    }
    return current;
  })();

  const openFile = useCallback(
    (item: FileItem) => {
      const { extension, path, name } = item;

      if (extension === "md") {
        addWindow({
          id: `md-${Date.now()}`,
          title: name,
          x: 100 + Math.random() * 100,
          y: 100 + Math.random() * 100,
          width: 600,
          height: 500,
          appName: "MD_VIEWER",
          params: { path },
        });
      } else if (["jpeg", "jpg", "png", "gif", "webp"].includes(extension || "")) {
        addWindow({
          id: `img-${Date.now()}`,
          title: name,
          x: 150 + Math.random() * 100,
          y: 150 + Math.random() * 100,
          width: 400,
          height: 400,
          appName: "IMAGE_VIEWER",
          params: { path },
        });
      }
    },
    [addWindow],
  );

  const handleItemClick = useCallback(
    (item: FileItem) => {
      if (item.type === "folder") {
        setCurrentPath(item.path);
      } else {
        openFile(item);
      }
    },
    [openFile],
  );

  const goBack = useCallback(() => {
    if (currentPath === "/") return;
    const parts = currentPath.split("/").filter(Boolean);
    parts.pop();
    const newPath = parts.length > 0 ? "/" + parts.join("/") : "/";
    setCurrentPath(newPath);
  }, [currentPath]);

  const activeFolderName = currentPath === "/" ? null : currentPath.split("/").filter(Boolean)[0];
  const displayPath = currentPath === "/" ? "~" : `~${currentPath}`;

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <span className={styles.loadingText}>[ SCANNING_PHYSICAL_STORAGE ]</span>
          <span className={styles.loadingCursor}>▮</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* ── TOOLBAR ── */}
      <div className={styles.toolbar}>
        <button
          className={`${styles.backBtn} ${currentPath === "/" ? styles.disabled : ""}`}
          onClick={() => currentPath !== "/" && goBack()}
          title="Go Back"
          data-cursor-mode="pointer"
          disabled={currentPath === "/"}
        >
          <FaChevronLeft size={14} />
        </button>
        <div className={styles.pathBar}>
          <span className={styles.pathPrompt}>&gt;</span>
          <span className={styles.pathText}>{displayPath}</span>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className={styles.body}>
        {/* ── SIDEBAR ── */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarTitle}>VOLUMES</div>
          {fileTree.map((folder) => (
            <div
              key={folder.path}
              className={`${styles.sidebarItem} ${activeFolderName === folder.name ? styles.sidebarActive : ""}`}
              onClick={() => setCurrentPath(folder.path)}
              data-cursor-mode="pointer"
            >
              {activeFolderName === folder.name ? (
                <FaFolderOpen size={13} className={styles.sidebarIcon} />
              ) : (
                <FaFolder size={13} className={styles.sidebarIcon} />
              )}
              <span>{folder.name}</span>
            </div>
          ))}
        </div>

        {/* ── FILE LIST ── */}
        <div className={styles.filePanel}>
          {items.length === 0 ? (
            <div className={styles.empty}>[ DIRECTORY_EMPTY ]</div>
          ) : (
            <table className={styles.fileTable}>
              <thead>
                <tr className={styles.tableHead}>
                  <th className={styles.colName}>NAME</th>
                  <th className={styles.colType}>TYPE</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const badge = getTypeBadge(item);
                  return (
                    <tr
                      key={item.path}
                      className={styles.fileRow}
                      onClick={() => handleItemClick(item)}
                      data-cursor-mode="pointer"
                    >
                      <td className={styles.colName}>
                        <span className={styles.rowIcon}>
                          {item.type === "folder" ? (
                            <FaFolder size={14} />
                          ) : item.extension === "md" ? (
                            <FaFileLines size={14} />
                          ) : (
                            <FaImage size={14} />
                          )}
                        </span>
                        <span className={styles.rowName}>{item.name}</span>
                      </td>
                      <td className={styles.colType}>
                        <span className={`${styles.badge} ${styles[`badge${badge}`]}`}>
                          {badge}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
