"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Mail, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { SearchOverlay } from "@/components/SearchOverlay";

const navItems = [
  { href: "/", label: "Accueil" },
  { href: "/boutique", label: "Boutique" },
  { href: "/alliances", label: "Alliances" },
  { href: "/reparations", label: "Réparations" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const { itemCount } = useCart();
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bump, setBump] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const previousCount = useRef(itemCount);

  // Icône messagerie réservée aux clients connectés (pas les admins, qui ont leur propre page demandes).
  const isConnectedCustomer = Boolean(session?.user) && session?.user?.role !== "admin";

  // Compteur de messages non lus, rafraîchi périodiquement et à chaque navigation.
  useEffect(() => {
    if (!isConnectedCustomer) {
      setUnreadCount(0);
      return;
    }

    let cancelled = false;
    const fetchUnread = () => {
      fetch("/api/messages/unread-count")
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled && data.ok) setUnreadCount(data.count);
        })
        .catch(() => {});
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isConnectedCustomer, pathname]);

  // Condense the bar once the page scrolls.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  // Lock body scroll behind the drawer / search sheet.
  useEffect(() => {
    document.body.dataset.scrollLocked = String(menuOpen || searchOpen);
    return () => {
      document.body.dataset.scrollLocked = "false";
    };
  }, [menuOpen, searchOpen]);

  // Keyboard shortcut for search, and Escape to close the drawer.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Pop the cart badge when an item lands in it.
  useEffect(() => {
    if (itemCount > previousCount.current) {
      setBump(true);
      const timer = setTimeout(() => setBump(false), 400);
      previousCount.current = itemCount;
      return () => clearTimeout(timer);
    }
    previousCount.current = itemCount;
  }, [itemCount]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const mailboxLabel =
    unreadCount > 0
      ? "Messagerie, " + unreadCount + (unreadCount > 1 ? " messages non lus" : " message non lu")
      : "Messagerie";

  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[110] focus:rounded-full focus:bg-espresso focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Aller au contenu
      </a>

      <header
        data-scrolled={scrolled}
        className="sticky top-0 z-[70] border-b border-transparent transition-[background-color,border-color,box-shadow,padding] duration-500 data-[scrolled=true]:border-[#e8dabb] data-[scrolled=true]:bg-cream/85 data-[scrolled=true]:shadow-[0_8px_30px_-24px_rgba(42,31,27,0.6)] data-[scrolled=true]:backdrop-blur-xl bg-cream/70 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 transition-all duration-500 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="press inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dfcda8] text-espresso hover:border-gold hover:bg-white/70 lg:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/" className="group flex items-center gap-3">
              <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-espresso font-display text-lg text-[#f3d9a5] transition-transform duration-500 group-hover:scale-105">
                H
                <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-[#c19a5b]/50 transition-all duration-500 group-hover:ring-offset-2 group-hover:ring-offset-cream" />
              </span>
              <span className="leading-tight">
                <span className="block font-display text-xl tracking-[0.22em] text-espresso">HÉRA</span>
                <span className="block text-[10px] uppercase tracking-[0.3em] text-ink-muted">
                  Bijouterie
                </span>
              </span>
            </Link>
          </div>

          <nav className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-active={isActive(item.href)}
                className="link-underline text-sm text-ink-soft transition-colors hover:text-espresso data-[active=true]:font-medium data-[active=true]:text-espresso"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              aria-label="Rechercher"
              onClick={() => setSearchOpen(true)}
              className="press inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dfcda8] text-espresso hover:border-gold hover:bg-white/70"
            >
              <Search className="h-4 w-4" />
            </button>

            {isConnectedCustomer && (
              <Link
                href="/compte/messages"
                aria-label={mailboxLabel}
                className="press relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dfcda8] text-espresso hover:border-gold hover:bg-white/70"
              >
                <Mail className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-white ring-2 ring-cream">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}

            <Link
              href="/compte"
              aria-label="Compte client"
              className="press inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dfcda8] text-espresso hover:border-gold hover:bg-white/70"
            >
              <User className="h-4 w-4" />
            </Link>

            <Link
              href="/panier"
              aria-label={`Panier, ${itemCount} article${itemCount > 1 ? "s" : ""}`}
              className="press relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-espresso text-[#f9f5ef] hover:bg-espresso-light"
            >
              <ShoppingBag className="h-4 w-4" />
              {itemCount > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold text-white ring-2 ring-cream"
                  style={bump ? { animation: "var(--animate-pop)" } : undefined}
                >
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile drawer */}
        <div
          className="grid overflow-hidden border-t border-transparent transition-[grid-template-rows,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden"
          style={{ gridTemplateRows: menuOpen ? "1fr" : "0fr", borderTopColor: menuOpen ? "#e8dabb" : "transparent" }}
        >
          <div className="min-h-0">
            <nav className="mx-auto max-w-7xl px-4 pb-6 pt-3">
              {navItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  data-active={isActive(item.href)}
                  className="flex items-center justify-between border-b border-[#f0e6d3] py-3.5 text-base text-ink-soft transition-all data-[active=true]:font-medium data-[active=true]:text-espresso"
                  style={
                    menuOpen
                      ? { animation: `var(--animate-slide-down)`, animationDelay: `${index * 45}ms` }
                      : undefined
                  }
                >
                  {item.label}
                  <span className="text-gold">→</span>
                </Link>
              ))}
              <Link
                href="/boutique"
                className="press sheen mt-5 inline-flex w-full items-center justify-center rounded-full bg-espresso px-5 py-3 text-sm font-medium text-white"
              >
                Découvrir la boutique
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}