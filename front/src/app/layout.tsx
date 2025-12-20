import type { Metadata } from "next";
import { Geist_Mono, Orbitron } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Footer } from "@/components/layouts/footer";
import { Header } from "@/components/layouts/header";
import { AuthProvider } from "@/context/AuthContext";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ptera",
  description: "Ptera",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${orbitron.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Header />
          {children}
          <Footer />
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
