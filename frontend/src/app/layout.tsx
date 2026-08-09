import type { Metadata } from "next";
import "./globals.css";
import AppFrame from "@/components/UI/AppFrame";

export const metadata: Metadata = {
  title: "VendorHub AI",
  description: "AI-powered B2B sourcing and procurement platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
