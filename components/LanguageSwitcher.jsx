"use client";

import React from "react";
import { useLanguage, LOCALES } from "@/lib/i18n/LanguageContext";
import { pal } from "@/lib/theme";

export function LanguageSwitcher({ className = "" }) {
  const { locale, setLocale } = useLanguage();

  return (
    <div className={`inline-flex items-center gap-0.5 rounded-sm border p-0.5 ${className}`} style={{ borderColor: pal.line }}>
      {LOCALES.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => setLocale(l.code)}
          className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm transition-colors"
          style={{
            background: locale === l.code ? pal.amber : "transparent",
            color: locale === l.code ? "#241C0F" : pal.creamDim,
          }}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
