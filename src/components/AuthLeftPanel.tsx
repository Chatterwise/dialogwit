import ParticlesBg from "particles-bg";
import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../hooks/useTheme";
import { Logo } from "./ui/Logo";

const leftTexts = {
  login: {
    title: "Welcome back!",
    desc: "Sign in to access your AI chatbots and manage your workspace.",
  },
  signup: {
    title: "Be part of our awesome team and have fun with us",
    desc: "Create your account to start building intelligent chatbots.",
  },
};

export function AuthLeftPanel({ mode }: { mode: "login" | "signup" }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative w-full lg:w-1/2 min-h-screen flex flex-col justify-between overflow-hidden bg-white">
      {/* Particles Background */}
      <ParticlesBg type="cobweb" bg={true} />

      {/* Logo at the top */}
      <div className="relative z-10 pt-10 pl-10">
        <Logo className="h-14 w-auto" />
      </div>

      {/* Centered content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <h2
              className="text-2xl md:text-3xl font-bold mb-4 font-display"
              style={{
                color: "#ff5233",
                textShadow: "0 2px 8px rgba(0,0,0,0.10), 0 1px 0 #fff",
                letterSpacing: "0.01em",
              }}
            >
              {leftTexts[mode].title}
            </h2>
            <p
              className="text-lg"
              style={{
                color: "#ff5233",
                textShadow: "0 2px 8px rgba(0,0,0,0.06), 0 1px 0 #fff",
                opacity: 0.9,
              }}
            >
              {leftTexts[mode].desc}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Theme toggle at the bottom left */}
      <div className="relative z-10 pb-8 pl-10">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white/80 border border-primary-100 shadow hover:bg-primary-50 text-primary-600 transition"
          title="Toggle theme"
          style={{
            boxShadow: "0 2px 8px 0 rgba(255,82,51,0.08)",
          }}
        >
          {theme === "dark" ? <Sun /> : <Moon />}
        </button>
      </div>
    </div>
  );
}
