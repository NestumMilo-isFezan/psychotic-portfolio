import { Component, type ErrorInfo, type ReactNode } from "react";
import styles from "./app-error-boundary.module.css";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  error: Error | null;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App failed to render:", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className={styles.container}>
        <div className={styles.code}>ERR_APP_MODULE_LOAD</div>
        <div className={styles.message}>The application module could not be loaded.</div>
        <button type="button" onClick={() => window.location.reload()}>
          RELOAD INTERFACE
        </button>
      </div>
    );
  }
}
