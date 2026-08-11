import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

export const metadata = {
  title: "NBOXES — Agenda e gestão de boxes musicais",
  description: "Agendamento de ensaios, gravações e ajustes, e divisão de despesas entre bandas e membros.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
