import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Retail Analytics Control Tower",
  description: "Full-stack retail intelligence dashboard with Flask analytics and a Next.js operator console.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn("min-h-screen bg-background antialiased")}
        style={{ fontFamily: "'Times New Roman', Times, serif" }}
      >
        {children}
      </body>
    </html>
  );
}
