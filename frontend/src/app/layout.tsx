import type { Metadata } from "next";
import "@/app/globals.css";
import { AppProviders } from "@/providers/app-providers";

export const metadata: Metadata = {
  title: "ERP Pequenas Empresas",
  description: "ERP empresarial moderno para pequenas empresas.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
