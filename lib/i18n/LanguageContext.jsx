"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { translations } from "./translations";

const LanguageContext = createContext(null);

export const LOCALES = [
  { code: "pt", label: "PT" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
];

function getPath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState("pt");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("nboxes_locale") : null;
    if (saved && translations[saved]) setLocaleState(saved);
  }, []);

  const setLocale = (code) => {
    if (!translations[code]) return;
    setLocaleState(code);
    if (typeof window !== "undefined") localStorage.setItem("nboxes_locale", code);
  };

  const t = (path, vars) => {
    let str = getPath(translations[locale], path) ?? getPath(translations.pt, path) ?? path;
    if (vars) {
      Object.entries(vars).forEach(([key, value]) => {
        str = str.replace(`{${key}}`, value);
      });
    }
    return str;
  };

  return <LanguageContext.Provider value={{ locale, setLocale, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
