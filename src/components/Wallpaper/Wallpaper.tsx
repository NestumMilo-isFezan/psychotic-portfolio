import { useEffect, useRef } from "react";
import styles from "./Wallpaper.module.css";

export function Wallpaper() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let lastTime = 0;
    const FPS = 12;
    const interval = 1000 / FPS;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function draw(timestamp: number) {
      if (!canvas || !ctx) return;

      animId = requestAnimationFrame(draw);

      if (timestamp - lastTime < interval) return;
      lastTime = timestamp;

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // --- CRT grain: noise strength varies per scanline ---
      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;

      for (let y = 0; y < h; y++) {
        // Each scanline gets its own noise intensity (horizontal band character)
        const lineNoise = 0.03 + Math.random() * 0.09;
        for (let x = 0; x < w; x++) {
          if (Math.random() < lineNoise) {
            const idx = (y * w + x) * 4;
            const v = 100 + Math.random() * 155;
            const a = 25 + Math.random() * 55;
            data[idx] = v;
            data[idx + 1] = v;
            data[idx + 2] = v;
            data[idx + 3] = a;
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);

      // --- Scanlines overlay ---
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = "#000000";
      for (let y = 0; y < h; y += 3) {
        ctx.fillRect(0, y, w, 1);
      }
      ctx.globalAlpha = 1;

      // --- Gradient tint: peach/orange left → transparent center → deep blue/purple right ---
      const tint = ctx.createLinearGradient(0, 0, w, h);
      tint.addColorStop(0,    "rgba(255, 160, 100, 0.18)");
      tint.addColorStop(0.3,  "rgba(180, 80,  220, 0.18)");
      tint.addColorStop(0.5,  "rgba(140, 60,  200, 0.12)");
      tint.addColorStop(0.72, "rgba(80,  110, 200, 0.12)");
      tint.addColorStop(1,    "rgba(30,  40,  120, 0.22)");
      ctx.fillStyle = tint;
      ctx.fillRect(0, 0, w, h);

      // --- Vignette ---
      const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, h * 0.85);
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(0,0,0,0.38)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      // --- Occasional horizontal roll line ---
      if (Math.random() < 0.03) {
        const rollY = Math.floor(Math.random() * h);
        ctx.globalAlpha = 0.12 + Math.random() * 0.15;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, rollY, w, 1 + Math.floor(Math.random() * 2));
        ctx.globalAlpha = 1;
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    draw(0);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.wallpaper} />;
}
