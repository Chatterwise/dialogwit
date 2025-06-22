import { useToastStore } from "../lib/toastStore";
import { CheckCircle, Info, AlertCircle, X } from "lucide-react";
import clsx from "clsx";
import { useSpring, animated as a } from "react-spring";
import { useDrag } from "react-use-gesture";
import { motion, AnimatePresence } from "framer-motion";

const typeMap = {
  success: {
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    bg: "bg-green-50 border-green-200 text-green-800",
  },
  error: {
    icon: <AlertCircle className="h-5 w-5 text-red-500" />,
    bg: "bg-red-50 border-red-200 text-red-800",
  },
  info: {
    icon: <Info className="h-5 w-5 text-blue-500" />,
    bg: "bg-blue-50 border-blue-200 text-blue-800",
  },
};

export function ToastRenderer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 w-[90%] sm:w-[300px] max-w-sm">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: { id: string; message: string; type: "success" | "error" | "info" };
  onDismiss: () => void;
}) {
  const [{ x }, api] = useSpring(() => ({ x: 0 }));

  const bind = useDrag(
    ({ down, movement: [mx], velocity, direction: [xDir], cancel }) => {
      if (!down && Math.abs(mx) > 100) {
        api.start({ x: xDir > 0 ? 500 : -500, immediate: false });
        setTimeout(onDismiss, 200);
        return;
      }

      api.start({ x: down ? mx : 0, immediate: down });
    },
    { axis: "x", filterTaps: true }
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
    >
      <a.div
        {...bind()}
        style={{ x }}
        className={clsx(
          "flex items-start border rounded-lg px-4 py-3 shadow-md bg-white dark:bg-gray-900 cursor-grab touch-pan-x",
          typeMap[toast.type].bg
        )}
      >
        <div className="mr-3 mt-1">{typeMap[toast.type].icon}</div>
        <div className="flex-1 text-sm">{toast.message}</div>
        <button
          className="ml-3 mt-0.5 text-gray-500 hover:text-gray-700"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </button>
      </a.div>
    </motion.div>
  );
}
