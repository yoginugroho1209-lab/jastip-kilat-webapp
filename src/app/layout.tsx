import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import "./landing.css";

const outfit = Outfit({
  variable: "--font-main",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "JastipKilat - Jastip Makanan Tanpa Markup",
  description: "Platform jastip makanan terstruktur, harga asli resto tanpa markup, ongkir transparan, dan live tracking. Khusus Tembalang & Banyumanik.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${outfit.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
