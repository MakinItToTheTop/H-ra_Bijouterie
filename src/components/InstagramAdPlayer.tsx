"use client";

import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

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

// Colle ici les liens de tes reels/posts Instagram (@herabijouterie44)
// à jouer dans le lecteur. Format : lien "Copier le lien" depuis Instagram.
const REELS: string[] = [
  "https://www.instagram.com/reel/DYjfVvmIkjc/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
  "https://www.instagram.com/reel/DPYsJsVCMqL/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
];

// Délai entre deux reels en mode défilement automatique (en ms).
// Instagram ne fournit pas d'événement "vidéo terminée" via son embed officiel,
// on avance donc sur un minuteur plutôt que sur la fin réelle de la vidéo.
const AUTO_ADVANCE_MS = 100000;

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

export function InstagramAdPlayer() {
  const [isOpen, setIsOpen] = useState(false); // fermé par défaut
  const [index, setIndex] = useState(0);
  const [position, setPosition] = useState({ x: 24, y: 96 });
  const dragOffset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const embedContainerRef = useRef<HTMLDivElement>(null);

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

  // Recrée manuellement le blockquote Instagram à chaque changement de reel,
  // en dehors du rendu React, pour éviter les conflits DOM avec embed.js
  // (qui remplace le blockquote par un iframe et fait planter React sinon).
  useEffect(() => {
    if (!isOpen || !embedContainerRef.current) return;

    embedContainerRef.current.innerHTML = `
      <blockquote
        class="instagram-media"
        data-instgrm-permalink="${REELS[index]}"
        data-instgrm-version="14"
        style="margin:0;width:100%;min-width:0;max-width:100%;"
      ></blockquote>
    `;

    window.instgrm?.Embeds.process();
  }, [isOpen, index]);

  // Défilement automatique en boucle tant que le lecteur est ouvert
  useEffect(() => {
    if (!isOpen || REELS.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % REELS.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [isOpen]);

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

  const goPrev = () => {
  setIndex((i) => (i - 1 + REELS.length) % REELS.length);
};

const goNext = () => {
  setIndex((i) => (i + 1) % REELS.length);
};

  return (
    <>
      {/* Icône fermée — visible par défaut, disparaît (zoom out) à l'ouverture */}
      <button
  type="button"
  onClick={() => setIsOpen(true)}
  aria-label="Ouvrir les vidéos Héra"
  className={`fixed bottom-4 left-4 z-[996] flex h-12 w-12 items-center justify-center rounded-full bg-espresso text-white shadow-lg transition-[transform,opacity] duration-300 ease-out hover:scale-110 ${
    isOpen ? "pointer-events-none scale-0 opacity-0" : "scale-100 opacity-100"
  }`}
>
  <Instagram className="h-5 w-5" />
</button>

      {/* Panneau du lecteur — toujours monté, animé en scale/opacity depuis
          le coin bas-gauche (origin-bottom-left) pour l'effet zoom out / zoom in */}
      <div
        className={`fixed z-[996] w-[340px] max-w-[calc(100vw-2rem)] origin-bottom-left overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_24px_rgba(35,23,17,0.25)] transition-all duration-300 ease-out ${
          isOpen ? "scale-100 opacity-100" : "pointer-events-none scale-0 opacity-0"
        }`}
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
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Fermer"
            className="rounded-full p-1 text-ink-soft hover:bg-[#f4e7c9]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="max-h-[420px] w-full overflow-x-hidden overflow-y-auto">
          <div ref={embedContainerRef} className="w-full" />
         
{REELS.length > 1 && (
  <div className="flex items-center justify-between border-t border-line px-2 py-1.5">
    <button
      type="button"
      onClick={goPrev}
      aria-label="Vidéo précédente"
      className="rounded-full p-1 text-ink-soft hover:bg-[#f4e7c9]"
    >
      <ChevronLeft className="h-4 w-4" />
    </button>
    <span className="text-xs text-ink-soft">
      {index + 1} / {REELS.length}
    </span>
    <button
      type="button"
      onClick={goNext}
      aria-label="Vidéo suivante"
      className="rounded-full p-1 text-ink-soft hover:bg-[#f4e7c9]"
    >
      <ChevronRight className="h-4 w-4" />
    </button>
  </div>
)}
        </div>
      </div>
    </>
  );
}