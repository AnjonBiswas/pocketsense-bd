import type { Metadata } from "next";
import { PWAClientShell } from "@/components/pwa/PWAClientShell";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./globals.css";
import "../styles/mobile.css";

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
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <PWAClientShell />
      </body>
    </html>
  );
}
