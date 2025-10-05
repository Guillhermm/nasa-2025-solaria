import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProviderClient } from "@/context/ThemeProviderClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NASA 2025 Solaria",
  description: "Embiggen Your Eyes App",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased d-flex flex-column`}
      >
        <ThemeProviderClient>
          <Header />
          <main className="flex-grow-1 d-flex flex-column gap-3 align-items-start">
            {children}
          </main>
          <Footer />
        </ThemeProviderClient>
      </body>
    </html>
  );
}
