"use client";

import { useEffect, useRef, useState } from "react";

// Curseur personnalisé : un point doré au centre + un halo qui suit avec un
// léger retard (interpolation), pour un effet fluide et "soyeux" cohérent
// avec l'identité Héra Bijouterie. Désactivé automatiquement sur les
// écrans tactiles (pas de souris = pas de curseur custom).
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    setIsEnabled(supportsHover);
    if (!supportsHover) return;

    const dot = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { ...dot };
    let target = { ...dot };
    let frame: number;

    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const tick = () => {
      dot.x = lerp(dot.x, target.x, 0.35);
      dot.y = lerp(dot.y, target.y, 0.35);
      ring.x = lerp(ring.x, target.x, 0.14);
      ring.y = lerp(ring.y, target.y, 0.14);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dot.x}px, ${dot.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%)`;
      }

      frame = requestAnimationFrame(tick);
    };

    const handleMove = (event: PointerEvent) => {
      target = { x: event.clientX, y: event.clientY };
      if (!isVisible) setIsVisible(true);

      const hovered = event.target as HTMLElement | null;
      const interactive = hovered?.closest(
        "a, button, input, textarea, select, [role='button'], label, [data-cursor='pointer']",
      );
      setIsPointer(Boolean(interactive));
    };

    const handleLeave = () => setIsVisible(false);
    const handleEnter = () => setIsVisible(true);
    const handleDown = () => setIsPressed(true);
    const handleUp = () => setIsPressed(false);

    window.addEventListener("pointermove", handleMove);
    document.addEventListener("mouseleave", handleLeave);
    document.addEventListener("mouseenter", handleEnter);
    window.addEventListener("pointerdown", handleDown);
    window.addEventListener("pointerup", handleUp);
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
      document.removeEventListener("mouseenter", handleEnter);
      window.removeEventListener("pointerdown", handleDown);
      window.removeEventListener("pointerup", handleUp);
      cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isEnabled) return null;

  return (
    <>
      <div
        ref={ringRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[1000] rounded-full border transition-[width,height,opacity,border-color] duration-300 ease-out"
        style={{
          width: isPointer ? 52 : 34,
          height: isPointer ? 52 : 34,
          borderColor: isPointer ? "rgba(193,154,91,0.55)" : "rgba(193,154,91,0.35)",
          backgroundColor: isPointer ? "rgba(193,154,91,0.08)" : "transparent",
          opacity: isVisible ? 1 : 0,
          willChange: "transform",
        }}
      />
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[1000] rounded-full bg-[#c19a5b] transition-[width,height,opacity] duration-200 ease-out"
        style={{
          width: isPressed ? 6 : 8,
          height: isPressed ? 6 : 8,
          opacity: isVisible ? 1 : 0,
          boxShadow: "0 0 12px rgba(193,154,91,0.65)",
          willChange: "transform",
        }}
      />
    </>
  );
}