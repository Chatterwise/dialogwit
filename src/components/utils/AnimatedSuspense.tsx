// components/AnimatedSuspense.tsx
import { Suspense, ReactNode, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function AnimatedSuspense({
  children,
  fallback,
  minDelay = 250, // tweak 200–400ms
}: {
  children: ReactNode;
  fallback: ReactNode;
  minDelay?: number;
}) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const id = setTimeout(() => setShow(false), minDelay);
    return () => clearTimeout(id);
  }, [minDelay]);

  return (
    <Suspense
      fallback={
        <AnimatePresence mode="wait">
          {show && (
            <motion.div
              key="fallback"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {fallback}
            </motion.div>
          )}
        </AnimatePresence>
      }
    >
      {children}
    </Suspense>
  );
}
