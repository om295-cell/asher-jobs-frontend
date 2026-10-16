import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../translations';
import { cookieHelper } from '../utils/cookie';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  // Default to Arabic as primary business language in Egypt / 10th of Ramadan
  const [lang, setLang] = useState(() => {
    if (typeof window === 'undefined') return 'ar';
    return cookieHelper.get('asher_lang') || localStorage.getItem('asher_lang') || 'ar';
  });

  useEffect(() => {
    localStorage.setItem('asher_lang', lang);
    cookieHelper.set('asher_lang', lang, 365);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const toggleLang = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const t = (key) => {
    const dict = translations[lang] || translations.ar;
    return dict[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, isRtl: lang === 'ar' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
