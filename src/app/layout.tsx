import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CONNECTED MENA AI Literacy",
  description: "School implementation platform foundation for AI Literacy Curriculum."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
