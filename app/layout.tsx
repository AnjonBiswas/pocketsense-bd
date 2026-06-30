import type { Metadata } from "next";
import localFont from "next/font/local";
import { PWAClientShell } from "@/components/pwa/PWAClientShell";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./globals.css";
import "../styles/mobile.css";

const hindSiliguri = localFont({
  src: [
    {
      path: "../public/fonts/hind-siliguri-bengali-400-normal.woff2",
      weight: "400",
      style: "normal"
    },
    {
      path: "../public/fonts/hind-siliguri-bengali-500-normal.woff2",
      weight: "500",
      style: "normal"
    },
    {
      path: "../public/fonts/hind-siliguri-bengali-600-normal.woff2",
      weight: "600",
      style: "normal"
    },
    {
      path: "../public/fonts/hind-siliguri-bengali-700-normal.woff2",
      weight: "700",
      style: "normal"
    },
    {
      path: "../public/fonts/hind-siliguri-latin-400-normal.woff2",
      weight: "400",
      style: "normal"
    },
    {
      path: "../public/fonts/hind-siliguri-latin-500-normal.woff2",
      weight: "500",
      style: "normal"
    },
    {
      path: "../public/fonts/hind-siliguri-latin-600-normal.woff2",
      weight: "600",
      style: "normal"
    },
    {
      path: "../public/fonts/hind-siliguri-latin-700-normal.woff2",
      weight: "700",
      style: "normal"
    }
  ],
  display: "swap",
  variable: "--font-hind-siliguri"
});

export const metadata: Metadata = {
  title: "PocketSense BD",
  description: "Student money management app for Bangladesh.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PocketSense"
  },
  icons: {
    apple: "/apple-touch-icon.png",
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" }
    ]
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#10B981"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={hindSiliguri.variable}>
        <ThemeProvider>{children}</ThemeProvider>
        <PWAClientShell />
      </body>
    </html>
  );
}
