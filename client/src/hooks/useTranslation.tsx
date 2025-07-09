import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface TranslationContextType {
  userLanguage: string;
  userCountry: string;
  translate: (text: string) => Promise<string>;
  isTranslating: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Country to language mapping (same as backend)
const COUNTRY_LANGUAGE_MAP: Record<string, string> = {
  'TR': 'tr', 'US': 'en', 'GB': 'en', 'DE': 'de', 'FR': 'fr', 'ES': 'es', 
  'IT': 'it', 'RU': 'ru', 'CN': 'zh', 'JP': 'ja', 'KR': 'ko', 'BR': 'pt',
  'MX': 'es', 'IN': 'hi', 'SA': 'ar', 'AE': 'ar', 'EG': 'ar', 'PL': 'pl',
  'NL': 'nl', 'SE': 'sv', 'NO': 'no', 'DK': 'da', 'FI': 'fi', 'GR': 'el',
  'PT': 'pt', 'CZ': 'cs', 'HU': 'hu', 'RO': 'ro', 'BG': 'bg', 'HR': 'hr',
  'SI': 'sl', 'SK': 'sk', 'LT': 'lt', 'LV': 'lv', 'EE': 'et', 'UA': 'uk',
  'BY': 'be', 'MD': 'ro', 'GE': 'ka', 'AM': 'hy', 'AZ': 'az', 'KZ': 'kk',
  'UZ': 'uz', 'KG': 'ky', 'TJ': 'tg', 'TM': 'tk', 'MN': 'mn', 'TH': 'th',
  'VN': 'vi', 'MY': 'ms', 'ID': 'id', 'PH': 'tl', 'BD': 'bn', 'PK': 'ur',
  'LK': 'si', 'NP': 'ne', 'AF': 'ps', 'IR': 'fa', 'IQ': 'ar', 'SY': 'ar',
  'YE': 'ar', 'JO': 'ar', 'LB': 'ar', 'IL': 'he', 'AR': 'es', 'CL': 'es',
  'CO': 'es', 'PE': 'es', 'VE': 'es', 'EC': 'es', 'UY': 'es', 'PY': 'es',
  'BO': 'es', 'CA': 'en', 'AU': 'en', 'NZ': 'en', 'ZA': 'en', 'NG': 'en',
  'KE': 'sw', 'GH': 'en', 'ET': 'am', 'MA': 'ar', 'TN': 'ar', 'DZ': 'ar',
  'SG': 'en', 'QA': 'ar', 'KW': 'ar', 'BH': 'ar', 'OM': 'ar', 'IS': 'is',
  'IE': 'en', 'MT': 'mt', 'CY': 'el', 'LU': 'fr', 'CH': 'de', 'AT': 'de',
  'BE': 'nl'
};

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [userLanguage, setUserLanguage] = useState('tr');
  const [userCountry, setUserCountry] = useState('TR');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationCache, setTranslationCache] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    detectUserLanguage();
  }, []);

  const detectUserLanguage = async () => {
    try {
      // First check browser language as primary indicator
      const browserLanguage = navigator.language.split('-')[0].toLowerCase();
      const browserCountry = navigator.language.split('-')[1]?.toUpperCase() || 'TR';
      
      // Try to get more accurate location from our own API
      try {
        const geoResponse = await fetch('/api/user/location', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (geoResponse.ok) {
          const geoData = await geoResponse.json();
          if (geoData.country_code) {
            const detectedCountry = geoData.country_code.toUpperCase();
            const detectedLanguage = COUNTRY_LANGUAGE_MAP[detectedCountry] || browserLanguage;
            
            setUserCountry(detectedCountry);
            setUserLanguage(detectedLanguage);
            return;
          }
        }
      } catch (geoError) {
        console.warn('Geolocation service unavailable, using browser settings');
      }
      
      // Fallback to browser language and estimated country
      const estimatedCountry = browserCountry || 'TR';
      const finalLanguage = COUNTRY_LANGUAGE_MAP[estimatedCountry] || browserLanguage || 'tr';
      
      setUserCountry(estimatedCountry);
      setUserLanguage(finalLanguage);
      
    } catch (error) {
      console.warn('Could not detect user location:', error);
      // Ultimate fallback
      setUserCountry('TR');
      setUserLanguage('tr');
    }
  };

  const translate = async (text: string): Promise<string> => {
    // Return original text if target language is Turkish
    if (userLanguage === 'tr') {
      return text;
    }

    // Check cache first
    const cacheKey = `${text}-${userLanguage}`;
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey)!;
    }

    setIsTranslating(true);
    try {
      // Use Google Translate API through our backend
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          targetLanguage: userLanguage,
          sourceLanguage: 'tr'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const translatedText = data.translatedText || text;
        
        // Cache the translation
        setTranslationCache(prev => new Map(prev.set(cacheKey, translatedText)));
        
        return translatedText;
      }
      
      return text;
    } catch (error) {
      console.warn('Translation failed:', error);
      return text;
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <TranslationContext.Provider value={{
      userLanguage,
      userCountry,
      translate,
      isTranslating
    }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}

// Hook for translating text with caching
export function useTranslatedText(text: string) {
  const { translate, userLanguage } = useTranslation();
  const [translatedText, setTranslatedText] = useState(text);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userLanguage === 'tr') {
      setTranslatedText(text);
      return;
    }

    setIsLoading(true);
    translate(text)
      .then(setTranslatedText)
      .finally(() => setIsLoading(false));
  }, [text, translate, userLanguage]);

  return { translatedText, isLoading };
}