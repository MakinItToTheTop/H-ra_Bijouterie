"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Check, Info, TriangleAlert, X } from "lucide-react";

type ToastTone = "success" | "info" | "error";

type Toast = {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastContextValue = {
  toast: (input: { title: string; description?: string; tone?: ToastTone }) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const toneStyles: Record<ToastTone, { icon: ReactNode; ring: string }> = {
  success: {
    icon: <Check className="h-4 w-4" />,
    ring: "border-[#d8c39a] bg-[#fffdf8]",
  },
  info: {
    icon: <Info className="h-4 w-4" />,
    ring: "border-[#dcd2c4] bg-white",
  },
  error: {
    icon: <TriangleAlert className="h-4 w-4" />,
    ring: "border-[#e3bcb4] bg-[#fffaf9]",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback<ToastContextValue["toast"]>(
    ({ title, description, tone = "success" }) => {
      counter.current += 1;
      const id = counter.current;
      setToasts((current) => [...current.slice(-2), { id, title, description, tone }]);
      setTimeout(() => dismiss(id), 3600);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-5 right-4 z-[100] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-3"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-[var(--shadow-lift)] backdrop-blur-sm ${toneStyles[item.tone].ring}`}
            style={{ animation: "var(--animate-scale-in)" }}
          >
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2a1f1b] text-[#f3d9a5]">
              {toneStyles[item.tone].icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[#2a1f1b]">{item.title}</p>
              {item.description && (
                <p className="mt-0.5 text-xs leading-5 text-[#7a6156]">{item.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="Fermer la notification"
              className="mt-0.5 text-[#a08c80] hover:text-[#2a1f1b]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside a ToastProvider");
  }
  return context;
}
