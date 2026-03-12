import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Cinzel } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import AuthProvider from "@/providers/AuthProvider";
import "./globals.css";

/* ================= FONTS ================= */

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cinzel",
});

/* ================= METADATA ================= */

export const metadata: Metadata = {
  title: "QR Scanning and Invitation Management System",
  description: "A web application for managing wedding invitations and QR code scanning.",
};

/* ================= ROOT LAYOUT ================= */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`
        ${geistSans.variable}
        ${geistMono.variable}
        ${cinzel.variable}
        antialiased
      `}
      >
        <AuthProvider>
          {children}
        </AuthProvider>

        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}