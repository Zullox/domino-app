// ============================================================================
// HOOK: useTranslation - Sistema de traducciones
// ============================================================================
import { useContext, useCallback, createContext, useState } from 'react';
import { LANGUAGES, TRANSLATIONS } from '../constants/i18n';

// ============================================================================
// CONTEXTO
// ============================================================================

export const LanguageContext = createContext({
  lang: 'es',
  setLang: () => {},
  t: () => ''
});

// ============================================================================
// PROVIDER
// ============================================================================

export const LanguageProvider = ({ children, defaultLang = 'es' }) => {
  const [lang, setLang] = useState(() => {
    // Intentar recuperar del localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('domino_language');
      if (saved && LANGUAGES[saved]) return saved;
    }
    return defaultLang;
  });

  // Función de traducción
  const t = useCallback((section, key, params = {}) => {
    try {
      const translation = TRANSLATIONS[section]?.[key]?.[lang] || 
                         TRANSLATIONS[section]?.[key]?.es || 
                         key;
      
      // Reemplazar parámetros {param}
      if (params && typeof translation === 'string') {
        return translation.replace(/\{(\w+)\}/g, (_, paramName) => 
          params[paramName] !== undefined ? params[paramName] : `{${paramName}}`
        );
      }
      
      return translation;
    } catch {
      return key;
    }
  }, [lang]);

  // Cambiar idioma
  const changeLang = useCallback((newLang) => {
    if (LANGUAGES[newLang]) {
      setLang(newLang);
      if (typeof window !== 'undefined') {
        localStorage.setItem('domino_language', newLang);
      }
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  
  if (!context) {
    // Fallback si no hay provider
    return {
      lang: 'es',
      setLang: () => {},
      t: (section, key) => key,
      languages: LANGUAGES
    };
  }
  
  return context;
};

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Obtiene el idioma del navegador
 */
export const getBrowserLanguage = () => {
  if (typeof navigator === 'undefined') return 'es';
  
  const browserLang = navigator.language?.split('-')[0] || 'es';
  return LANGUAGES[browserLang] ? browserLang : 'es';
};

/**
 * Formatea números según el idioma
 */
export const formatNumber = (num, lang = 'es') => {
  const locales = {
    es: 'es-ES',
    en: 'en-US',
    pt: 'pt-BR',
    fr: 'fr-FR'
  };
  
  return new Intl.NumberFormat(locales[lang] || 'es-ES').format(num);
};

/**
 * Formatea fechas según el idioma
 */
export const formatDate = (date, lang = 'es', options = {}) => {
  const locales = {
    es: 'es-ES',
    en: 'en-US',
    pt: 'pt-BR',
    fr: 'fr-FR'
  };
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  return new Intl.DateTimeFormat(locales[lang] || 'es-ES', defaultOptions).format(new Date(date));
};

/**
 * Pluralización simple
 */
export const pluralize = (count, singular, plural, lang = 'es') => {
  return count === 1 ? singular : plural;
};

export default useTranslation;
