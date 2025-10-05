import React from "react";
import type { Metadata } from "next";
import { ThemeProviderClient } from "@/context/ThemeProviderClient";
import Header from "@/components/globals/Header";
import Footer from "@/components/globals/Footer";
import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";

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
        className="d-flex flex-column antialiased"
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
