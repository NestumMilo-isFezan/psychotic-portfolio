import React, { useState, useRef, useEffect, useCallback } from "react";
import { AsciiAnimation } from "./AsciiAnimation";
import { useWindowStore } from "../../store/windowStore";
import { useTrashStore } from "../../store/trashStore";
import type { AppProps } from "./appRegistry";
import styles from "./TerminalApp.module.css";

interface HistoryItem {
  id: string;
  type: "input" | "output" | "error" | "ascii";
  text: string | React.ReactNode;
}

interface FileItem {
  name: string;
  type: "folder" | "file";
  extension?: string;
  path: string;
  contents?: FileItem[];
}

export const TerminalApp: React.FC<AppProps> = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [currentPath, setCurrentPath] = useState("/");
  const [fileTree, setFileTree] = useState<FileItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasRunOnboard, setHasRunOnboard] = useState(false);
  const addWindow = useWindowStore((state) => state.addWindow);
  const restoreNovel = useTrashStore((state) => state.restoreNovel);
  const novelExists = useTrashStore((state) => state.novelExists);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch("/api/files");
        const data = await res.json();
        setFileTree(data.tree);
      } catch (e) {
        console.error("Terminal: Failed to fetch files:", e);
      }
    };
    void fetchFiles();
  }, []);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  const addHistory = useCallback((item: Omit<HistoryItem, "id">) => {
    setHistory((prev) => [...prev, { ...item, id: Math.random().toString(36).substring(7) }]);
  }, []);

  const getDirContents = useCallback(
    (path: string) => {
      if (path === "/") return fileTree;
      const parts = path.split("/").filter(Boolean);
      let current = fileTree;
      for (const part of parts) {
        const found = current.find((i) => i.name === part && i.type === "folder");
        if (found && found.contents) {
          current = found.contents;
        } else {
          return null;
        }
      }
      return current;
    },
    [fileTree],
  );

  const handleCommand = useCallback(
    (cmd: string, isAuto = false) => {
      const trimmed = cmd.trim();
      if (!isAuto && trimmed) {
        addHistory({
          type: "input",
          text: `root@PSYCHOSIS:${currentPath === "/" ? "~" : currentPath}# ${trimmed}`,
        });
      }

      const args = trimmed.split(" ").filter(Boolean);
      const command = args[0]?.toLowerCase();

      switch (command) {
        case "fastfetch":
          addHistory({ type: "ascii", text: "fastfetch" });
          break;
        case "clear":
          setHistory([]);
          break;
        case "pwd":
          addHistory({
            type: "output",
            text: currentPath === "/" ? "~" : `~${currentPath}`,
          });
          break;
        case "whoami":
          addHistory({ type: "output", text: "USER:    root" });
          addHistory({ type: "output", text: "HOST:    PSYCHOSIS_MIND" });
          addHistory({ type: "output", text: "SHELL:   bash-glitch" });
          addHistory({ type: "output", text: "ACCESS:  FULL_NEURAL_LINK" });
          break;
        case "ls": {
          const contents = getDirContents(currentPath);
          if (contents) {
            if (contents.length === 0) {
              addHistory({ type: "output", text: "[ DIRECTORY_EMPTY ]" });
            } else {
              const list = contents.map((item) => (
                <span
                  key={item.path}
                  style={{
                    color: item.type === "folder" ? "var(--cyan)" : "var(--purple)",
                    marginRight: "20px",
                  }}
                >
                  {item.name}
                  {item.type === "folder" ? "/" : ""}
                </span>
              ));
              addHistory({
                type: "output",
                text: <div style={{ display: "flex", flexWrap: "wrap" }}>{list}</div>,
              });
            }
          } else {
            addHistory({ type: "error", text: "ERR_FS: Neural path corrupted." });
          }
          break;
        }
        case "cd": {
          const target = args[1];
          if (!target || target === "~" || target === "/") {
            setCurrentPath("/");
          } else if (target === "..") {
            if (currentPath !== "/") {
              const parts = currentPath.split("/").filter(Boolean);
              parts.pop();
              setCurrentPath("/" + parts.join("/"));
            }
          } else {
            // Absolute path support
            let fullTarget = target.startsWith("/")
              ? target
              : currentPath === "/"
                ? `/${target}`
                : `${currentPath}/${target}`;
            // Normalize (remove trailing slash)
            if (fullTarget.length > 1 && fullTarget.endsWith("/"))
              fullTarget = fullTarget.slice(0, -1);

            const contents = getDirContents(fullTarget);
            if (contents !== null) {
              setCurrentPath(fullTarget);
            } else {
              addHistory({
                type: "error",
                text: `ERR_FS: Directory '${target}' not found in neural buffer.`,
              });
            }
          }
          break;
        }
        case "open": {
          const target = args[1];
          if (!target) {
            addHistory({ type: "error", text: "ERR_USAGE: open <filename>" });
            break;
          }
          const contents = getDirContents(currentPath);
          const file = contents?.find((i) => i.name === target && i.type === "file");

          if (file) {
            const { extension, path, name } = file;
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
            } else {
              addHistory({ type: "error", text: `ERR_MIME: No neural handler for .${extension}` });
            }
          } else {
            addHistory({ type: "error", text: `ERR_FS: File '${target}' not found.` });
          }
          break;
        }
        case "help":
        case "onboard":
          if (command === "onboard" && hasRunOnboard && !isAuto) {
            addHistory({
              type: "error",
              text: "ERR_ACCESS_DENIED: Neural link already established.",
            });
            break;
          }
          addHistory({ type: "output", text: "--- PSYCHOSIS_TERMINAL PROTOCOL ---" });
          addHistory({ type: "output", text: "AVAILABLE COMMANDS:" });
          addHistory({ type: "output", text: "  ls        - List neural buffer contents" });
          addHistory({ type: "output", text: "  cd <dir>  - Navigate neural pathways" });
          addHistory({ type: "output", text: "  open <f>  - Project neural data into viewer" });
          addHistory({ type: "output", text: "  pwd       - Print current neural location" });
          addHistory({ type: "output", text: "  whoami    - Display neural identity card" });
          addHistory({ type: "output", text: "  fastfetch - Display system neural state" });
          addHistory({ type: "output", text: "  clear     - Purge terminal buffer" });
          addHistory({ type: "output", text: "  help      - Display this protocol help" });
          break;
        case "restore":
          if (args[1] === "secret") {
            if (novelExists) {
              addHistory({ type: "output", text: "[ FILE ALREADY EXISTS IN VOID ]" });
            } else {
              restoreNovel();
              addHistory({ type: "output", text: "░▒▓ RECOVERING LOST DATA FROM THE VOID ▓▒░" });
              addHistory({ type: "output", text: "[ draft-light-novel.md RESTORED ]" });
              addHistory({ type: "output", text: "[ WARNING: READING IS NOT RECOMMENDED ]" });
            }
          } else {
            addHistory({
              type: "error",
              text: "ERR_SYNTAX_GLITCH: Unrecognized neural input 'restore'",
            });
          }
          break;
        case "":
          break;
        default:
          addHistory({
            type: "error",
            text: `ERR_SYNTAX_GLITCH: Unrecognized neural input '${trimmed}'`,
          });
          break;
      }
    },
    [currentPath, getDirContents, hasRunOnboard, addWindow, addHistory, restoreNovel, novelExists],
  );

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const hasInitialized = useRef(false);

  useEffect(() => {
    // First launch sequence
    const init = async () => {
      if (hasInitialized.current) return;
      hasInitialized.current = true;

      // Small delay for dramatic effect
      await new Promise((r) => setTimeout(r, 400));
      handleCommand("fastfetch", true);
      await new Promise((r) => setTimeout(r, 400));
      handleCommand("onboard", true);
      setHasRunOnboard(true);
    };
    void init();
  }, [handleCommand]);

  const handleTabComplete = useCallback(() => {
    const parts = inputValue.split(" ");
    const lastPart = parts[parts.length - 1] || "";
    if (!lastPart && parts.length === 1) return; // Don't complete empty first command for now

    const contents = getDirContents(currentPath);
    if (!contents) return;

    const command = parts[0]?.toLowerCase();
    const isCD = command === "cd";
    const isOpen = command === "open";

    const matches = contents.filter((item) => {
      const nameMatch = item.name.toLowerCase().startsWith(lastPart.toLowerCase());
      if (isCD) return nameMatch && item.type === "folder";
      if (isOpen) return nameMatch && item.type === "file";
      return nameMatch;
    });

    if (matches.length === 1) {
      const match = matches[0];
      const completedName = match.name + (match.type === "folder" ? "/" : " ");
      parts[parts.length - 1] = completedName;
      setInputValue(parts.join(" "));
    } else if (matches.length > 1) {
      // Find common prefix
      let prefix = lastPart;
      let possible = true;
      while (possible) {
        const nextChar = matches[0].name[prefix.length];
        if (!nextChar) break;
        const allMatch = matches.every((m) => m.name.startsWith(prefix + nextChar));
        if (allMatch) {
          prefix += nextChar;
        } else {
          possible = false;
        }
      }

      if (prefix !== lastPart) {
        parts[parts.length - 1] = prefix;
        setInputValue(parts.join(" "));
      } else {
        // Show options if no progress can be made
        const options = matches.map((m) => m.name + (m.type === "folder" ? "/" : "")).join("  ");
        addHistory({ type: "output", text: options });
      }
    }
  }, [inputValue, currentPath, getDirContents, addHistory]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCommand(inputValue);
      setInputValue("");
    } else if (e.key === "Tab") {
      e.preventDefault();
      handleTabComplete();
    }
  };

  const FastfetchOutput = () => (
    <div className={styles.fastfetch}>
      <AsciiAnimation />
      <div className={styles.sysinfo}>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>OS:</span> PSYCHOS v2.0
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Host:</span> PSYCHOSIS_MIND
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Kernel:</span> 6.6.6-denpa
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Uptime:</span> ETERNITY
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Packages:</span> 404 (dpkg)
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Shell:</span> bash-glitch
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Resolution:</span> 1920x1080
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Terminal:</span> xterm-psych
        </div>
        <div className={styles.colors}>
          <div className={styles.colorBlock} style={{ backgroundColor: "var(--bg-darkest)" }}></div>
          <div className={styles.colorBlock} style={{ backgroundColor: "var(--cyan)" }}></div>
          <div className={styles.colorBlock} style={{ backgroundColor: "var(--pink)" }}></div>
          <div className={styles.colorBlock} style={{ backgroundColor: "var(--purple)" }}></div>
          <div className={styles.colorBlock} style={{ backgroundColor: "var(--yellow)" }}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={styles.container}
      onClick={() => inputRef.current?.focus()}
      ref={containerRef}
      data-cursor-mode="text"
    >
      {history.map((item) => (
        <div key={item.id} className={item.type === "error" ? styles.error : styles.output}>
          {item.type === "ascii" ? <FastfetchOutput /> : item.text}
        </div>
      ))}
      <div className={styles.inputLine}>
        <span className={styles.prompt}>
          root@PSYCHOSIS:{currentPath === "/" ? "~" : currentPath}#
        </span>
        <div className={styles.inputWrapper}>
          <span className={styles.inputText}>{inputValue}</span>
          <span className={styles.cursor}></span>
          <input
            ref={inputRef}
            type="text"
            className={styles.hiddenInput}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck="false"
            autoComplete="off"
            aria-label="Terminal neural input"
          />
        </div>
      </div>
    </div>
  );
};
