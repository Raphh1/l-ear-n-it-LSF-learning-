import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { Navbar } from "@/components/Navbar";

// Titres : grotesque à fort caractère / Texte : police conçue pour la lisibilité
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
});

export const metadata: Metadata = {
  title: "L-ear-n-it LSF",
  description: "Apprenez la langue des signes française",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "L-ear-n-it LSF",
  },
  formatDetection: { telephone: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${bricolage.variable} ${atkinson.variable} h-full antialiased`}>
      <head>
        <meta name="theme-color" content="#fff4e2" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body className="min-h-full flex flex-col bg-paper font-body text-ink">
        <AuthProvider>
          <Navbar />
          <div className="pt-16 flex flex-col flex-1">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}
