import React, { useEffect, useMemo, useState } from "react";
import {
  getGeoLanguageSuggestion,
  getStoredPreferredLanguage,
  setStoredPreferredLanguage,
} from "../lib/locale";
import { languages } from "../lib/languages";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, X } from "lucide-react";

type Props = {
  currentLanguage: string;
  setLanguage: (code: string) => void;
};

// Very lightweight modal; uses Tailwind already in project.
export default function GeoLanguageModal({
  currentLanguage,
  setLanguage,
}: Props) {
  const [suggested, setSuggested] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const langName = useMemo(() => {
    const found = languages.find((l) => l.code === suggested);
    return found?.name ?? suggested ?? "";
  }, [suggested]);

  useEffect(() => {
    // Only run when there's no saved preference
    if (getStoredPreferredLanguage()) return;
    // Avoid prompting multiple times in a session
    if (sessionStorage.getItem("geoLangPromptShown")) return;

    let cancelled = false;
    (async () => {
      const geo = await getGeoLanguageSuggestion();
      if (cancelled) return;
      if (geo && geo !== currentLanguage) {
        setSuggested(geo);
        setOpen(true);
        sessionStorage.setItem("geoLangPromptShown", "1");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentLanguage]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // treat as decline to avoid repeated prompts
        decline();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open || !suggested) return null;

  const accept = () => {
    // Persist and navigate via provider helper
    setStoredPreferredLanguage(suggested);
    setLanguage(suggested);
    setOpen(false);
  };

  const decline = () => {
    // Persist current choice so we don't prompt again
    setStoredPreferredLanguage(currentLanguage);
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && suggested && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm"
            onClick={decline}
          />

          {/* Dialog */}
          <motion.div
            initial={{ y: 16, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 350, damping: 26 }}
            className="relative w-full max-w-lg rounded-2xl border border-gray-200/70 dark:border-gray-700/70 shadow-2xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl"
          >
            <div className="p-5 sm:p-6 border-b border-gray-200/70 dark:border-gray-700/70 bg-gradient-to-r from-primary-50/60 to-transparent dark:from-gray-800/40 rounded-t-2xl">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 rounded-lg bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                  <Globe className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Language suggestion
                  </h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    We use IP-based geolocation to suggest a preferred language.
                    Choose what works best for you.
                  </p>
                </div>
                <button
                  onClick={decline}
                  className="ml-2 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-3 text-gray-700 dark:text-gray-300">
              <p className="text-sm">
                It looks like your region prefers{" "}
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {langName}
                </span>
                .
              </p>
              <p className="text-sm">
                Switch from{" "}
                <span className="font-mono uppercase text-gray-900 dark:text-gray-100">
                  {currentLanguage}
                </span>{" "}
                to{" "}
                <span className="font-mono uppercase text-primary-700 dark:text-primary-400">
                  {suggested}
                </span>
                ?
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                We only use your IP location to make this suggestion. Your
                choice will be saved as a preference.
              </p>
            </div>

            <div className="p-5 sm:p-6 pt-0 flex items-center justify-end gap-3">
              <button
                onClick={decline}
                className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Keep {currentLanguage.toUpperCase()}
              </button>
              <button
                onClick={accept}
                className="px-4 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 shadow-sm transition-colors"
              >
                Switch to {suggested.toUpperCase()}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
