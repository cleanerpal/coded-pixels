import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://app.codedpixels.co.uk"),
  title: {
    default: "CodedPixels Builder",
    template: "%s | CodedPixels Builder",
  },
  description: "Edit and publish your CodedPixels website.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" className={inter.variable}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
