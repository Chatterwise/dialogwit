import { useEffect, useState } from "react";

export function useTypewriter(text: string, speed = 18, enabled = true) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!enabled) {
      setDisplayed(text);
      return;
    }
    setDisplayed("");
    let i = 0;
    let cancelled = false;
    function tick() {
      if (cancelled) return;
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i < text.length) setTimeout(tick, speed);
    }
    tick();
    return () => {
      cancelled = true;
    };
  }, [text, speed, enabled]);

  return displayed;
}
