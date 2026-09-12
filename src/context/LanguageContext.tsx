import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage, SUPPORTED_LANGUAGES, TRANSLATIONS, LanguageOption } from '../i18n/translations';

export type UiScale = 'compact' | 'normal' | 'large' | 'xlarge';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  currentLangOption: LanguageOption;
  t: (key: string, fallback?: string) => string;
  uiScale: UiScale;
  setUiScale: (scale: UiScale) => void;
  availableLanguages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem('khetlink_language');
      if (saved && (saved === 'en' || saved === 'hi' || saved === 'pa' || saved === 'mr' || saved === 'te')) {
        return saved as SupportedLanguage;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const [uiScale, setUiScaleState] = useState<UiScale>(() => {
    try {
      const saved = localStorage.getItem('khetlink_uiscale');
      if (saved && ['compact', 'normal', 'large', 'xlarge'].includes(saved)) {
        return saved as UiScale;
      }
    } catch {
      // ignore
    }
    return 'normal';
  });

  const setLanguage = (newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('khetlink_language', newLang);
    } catch {
      // ignore
    }
  };

  const setUiScale = (newScale: UiScale) => {
    setUiScaleState(newScale);
    try {
      localStorage.setItem('khetlink_uiscale', newScale);
    } catch {
      // ignore
    }
  };

  // Sync UI Scale with document root HTML
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('ui-scale-compact', 'ui-scale-normal', 'ui-scale-large', 'ui-scale-xlarge');
    root.classList.add(`ui-scale-${uiScale}`);
  }, [uiScale]);

  const currentLangOption = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const t = (key: string, fallback?: string): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS['en'];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to English
    if (TRANSLATIONS['en'] && TRANSLATIONS['en'][key]) {
      return TRANSLATIONS['en'][key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        currentLangOption,
        t,
        uiScale,
        setUiScale,
        availableLanguages: SUPPORTED_LANGUAGES
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

const defaultFallbackContext: LanguageContextType = {
  language: 'en',
  setLanguage: () => {},
  currentLangOption: SUPPORTED_LANGUAGES[0],
  t: (key: string, fallback?: string) => fallback || key,
  uiScale: 'normal',
  setUiScale: () => {},
  availableLanguages: SUPPORTED_LANGUAGES
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    console.warn('useLanguage was called outside of a LanguageProvider, returning default context.');
    return defaultFallbackContext;
  }
  return context;
};
