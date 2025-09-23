import { translations } from '@/translations/translations';

type TranslationKey = keyof typeof translations;
type Language = 'en' | 'fr';

export const useTranslation = (uiLanguage?: string) => {
  const currentLanguage: Language = uiLanguage === 'french' ? 'fr' : 'en';
  
  const t = (key: TranslationKey): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[currentLanguage] || translation.en || key;
  };
  
  return { t, currentLanguage };
};