"use client";

import { useEffect, useRef, useState } from "react";

type Burst = {
  id: number;
  x: number;
  y: number;
};

const PARTICLES_PER_BURST = 6;
const BURST_LIFETIME_MS = 550;

// Petit effet décoratif : un éclat de particules dorées au clic, cohérent
// avec l'identité Héra Bijouterie. Volontairement discret (peu de
// particules, courte distance, fondu rapide, pointer-events désactivés)
// pour ne jamais gêner la lecture ni l'interaction avec le site.
export function ClickBurst() {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!supportsHover) return; // pas d'effet sur tactile : évite un "burst" à chaque tap de défilement

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return; // clic gauche uniquement

      const id = idRef.current++;
      setBursts((prev) => [...prev, { id, x: event.clientX, y: event.clientY }]);

      window.setTimeout(() => {
        setBursts((prev) => prev.filter((b) => b.id !== id));
      }, BURST_LIFETIME_MS);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[998] overflow-hidden">
      {bursts.map((burst) => (
        <BurstParticles key={burst.id} x={burst.x} y={burst.y} />
      ))}
    </div>
  );
}

function BurstParticles({ x, y }: { x: number; y: number }) {
  const [expanded, setExpanded] = useState(false);
  const particlesRef = useRef(
    Array.from({ length: PARTICLES_PER_BURST }, (_, i) => {
      const angle = (i / PARTICLES_PER_BURST) * Math.PI * 2 + Math.random() * 0.4;
      const distance = 18 + Math.random() * 14;
      return {
        dx: Math.cos(angle) * distance,
        dy: Math.sin(angle) * distance,
        size: 3 + Math.random() * 2,
      };
    }),
  );

  useEffect(() => {
    // Deux frames pour laisser le navigateur peindre l'état initial avant de
    // déclencher la transition CSS vers l'état "explosé".
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setExpanded(true));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      {particlesRef.current.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-[#c19a5b] transition-[transform,opacity] ease-out"
          style={{
            left: x,
            top: y,
            width: p.size,
            height: p.size,
            transform: expanded
              ? `translate(${p.dx}px, ${p.dy}px) translate(-50%, -50%) scale(0.4)`
              : "translate(0, 0) translate(-50%, -50%) scale(1)",
            opacity: expanded ? 0 : 0.85,
            transitionDuration: `${BURST_LIFETIME_MS}ms`,
            boxShadow: "0 0 6px rgba(193,154,91,0.6)",
          }}
        />
      ))}
    </>
  );
}