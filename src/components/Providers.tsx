"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ToastProvider } from "@/components/Toast";
import { CustomCursor } from "@/components/CustomCursor";
import { ClickBurst } from "@/components/ClickBurst";
import { JewelAdvisor } from "@/components/JewelAdvisor";
import { InstagramAdPlayer } from "@/components/InstagramAdPlayer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <CartProvider>
          <WishlistProvider>
            <CustomCursor />
            <ClickBurst />
            <JewelAdvisor />
            <InstagramAdPlayer />
            {children}
          </WishlistProvider>
        </CartProvider>
      </ToastProvider>
    </SessionProvider>
  );
}