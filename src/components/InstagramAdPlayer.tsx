"use client";

import { useEffect, useRef, useState } from "react";
import { X, Minus } from "lucide-react";

// Colle ici les liens de tes reels/posts Instagram (@herabijouterie44)
// à jouer dans le lecteur. Format : lien "Copier le lien" depuis Instagram.
const REELS: string[] = [
  "https://www.instagram.com/reel/DYjfVvmIkjc/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
  "https://www.instagram.com/reel/DPYsJsVCMqL/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
];

// Icône Instagram : retirée de lucide-react à partir de la v1 (icônes de marque
// supprimées), on utilise donc notre propre SVG à la place.
function Instagram({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

type PlayerState = "open" | "minimized" | "closed";

export function InstagramAdPlayer() {
  const [state, setState] = useState<PlayerState>("open");
  const [index, setIndex] = useState(0);
  const [position, setPosition] = useState({ x: 24, y: 96 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  // Charge le script officiel d'embed Instagram une seule fois
  useEffect(() => {
    if (document.getElementById("instagram-embed-script")) {
      window.instgrm?.Embeds.process();
      return;
    }
    const script = document.createElement("script");
    script.id = "instagram-embed-script";
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Redemande le rendu de l'embed à chaque fois qu'on affiche un nouveau post
  useEffect(() => {
    if (state === "open") {
      window.instgrm?.Embeds.process();
    }
  }, [state, index]);

  const startDrag = (e: React.PointerEvent) => {
    isDragging.current = true;
    dragOffset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onDrag = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 60;
    setPosition({
      x: Math.min(Math.max(e.clientX - dragOffset.current.x, 0), maxX),
      y: Math.min(Math.max(e.clientY - dragOffset.current.y, 0), maxY),
    });
  };

  const stopDrag = () => {
    isDragging.current = false;
  };

  if (state === "closed") {
    return (
      <button
        type="button"
        onClick={() => setState("open")}
        aria-label="Rouvrir les vidéos Héra"
        className="fixed bottom-4 left-4 z-[996] flex h-12 w-12 items-center justify-center rounded-full bg-espresso text-white shadow-lg transition-transform hover:scale-110"
      >
        <Instagram className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div
      className="fixed z-[996] w-72 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_24px_rgba(35,23,17,0.25)]"
      style={{ left: position.x, top: position.y }}
    >
      <div
        onPointerDown={startDrag}
        onPointerMove={onDrag}
        onPointerUp={stopDrag}
        className="flex cursor-grab items-center justify-between bg-[#fffaf3] px-3 py-2 active:cursor-grabbing"
      >
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#231711]">
          <Instagram className="h-3.5 w-3.5" />
          Héra Bijouterie
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setState(state === "minimized" ? "open" : "minimized")}
            aria-label={state === "minimized" ? "Agrandir" : "Réduire"}
            className="rounded-full p-1 text-ink-soft hover:bg-[#f4e7c9]"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setState("closed")}
            aria-label="Fermer"
            className="rounded-full p-1 text-ink-soft hover:bg-[#f4e7c9]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {state === "open" && (
        <div className="max-h-[420px] overflow-y-auto">
          <blockquote
            key={REELS[index]}
            className="instagram-media"
            data-instgrm-permalink={REELS[index]}
            data-instgrm-version="14"
            style={{ margin: 0, width: "100%" }}
          />
          {REELS.length > 1 && (
            <div className="flex justify-center gap-1.5 border-t border-line py-2">
              {REELS.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Vidéo ${i + 1}`}
                  className={`h-1.5 w-1.5 rounded-full ${i === index ? "bg-espresso" : "bg-[#e5d1ab]"}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}