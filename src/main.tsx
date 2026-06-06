import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./styles/global.css";
import App from "./App.tsx";

const queryClient = new QueryClient();

window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  const reloadKey = "vite-preload-reload";

  if (sessionStorage.getItem(reloadKey)) {
    sessionStorage.removeItem(reloadKey);
    return;
  }

  sessionStorage.setItem(reloadKey, "1");
  window.location.reload();
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
