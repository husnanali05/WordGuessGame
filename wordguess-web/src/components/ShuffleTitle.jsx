// src/components/ShuffleTitle.jsx
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * ShuffleTitle
 * - Animates text by shuffling glyphs, then revealing the final title
 *
 * Props:
 *  - text: string to reveal
 *  - duration: total animation time in seconds (default 1.2)
 *  - delay: delay before starting (s)
 *  - interval: frame time in ms for flicker (default 30)
 *  - className: pass Tailwind / custom classes to <h1>
 *  - charset: random glyph set to flicker through
 */
export default function ShuffleTitle({
  text,
  duration = 1.2,
  delay = 0,
  interval = 30,
  className = "",
  charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#$%&+*?-",
}) {
  const [out, setOut] = useState(text);
  const rafId = useRef(null);
  const startAt = useRef(null);
  const letters = useMemo(() => text.split(""), [text]);
  const prefersReduced = useMemo(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches,
    []
  );

  useEffect(() => {
    if (prefersReduced) {
      setOut(text);
      return;
    }

    // prepare randomizing loop
    let tId;
    const total = Math.max(letters.length, 1);
    const revealTimes = letters.map((_, i) => {
      // Stagger reveal across duration
      const p = (i + 1) / total;
      return delay * 1000 + p * duration * 1000;
    });

    const randomChar = () => charset[Math.floor(Math.random() * charset.length)];

    const tick = (now) => {
      if (!startAt.current) startAt.current = now;
      const elapsed = now - startAt.current;

      // build the current output
      const chars = letters.map((ch, i) =>
        elapsed >= revealTimes[i] || ch === " " ? ch : randomChar()
      );

      setOut(chars.join(""));

      if (elapsed < revealTimes[revealTimes.length - 1]) {
        rafId.current = requestAnimationFrame(tick);
      } else {
        setOut(text); // ensure final state
      }
    };

    // drive updates with a small timer -> rAF so we don’t spam setState
    const pump = () => {
      rafId.current = requestAnimationFrame(tick);
      tId = setTimeout(pump, interval);
    };
    pump();

    return () => {
      clearTimeout(tId);
      if (rafId.current) cancelAnimationFrame(rafId.current);
      startAt.current = null;
    };
  }, [text, duration, delay, interval, charset, letters, prefersReduced]);

  return (
    <h1 className={className} aria-label={text}>
      {out}
    </h1>
  );
}
