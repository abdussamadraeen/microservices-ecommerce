import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { ToastContainer } from "react-toastify";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { SoundProvider } from "@/components/SoundController";
import { Suspense } from "react";

import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3500"),
  title: {
    default: "Xiaomi Wearable Store",
    template: "%s | Xiaomi Wearable Store",
  },
  description: "The best place to buy Xiaomi wearable, devices and accessories.",
  openGraph: {
    title: "Xiaomi Wearable Store",
    description: "The best place to buy Xiaomi wearable, devices and accessories.",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3500",
    siteName: "Xiaomi Wearable Store",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Xiaomi Wearable Store",
    description: "The best place to buy Xiaomi wearable, devices and accessories.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "pk_test_Y2xlcmsuZXhhbXBsZS5jb20k"}>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased w-full overflow-x-hidden bg-background text-foreground transition-colors duration-300`}
        >
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem themes={["light", "dark", "gold", "platinum", "custom"]}>
            <Providers>
              <CurrencyProvider>
                <SoundProvider>
                  <Suspense fallback={<div className="h-16 bg-background/75 backdrop-blur-3xl" />}>
                    <Navbar />
                  </Suspense>
                  <div className="mx-auto p-4 sm:px-0 sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl min-h-screen">
                    {children}
                  </div>
                </SoundProvider>
                <Footer />
                <ChatWidget />
                <ToastContainer position="bottom-right" />
              </CurrencyProvider>
            </Providers>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
