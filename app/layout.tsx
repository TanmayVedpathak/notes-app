import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";

import "./globals.css";

import { ThemeProvider } from "@/context/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Interview Notes",
  description: "Frontend and backend interview notes.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <header className="h-[10vh] bg-red-700">
            <Navbar />
          </header>
          <main className="h-[90vh]">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
