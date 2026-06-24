"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { translations, type Language, type TranslationTree } from "@/lib/i18n/translations";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  dictionary: TranslationTree;
};

const STORAGE_KEY = "pocketsense-language";

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function resolveTranslation(tree: TranslationTree, key: string) {
  return key.split(".").reduce<unknown>((current, segment) => {
    if (typeof current === "object" && current !== null && segment in current) {
      return current[segment as keyof typeof current];
    }

    return key;
  }, tree);
}

export function LanguageProvider({
  children,
  initialLanguage = "bn"
}: {
  children: ReactNode;
  initialLanguage?: Language;
}) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as Language | null;

    if (saved === "bn" || saved === "en") {
      setLanguageState(saved);
    }
  }, []);

  const value = useMemo<LanguageContextValue>(() => {
    const setLanguage = (nextLanguage: Language) => {
      setLanguageState(nextLanguage);
      window.localStorage.setItem(STORAGE_KEY, nextLanguage);
    };

    const toggleLanguage = () => {
      setLanguage(language === "bn" ? "en" : "bn");
    };

    const dictionary = translations[language];

    return {
      language,
      setLanguage,
      toggleLanguage,
      t: (key: string) => {
        const resolved = resolveTranslation(dictionary, key);
        return typeof resolved === "string" ? resolved : key;
      },
      dictionary
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
}
