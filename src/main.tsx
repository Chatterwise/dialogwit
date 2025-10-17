import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
// import { PostHogProvider } from 'posthog-js/react';
import posthog from 'posthog-js';
import App from "./App.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";
import { initGA } from "./third-party/ga";
import { getConsent, onConsentChange } from './lib/consent';
import { AnalyticsProvider } from './components/AnalyticsProvider';

// Initialize analytics conditionally (no calls before consent)
const initialConsent = getConsent();
if (initialConsent === 'accepted') {
  // PostHog init
  const key = import.meta.env.VITE_PUBLIC_POSTHOG_KEY as string | undefined;
  if (key) {
    posthog.init(key, {
      api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
      capture_exceptions: true,
      debug: import.meta.env.MODE === 'development',
      autocapture: true,
    });
  }
  // GA init
  initGA();
}

// Listen for consent changes to start analytics later
onConsentChange((state) => {
  if (state === 'accepted') {
    if (!posthog.__loaded) {
      const key = import.meta.env.VITE_PUBLIC_POSTHOG_KEY as string | undefined;
      if (key) {
        posthog.init(key, {
          api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
          capture_exceptions: true,
          debug: import.meta.env.MODE === 'development',
          autocapture: true,
        });
      }
    }
    initGA();
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AnalyticsProvider>
      <HelmetProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </HelmetProvider>
    </AnalyticsProvider>
  </StrictMode>
);