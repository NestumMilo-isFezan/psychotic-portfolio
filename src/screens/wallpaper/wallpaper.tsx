import { useEffect, useRef } from "react";
import styles from "./wallpaper.module.css";

export function Wallpaper() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanlinePatternRef = useRef<HTMLCanvasElement | null>(null);
  const isVisibleRef = useRef(true);
  const isIntersectingRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let lastTime = 0;
    const FPS = 15; // Slightly higher for smoother scanlines/rolls
    const interval = 1000 / FPS;

    // Visibility and Intersection handling to save CPU
    const onVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isIntersectingRef.current = entry.isIntersecting;
      },
      { threshold: 0 },
    );

    document.addEventListener("visibilitychange", onVisibilityChange);
    observer.observe(canvas);

    function createScanlinePattern(w: number, h: number) {
      const offCanvas = document.createElement("canvas");
      offCanvas.width = w;
      offCanvas.height = h;
      const offCtx = offCanvas.getContext("2d");
      if (!offCtx) return offCanvas;

      // Draw scanlines once
      offCtx.globalAlpha = 0.18;
      offCtx.fillStyle = "#000000";
      for (let y = 0; y < h; y += 3) {
        offCtx.fillRect(0, y, w, 1);
      }
      return offCanvas;
    }

    function resize() {
      if (!canvas) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;

      // Pre-render the scanline pattern
      scanlinePatternRef.current = createScanlinePattern(w, h);
    }

    function draw(timestamp: number) {
      if (!canvas || !ctx) return;

      animId = requestAnimationFrame(draw);

      // Throttling: Pause execution if tab is hidden or canvas not visible
      if (!isVisibleRef.current || !isIntersectingRef.current) return;

      if (timestamp - lastTime < interval) return;
      lastTime = timestamp;

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Draw Pre-rendered Scanlines
      if (scanlinePatternRef.current) {
        ctx.drawImage(scanlinePatternRef.current, 0, 0);
      }

      // 2. Gradient tint (Denpa aesthetic)
      const tint = ctx.createLinearGradient(0, 0, w, h);
      tint.addColorStop(0, "rgba(255, 160, 100, 0.12)");
      tint.addColorStop(0.3, "rgba(180, 80,  220, 0.12)");
      tint.addColorStop(0.5, "rgba(140, 60,  200, 0.08)");
      tint.addColorStop(0.72, "rgba(80,  110, 200, 0.08)");
      tint.addColorStop(1, "rgba(30,  40,  120, 0.15)");
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, w, h);

      // 3. CRT Vignette
      const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.4, w / 2, h / 2, h * 0.9);
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(0,0,0,0.3)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      // 4. Occasional CRT Horizontal Roll Line
      if (Math.random() < 0.05) {
        const rollY = Math.floor(Math.random() * h);
        ctx.globalAlpha = 0.1 + Math.random() * 0.1;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, rollY, w, 1 + Math.floor(Math.random() * 2));
        ctx.globalAlpha = 1;
      }
    }

    resize();
    window.addEventListener("resize", resize);
    draw(0);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.wallpaper} />;
}
