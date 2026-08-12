"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/context/CartContext";
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
          <CustomCursor />
          <ClickBurst />
          <JewelAdvisor />
          <InstagramAdPlayer />
          {children}
        </CartProvider>
      </ToastProvider>
    </SessionProvider>
  );
}