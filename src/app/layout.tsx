import type { Metadata } from "next";
import { inter } from '@/app/ui/fonts';
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import "./ui/globals.css";
import Header from "@/app/ui/header"
import Footer from "@/app/ui/footer"

export const metadata: Metadata = {
  title: "Sprigate",
  description: "Canvas-Notion Integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        <Theme accentColor="green">
          <Header />
        {children}
          <Footer />
        </Theme>
      </body>
    </html>
  );
}
