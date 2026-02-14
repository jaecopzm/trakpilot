import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MailTrackr — Know When Your Emails Are Opened",
  description:
    "Invisible pixel tracking for sales professionals. Know exactly when your emails are opened with real-time notifications and detailed analytics.",
  keywords: ["email tracking", "pixel tracking", "sales tools", "email opens", "CRM"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#3b82f6",
          colorBackground: "#18181b",
          colorInputBackground: "#27272a",
          colorText: "#fafafa",
          colorTextSecondary: "#a1a1aa",
        },
      }}
    >
      <html lang="en" className="dark">
        <body
          className={`${inter.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
