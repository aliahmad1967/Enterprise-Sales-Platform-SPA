import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import "@fontsource-variable/cairo";
import "@fontsource-variable/inter";
import "./styles/theme.css";
import { I18nProvider } from "@/i18n";
import { ErrorBoundary } from "@/app/ErrorBoundary";
import { queryClient } from "@/lib/queryClient";
import { AppRoutes } from "@/app/routes";

function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </QueryClientProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
