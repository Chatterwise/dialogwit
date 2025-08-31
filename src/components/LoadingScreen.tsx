import { Bot, Loader2 } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Optional header to reinforce context */}
      <div className="mb-6 flex items-center gap-3 text-gray-600 dark:text-gray-300">
        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 grid place-items-center">
          <Bot className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">Assistant</span>
          {/* online/typing dot */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping motion-reduce:animate-none" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        </div>
      </div>

      <div className="w-full max-w-md p-4 space-y-4">
        {/* Fake user bubble (context) */}
        <div className="flex justify-end">
          <div className="px-4 py-2 rounded-2xl bg-blue-500 text-white max-w-xs motion-safe:animate-pulse">
            …
          </div>
        </div>

        {/* Chatbot typing bubble with visible label */}
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-2xl bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center gap-2">
            {/* 3-dot typing */}
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full motion-safe:animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full motion-safe:animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full motion-safe:animate-bounce" />
            </div>
            {/* Clear, human-readable label */}
            <span className="text-sm">Thinking…</span>
          </div>
        </div>

        {/* Secondary hint below (plus screen reader text) */}
        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 justify-center pt-2">
          <Loader2
            className="h-4 w-4 motion-safe:animate-spin"
            aria-hidden="true"
          />
          <span className="text-sm">Loading...</span>
          <span className="sr-only">Assistant is generating a response.</span>
        </div>

        {/* Optional top progress bar feel */}
        <div className="h-1 w-full overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
          <div className="h-full w-1/3 motion-safe:animate-[indeterminate_1.5s_ease-in-out_infinite] bg-gray-500/50 dark:bg-gray-300/40" />
        </div>
      </div>

      {/* Keyframes for indeterminate bar (Tailwind arbitrary) */}
      <style>{`
        @keyframes indeterminate {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(50%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
