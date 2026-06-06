import styles from "./welcome.module.css";

export function WelcomeWidget({ onOpen }: { onOpen: () => void }) {
  return (
    <button type="button" className={styles.welcomeWidget} onClick={onOpen}>
      <span className={styles.welcomeWidgetName}>
        <span>NURAHFEZAN</span>
        <span>NORDIN</span>
      </span>
      <span className={styles.welcomeWidgetTagline}>
        &ldquo;I research, craft, and refine my work for the satisfactions&rdquo;
      </span>
    </button>
  );
}
