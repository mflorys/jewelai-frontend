import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const serif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "JewelAI Studio",
  description: "Premium jewelry design workflow from discovery to delivery.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable} bg-sand text-coal`}>
        <Providers>
          <div className="min-h-screen bg-gradient-to-b from-ivory via-sand to-parchment">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
