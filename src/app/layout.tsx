import type { Metadata } from "next";
import { Inter,Lora } from "next/font/google";
import { Toaster } from "sonner";

import { ThemeProvider } from "@/components/theme-provider";
import { ModalProvider } from "@/providers/modal-provider";

import "./globals.css";

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

export const metadata: Metadata = {
  title: "SINASEFE Jataí",
  description: "Sindicato Nacional dos Servidores Federais da Educação Básica, Profissional e Tecnológica — Seção Sindical Jataí.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${lora.variable} ${inter.variable} h-full print:h-auto antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col print:block print:min-h-0 print:h-auto print:bg-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ModalProvider>
            {children}
            <Toaster 
              richColors 
              closeButton
              position="top-right" 
              theme="system"
              toastOptions={{
                className: "font-sans",
              }}
            />
          </ModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
