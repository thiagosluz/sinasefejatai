import type { Metadata } from "next";
import { Lora, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TopMenu } from "@/components/top-menu";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

import { ModalProvider } from "@/providers/modal-provider";

export const metadata: Metadata = {
  title: "SINASEFE Jataí - Gestão Sindical",
  description: "Sistema integrado de gestão de filiados, assembleias, atas e prestação de contas do SINASEFE Jataí.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${lora.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ModalProvider>
            <TopMenu />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
          </ModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
