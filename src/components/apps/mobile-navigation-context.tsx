import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import type { AppName } from "./app-registry";

type BackHandler = () => boolean;

interface MobileNavigationValue {
  registerBackHandler: (appName: AppName, handler: BackHandler) => () => void;
  handleBack: (appName: AppName | null) => boolean;
}

const MobileNavigationContext = createContext<MobileNavigationValue | null>(null);

export function MobileNavigationProvider({ children }: { children: ReactNode }) {
  const handlers = useRef(new Map<AppName, BackHandler>());

  const value: MobileNavigationValue = {
    registerBackHandler: (appName, handler) => {
      handlers.current.set(appName, handler);
      return () => handlers.current.delete(appName);
    },
    handleBack: (appName) => (appName ? (handlers.current.get(appName)?.() ?? false) : false),
  };

  return (
    <MobileNavigationContext.Provider value={value}>{children}</MobileNavigationContext.Provider>
  );
}

export function useMobileNavigation() {
  return useContext(MobileNavigationContext);
}

export function useMobileBackHandler(appName: AppName, handler: BackHandler) {
  const navigation = useMobileNavigation();

  useEffect(() => {
    if (!navigation) return;
    return navigation.registerBackHandler(appName, handler);
  }, [appName, handler, navigation]);
}
