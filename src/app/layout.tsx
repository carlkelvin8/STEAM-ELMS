import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: {
    default: "STEAM ELMS - VR Learning Management System",
    template: "%s | STEAM ELMS",
  },
  description:
    "Immersive VR-powered learning management system for STEAM education. Explore interactive courses, track progress, and learn in a virtual campus.",
  keywords: [
    "VR learning",
    "STEAM education",
    "virtual reality",
    "learning management system",
    "online courses",
    "AR ELMS",
  ],
  authors: [{ name: "AR ELMS Team" }],
  creator: "AR ELMS",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://arelms.vercel.app",
    siteName: "STEAM ELMS",
    title: "STEAM ELMS - VR Learning Management System",
    description:
      "Immersive VR-powered learning management system for STEAM education",
  },
  twitter: {
    card: "summary_large_image",
    title: "STEAM ELMS - VR Learning Management System",
    description:
      "Immersive VR-powered learning management system for STEAM education",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100"
      >
        {children}
      </body>
    </html>
  );
}
