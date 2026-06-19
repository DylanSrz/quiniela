"use client";

import { useEffect, useRef, useState } from "react";

// Conteo animado de un número (ease-out cúbico). Muestra enteros sin decimales
// y no-enteros con un decimal (p. ej. 7.5), igual que el resto de la app.
export default function CountUp({
  value,
  duration = 800,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) {
      setDisplay(to);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  const shown = Math.round(display * 10) / 10;
  const text = shown % 1 === 0 ? String(shown) : shown.toFixed(1);
  return <span className={className}>{text}</span>;
}
