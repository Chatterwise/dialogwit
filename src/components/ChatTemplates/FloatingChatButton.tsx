import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../../hooks/useTheme";

export function FloatingChatButton({ onClick }: { onClick: () => void }) {
  const { theme } = useTheme();
  const bg =
    theme === "dark"
      ? "bg-neutral-900/90 backdrop-blur-sm border border-neutral-800"
      : "bg-white backdrop-blur-md border border-gray-200";
  const shadow =
    theme === "dark"
      ? "shadow-xl shadow-blue-900/30"
      : "shadow-lg shadow-blue-200/40";

  return (
    <motion.button
      onClick={onClick}
      aria-label="Open chat"
      initial={{ opacity: 0, scale: 0.86, y: 30 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: 0.14, ease: "easeOut" }, // <-- Fast, clean entrance
      }}
      exit={{
        opacity: 0,
        scale: 0.86,
        y: 32,
        transition: { duration: 0.12, ease: "easeIn" },
      }}
      className={`
        fixed bottom-6 right-6 w-16 h-16
        ${bg} ${shadow}
        flex items-center justify-center
        rounded-2xl border-2
        hover:scale-105 active:scale-95
        hover:border-primary-500/80
        focus-visible:ring-2 focus-visible:ring-primary-500
        transition-all duration-150
        outline-none group z-50
      `}
      style={{ boxShadow: "0 4px 28px 0 rgba(0,0,0,.16)" }}
    >
      <MessageSquare
        className="w-8 h-8 text-primary-400 group-hover:scale-110 group-hover:text-primary-500 group-hover:drop-shadow-lg transition-transform duration-150"
        strokeWidth={3}
      />
    </motion.button>
  );
}
