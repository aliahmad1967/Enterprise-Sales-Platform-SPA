import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ar, type ArKey } from "./ar";
import { en } from "./en";

export type Locale = "ar" | "en";

const dictionaries = { ar, en } as const;
const LOCALE_KEY = "esp.locale";

export interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: ArKey, params?: Record<string, string | number>) => string;
  dir: "rtl" | "ltr";
  isRTL: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function readLocale(): Locale {
  try {
    const saved = window.localStorage.getItem(LOCALE_KEY);
    return saved === "en" ? "en" : "ar";
  } catch {
    return "ar";
  }
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readLocale);

  const setLocale = (next: Locale) => {
    try {
      window.localStorage.setItem(LOCALE_KEY, next);
    } catch {
      /* ignore */
    }
    setLocaleState(next);
  };

  useEffect(() => {
    const el = document.documentElement;
    el.lang = locale;
    el.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const value = useMemo<I18nContextValue>(() => {
    const dict = dictionaries[locale];
    return {
      locale,
      setLocale,
      dir: locale === "ar" ? "rtl" : "ltr",
      isRTL: locale === "ar",
      t: (key, params) => {
        let str = dict[key] ?? ar[key] ?? key;
        if (params) {
          for (const [k, v] of Object.entries(params)) {
            str = str.replaceAll(`{${k}}`, String(v));
          }
        }
        return str;
      },
    };
  }, [locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within <I18nProvider>");
  return ctx;
}

export type { ArKey };
