import { Suspense } from "react";
import type { AppInstance } from "@/store/app-store";
import { AppErrorBoundary } from "./app-error-boundary";
import { getAppComponent } from "./app-registry";
import { LoadingApp } from "./loading/loading-app";

export function AppRenderer({ app }: { app: AppInstance }) {
  const AppComponent = getAppComponent(app.appName);

  return (
    <AppErrorBoundary key={`${app.id}:${JSON.stringify(app.params)}`}>
      <Suspense fallback={<LoadingApp />}>
        <AppComponent
          windowId={app.id}
          appName={app.appName}
          iconName={app.iconName}
          params={app.params}
        />
      </Suspense>
    </AppErrorBoundary>
  );
}
