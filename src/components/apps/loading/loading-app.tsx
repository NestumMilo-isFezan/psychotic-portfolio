import React from "react";
import styles from "./loading-app.module.css";

export const LoadingApp: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.scanner} />
      <div className={styles.text}>SCANNING_NEURAL_BUFFER...</div>
      <div className={styles.subtext}>RETRIEVING_DATA_FROM_VOID</div>
    </div>
  );
};

export default LoadingApp;
