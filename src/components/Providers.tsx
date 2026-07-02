"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/components/Toast";
import { CustomCursor } from "@/components/CustomCursor";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <CartProvider>
          <CustomCursor />
          {children}
        </CartProvider>
      </ToastProvider>
    </SessionProvider>
  );
}