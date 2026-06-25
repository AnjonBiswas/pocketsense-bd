import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  variable: "--font-hind-siliguri",
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "PocketSense BD",
  description: "Student money management app for Bangladesh."
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
      </body>
    </html>
  );
}
