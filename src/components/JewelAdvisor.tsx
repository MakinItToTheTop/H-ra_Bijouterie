"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle, X } from "lucide-react";
import { useProducts, type Product as ProductRow } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/components/Toast";
import { formatPrice } from "@/lib/format";

const CATEGORIES = ["Bagues", "Colliers", "Bracelets", "Boucles d'oreilles", "Alliances", "Montres"];
const MATERIALS = ["Or 18 carats", "Argent 925", "Or blanc", "Plaqué or"];
const BUDGETS = [
  { label: "Moins de 100 €", min: 0, max: 100 },
  { label: "100 € – 300 €", min: 100, max: 300 },
  { label: "300 € – 600 €", min: 300, max: 600 },
  { label: "Plus de 600 €", min: 600, max: Infinity },
];
const ANY = "Peu importe";

type Step = "category" | "material" | "budget" | "keyword" | "results";

type Answers = {
  category: string | null;
  material: string | null;
  budget: (typeof BUDGETS)[number] | null;
  keyword: string;
};

const initialAnswers: Answers = { category: null, material: null, budget: null, keyword: "" };

function matchProducts(products: ProductRow[], answers: Answers) {
  const keyword = answers.keyword.trim().toLowerCase();

  return products.filter((product) => {
    if (product.stock <= 0) return false;
    if (answers.category && answers.category !== ANY && product.category !== answers.category) return false;
    if (answers.material && answers.material !== ANY && product.material !== answers.material) return false;
    if (answers.budget && (product.price < answers.budget.min || product.price > answers.budget.max)) return false;
    if (keyword) {
      const haystack = `${product.name} ${product.description} ${product.longDescription}`.toLowerCase();
      if (!haystack.includes(keyword)) return false;
    }
    return true;
  });
}

// Petit conseiller bijoux, 100% côté client : un chat qui rebondit dans la
// fenêtre façon écran de veille DVD, et qui ouvre au clic un mini chatbot
// guidé (questions à choix rapides) pour orienter vers un bijou du catalogue
// déjà chargé via useProducts — aucune route serveur supplémentaire.
export function JewelAdvisor() {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ x: 24, y: 24 });
  const velocity = useRef({ x: 1.1, y: 0.9 });
  const containerSize = useRef({ w: 56, h: 56 });
  const frame = useRef<number | undefined>(undefined);

  useEffect(() => {
    const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    setPosition({
      x: Math.random() * Math.max(window.innerWidth - 200, 100),
      y: Math.random() * Math.max(window.innerHeight - 200, 100),
    });

    if (!supportsHover) return;

    const tick = () => {
      setPosition((prev) => {
        if (open) return prev;

        const maxX = window.innerWidth - containerSize.current.w;
        const maxY = window.innerHeight - containerSize.current.h;

        let nextX = prev.x + velocity.current.x;
        let nextY = prev.y + velocity.current.y;

        if (nextX <= 0 || nextX >= maxX) {
          velocity.current.x *= -1;
          nextX = Math.min(Math.max(nextX, 0), maxX);
        }
        if (nextY <= 0 || nextY >= maxY) {
          velocity.current.y *= -1;
          nextY = Math.min(Math.max(nextY, 0), maxY);
        }

        return { x: nextX, y: nextY };
      });

      frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le conseiller bijoux"
        className="fixed z-[997] flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-[0_8px_24px_rgba(35,23,17,0.25)] ring-1 ring-[#e5d1ab] transition-transform hover:scale-110 max-md:!left-auto max-md:!top-auto max-md:right-4 max-md:bottom-4"
        style={{ left: position.x, top: position.y }}
      >
        <span aria-hidden>🐱</span>
      </button>

      {open && <AdvisorPanel onClose={() => setOpen(false)} />}
    </>
  );
}

function AdvisorPanel({ onClose }: { onClose: () => void }) {
  const { products } = useProducts();
  const { addItem } = useCart();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("category");
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const results = useMemo(() => matchProducts(products, answers).slice(0, 3), [products, answers]);

  const restart = () => {
    setAnswers(initialAnswers);
    setStep("category");
  };

  const handleAdd = (product: ProductRow) => {
    addItem(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        category: product.category,
        material: product.material,
        price: product.price,
        rating: product.rating ?? 0,
        reviews: product.reviews ?? 0,
        stock: product.stock,
        badge: product.badge ?? null,
        image: product.image,
        gallery: Array.isArray(product.gallery) ? product.gallery : [],
        description: product.description,
        longDescription: product.longDescription,
        features: Array.isArray(product.features) ? product.features : [],
        sizeOptions: Array.isArray(product.sizeOptions) ? product.sizeOptions : [],
        color: product.color ?? null,
      },
      1,
    );
    setAddedIds((prev) => new Set(prev).add(product.id));
    toast({ title: "Ajouté au panier", description: `${product.name} — ${formatPrice(product.price)}` });
  };

  return (
    <div
      role="dialog"
      aria-label="Conseiller bijoux"
      className="fixed inset-0 z-[999] flex items-end justify-center bg-[#231711]/30 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-[28px] border border-line bg-white shadow-2xl sm:max-w-sm sm:rounded-[28px]"
      >
        <div className="flex items-center justify-between border-b border-line bg-[#fffaf3] px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden>
              🐱
            </span>
            <div>
              <p className="font-display text-base text-[#231711]">Mia, votre conseillère</p>
              <p className="text-xs text-ink-soft">Trouvons votre bijou idéal</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full p-1.5 text-ink-soft hover:bg-[#f4e7c9] hover:text-[#231711]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {step === "category" && (
            <BotBubble text="Bonjour ! Je suis Mia 🐱. Quel type de bijou recherchez-vous ?">
              <QuickReplies
                options={[...CATEGORIES, ANY]}
                onSelect={(value) => {
                  setAnswers((prev) => ({ ...prev, category: value }));
                  setStep("material");
                }}
              />
            </BotBubble>
          )}

          {step === "material" && (
            <>
              <UserBubble text={answers.category ?? ""} />
              <BotBubble text="Et question matière, vous avez une préférence ?">
                <QuickReplies
                  options={[...MATERIALS, ANY]}
                  onSelect={(value) => {
                    setAnswers((prev) => ({ ...prev, material: value }));
                    setStep("budget");
                  }}
                />
              </BotBubble>
            </>
          )}

          {step === "budget" && (
            <>
              <UserBubble text={answers.material ?? ""} />
              <BotBubble text="Un budget en tête ?">
                <QuickReplies
                  options={[...BUDGETS.map((b) => b.label), ANY]}
                  onSelect={(value) => {
                    const budget = BUDGETS.find((b) => b.label === value) ?? null;
                    setAnswers((prev) => ({ ...prev, budget }));
                    setStep("keyword");
                  }}
                />
              </BotBubble>
            </>
          )}

          {step === "keyword" && (
            <>
              <UserBubble text={answers.budget?.label ?? ANY} />
              <BotBubble text="Un mot-clé, une occasion, un style qui vous inspire ? (facultatif)">
                <KeywordInput
                  onSubmit={(value) => {
                    setAnswers((prev) => ({ ...prev, keyword: value }));
                    setStep("results");
                  }}
                />
              </BotBubble>
            </>
          )}

          {step === "results" && (
            <>
              {answers.keyword && <UserBubble text={answers.keyword} />}
              {results.length === 0 ? (
                <BotBubble text="Hmm, je ne trouve rien qui corresponde exactement à ces critères dans notre boutique — ce bijou n'existe probablement pas chez nous pour le moment 😔">
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={restart}
                      className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-gold"
                    >
                      Recommencer
                    </button>
                    <Link
                      href="/boutique"
                      onClick={onClose}
                      className="rounded-full bg-espresso px-3 py-1.5 text-xs text-white hover:opacity-90"
                    >
                      Voir toute la boutique
                    </Link>
                  </div>
                </BotBubble>
              ) : (
                <BotBubble text={`J'ai trouvé ${results.length > 1 ? "quelques pépites" : "une pépite"} pour vous :`}>
                  <div className="mt-2 space-y-3">
                    {results.map((product) => (
                      <div key={product.id} className="flex gap-3 rounded-2xl border border-line bg-[#fffaf3] p-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-16 w-16 flex-shrink-0 rounded-xl object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[#231711]">{product.name}</p>
                          <p className="text-xs text-ink-soft">{formatPrice(product.price)}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Link
                              href={`/produit/${product.slug}`}
                              onClick={onClose}
                              className="rounded-full border border-line px-3 py-1 text-xs text-ink-soft hover:border-gold"
                            >
                              Voir la fiche
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleAdd(product)}
                              disabled={addedIds.has(product.id)}
                              className="rounded-full bg-espresso px-3 py-1 text-xs text-white hover:opacity-90 disabled:opacity-50"
                            >
                              {addedIds.has(product.id) ? "Ajouté ✓" : "Ajouter au panier"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={restart}
                    className="mt-3 rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft hover:border-gold"
                  >
                    Recommencer une recherche
                  </button>
                </BotBubble>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function BotBubble({ text, children }: { text: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 text-base" aria-hidden>
          🐱
        </span>
        <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[#f4e7c9] px-3.5 py-2 text-sm text-[#43352f]">{text}</p>
      </div>
      {children && <div className="pl-7">{children}</div>}
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[75%] rounded-2xl rounded-tr-sm bg-espresso px-3.5 py-2 text-sm text-white">{text}</p>
    </div>
  );
}

function QuickReplies({ options, onSelect }: { options: string[]; onSelect: (value: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onSelect(option)}
          className="rounded-full border border-line bg-white px-3 py-1.5 text-xs text-ink-soft transition hover:border-gold hover:text-[#231711]"
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function KeywordInput({ onSubmit }: { onSubmit: (value: string) => void }) {
  const [value, setValue] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value);
      }}
      className="flex gap-2"
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="ex : mariage, tous les jours…"
        className="w-full rounded-full border border-line bg-white px-3 py-1.5 text-sm outline-none focus:border-gold"
      />
      <button type="submit" className="rounded-full bg-espresso px-3 py-1.5 text-xs text-white hover:opacity-90">
        <MessageCircle className="h-4 w-4" />
      </button>
    </form>
  );
}