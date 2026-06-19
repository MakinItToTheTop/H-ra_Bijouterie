import type { Metadata, Viewport } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://herabijouterie.fr"),
  title: {
    default: "Héra Bijouterie | Joaillerie & horlogerie à Nantes",
    template: "%s | Héra Bijouterie",
  },
  description:
    "Bijouterie, joaillerie et horlogerie à Nantes. Vente, réparations, créations sur mesure et alliances chez Héra Bijouterie.",
  openGraph: {
    title: "Héra Bijouterie",
    description: "L’éclat de l’or, l’élégance intemporelle.",
    type: "website",
    locale: "fr_FR",
  },
};

export const viewport: Viewport = {
  themeColor: "#fdfaf5",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${playfair.variable} ${manrope.variable}`}>
      <body className="min-h-screen bg-cream text-ink antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main id="contenu" className="page-enter flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
