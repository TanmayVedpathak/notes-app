import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";

import "./globals.css";

import { ThemeProvider } from "@/context/ThemeContext";

const themeInitializationScript = `
  (() => {
    let theme = "dark";

    try {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "light" || savedTheme === "dark") theme = savedTheme;
    } catch {}

    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  })();
`;

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
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
      </head>
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
