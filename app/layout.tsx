import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JewelAI Process Hub",
  description: "From intake quiz to production-ready jewelry workflows.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className="bg-jewel-bg text-white antialiased">
        {children}
      </body>
    </html>
  );
}