import React, { useState, useEffect } from "react";
import styles from "./terminal-app.module.css";

const FRAMES = [
  `
   \\_\\_    _/_/
       \\__/
      (oo)\\_______
      (__)\\       )\\/\\
          ||----w |
          ||     ||
  `,
  `
   /_/    \\_\\_
       \\__/
      (><)\\_______
      (__)\\       )\\/\\
          ||----w |
          ||     ||
  `,
  `
   \\_\\_    _/_/
       \\__/
      (OO)\\_______
      (__)\\       )\\/\\
          ||----w |
          ||     ||
  `,
  `
   /_/    \\_\\_
       \\__/
      (@@)\\_______
      (__)\\       )\\/\\
          ||----w |
          ||     ||
  `,
];

export const AsciiAnimation: React.FC = () => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((f) => (f + 1) % FRAMES.length);
    }, 250);
    return () => clearInterval(interval);
  }, []);

  return <pre className={styles.ascii}>{FRAMES[frame]}</pre>;
};
