import { Translate } from '@google-cloud/translate/build/src/v2';

// Country to language mapping based on primary languages
const COUNTRY_LANGUAGE_MAP: Record<string, string> = {
  'TR': 'tr', // Turkey - Turkish
  'US': 'en', // United States - English
  'GB': 'en', // United Kingdom - English
  'DE': 'de', // Germany - German
  'FR': 'fr', // France - French
  'ES': 'es', // Spain - Spanish
  'IT': 'it', // Italy - Italian
  'RU': 'ru', // Russia - Russian
  'CN': 'zh', // China - Chinese (Simplified)
  'JP': 'ja', // Japan - Japanese
  'KR': 'ko', // South Korea - Korean
  'BR': 'pt', // Brazil - Portuguese
  'MX': 'es', // Mexico - Spanish
  'IN': 'hi', // India - Hindi
  'SA': 'ar', // Saudi Arabia - Arabic
  'AE': 'ar', // UAE - Arabic
  'EG': 'ar', // Egypt - Arabic
  'PL': 'pl', // Poland - Polish
  'NL': 'nl', // Netherlands - Dutch
  'SE': 'sv', // Sweden - Swedish
  'NO': 'no', // Norway - Norwegian
  'DK': 'da', // Denmark - Danish
  'FI': 'fi', // Finland - Finnish
  'GR': 'el', // Greece - Greek
  'PT': 'pt', // Portugal - Portuguese
  'CZ': 'cs', // Czech Republic - Czech
  'HU': 'hu', // Hungary - Hungarian
  'RO': 'ro', // Romania - Romanian
  'BG': 'bg', // Bulgaria - Bulgarian
  'HR': 'hr', // Croatia - Croatian
  'SI': 'sl', // Slovenia - Slovenian
  'SK': 'sk', // Slovakia - Slovak
  'LT': 'lt', // Lithuania - Lithuanian
  'LV': 'lv', // Latvia - Latvian
  'EE': 'et', // Estonia - Estonian
  'UA': 'uk', // Ukraine - Ukrainian
  'BY': 'be', // Belarus - Belarusian
  'MD': 'ro', // Moldova - Romanian
  'GE': 'ka', // Georgia - Georgian
  'AM': 'hy', // Armenia - Armenian
  'AZ': 'az', // Azerbaijan - Azerbaijani
  'KZ': 'kk', // Kazakhstan - Kazakh
  'UZ': 'uz', // Uzbekistan - Uzbek
  'KG': 'ky', // Kyrgyzstan - Kyrgyz
  'TJ': 'tg', // Tajikistan - Tajik
  'TM': 'tk', // Turkmenistan - Turkmen
  'MN': 'mn', // Mongolia - Mongolian
  'TH': 'th', // Thailand - Thai
  'VN': 'vi', // Vietnam - Vietnamese
  'MY': 'ms', // Malaysia - Malay
  'ID': 'id', // Indonesia - Indonesian
  'PH': 'tl', // Philippines - Filipino
  'BD': 'bn', // Bangladesh - Bengali
  'PK': 'ur', // Pakistan - Urdu
  'LK': 'si', // Sri Lanka - Sinhala
  'NP': 'ne', // Nepal - Nepali
  'AF': 'ps', // Afghanistan - Pashto
  'IR': 'fa', // Iran - Persian
  'IQ': 'ar', // Iraq - Arabic
  'SY': 'ar', // Syria - Arabic
  'YE': 'ar', // Yemen - Arabic
  'JO': 'ar', // Jordan - Arabic
  'LB': 'ar', // Lebanon - Arabic
  'IL': 'he', // Israel - Hebrew
  'AR': 'es', // Argentina - Spanish
  'CL': 'es', // Chile - Spanish
  'CO': 'es', // Colombia - Spanish
  'PE': 'es', // Peru - Spanish
  'VE': 'es', // Venezuela - Spanish
  'EC': 'es', // Ecuador - Spanish
  'UY': 'es', // Uruguay - Spanish
  'PY': 'es', // Paraguay - Spanish
  'BO': 'es', // Bolivia - Spanish
  'CA': 'en', // Canada - English (primary)
  'AU': 'en', // Australia - English
  'NZ': 'en', // New Zealand - English
  'ZA': 'en', // South Africa - English
  'NG': 'en', // Nigeria - English
  'KE': 'sw', // Kenya - Swahili
  'GH': 'en', // Ghana - English
  'ET': 'am', // Ethiopia - Amharic
  'MA': 'ar', // Morocco - Arabic
  'TN': 'ar', // Tunisia - Arabic
  'DZ': 'ar', // Algeria - Arabic
  'SG': 'en', // Singapore - English
  'QA': 'ar', // Qatar - Arabic
  'KW': 'ar', // Kuwait - Arabic
  'BH': 'ar', // Bahrain - Arabic
  'OM': 'ar', // Oman - Arabic
  'IS': 'is', // Iceland - Icelandic
  'IE': 'en', // Ireland - English
  'MT': 'mt', // Malta - Maltese
  'CY': 'el', // Cyprus - Greek
  'LU': 'fr', // Luxembourg - French
  'CH': 'de', // Switzerland - German
  'AT': 'de', // Austria - German
  'BE': 'nl', // Belgium - Dutch
};

class TranslationService {
  private translate: Translate | null = null;
  private cache: Map<string, Map<string, string>> = new Map();
  private initialized = false;

  constructor() {
    this.initializeTranslate();
  }

  private async initializeTranslate() {
    try {
      // Initialize Google Translate with credentials
      this.translate = new Translate({
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
      });
      this.initialized = true;
    } catch (error) {
      console.warn('Google Translate not configured:', error);
      this.initialized = false;
    }
  }

  /**
   * Get language code from country code
   */
  getLanguageFromCountry(countryCode: string): string {
    const upperCountryCode = countryCode.toUpperCase();
    return COUNTRY_LANGUAGE_MAP[upperCountryCode] || 'en'; // Default to English
  }

  /**
   * Detect country from IP address
   */
  async detectCountryFromIP(ip: string): Promise<string> {
    try {
      // Try multiple IP geolocation services
      const services = [
        `https://ipapi.co/${ip}/country/`,
        `https://api.ipgeolocation.io/ipgeo?apiKey=free&ip=${ip}&fields=country_code2`,
        `http://ip-api.com/json/${ip}?fields=countryCode`
      ];

      for (const serviceUrl of services) {
        try {
          const response = await fetch(serviceUrl, { 
            headers: { 'User-Agent': 'DUXXAN/1.0' }
          });
          
          if (serviceUrl.includes('ipapi.co')) {
            const countryCode = await response.text();
            if (countryCode && countryCode.length === 2) {
              return countryCode.toUpperCase();
            }
          } else if (serviceUrl.includes('ipgeolocation.io')) {
            const data = await response.json();
            if (data.country_code2) {
              return data.country_code2;
            }
          } else {
            const data = await response.json();
            if (data.countryCode) {
              return data.countryCode;
            }
          }
        } catch (serviceError) {
          continue; // Try next service
        }
      }
      
      return 'TR'; // Default to Turkey for DUXXAN platform
    } catch (error) {
      console.warn('Could not detect country from IP:', error);
      return 'TR'; // Default to Turkey
    }
  }

  /**
   * Translate text to target language
   */
  async translateText(text: string, targetLanguage: string, sourceLanguage = 'tr'): Promise<string> {
    // Return original text if target language is Turkish (source language)
    if (targetLanguage === 'tr' || targetLanguage === sourceLanguage) {
      return text;
    }

    // Check cache first
    const cacheKey = `${sourceLanguage}-${targetLanguage}`;
    if (this.cache.has(cacheKey) && this.cache.get(cacheKey)!.has(text)) {
      return this.cache.get(cacheKey)!.get(text)!;
    }

    // If Google Translate is not available, return original text
    if (!this.initialized || !this.translate) {
      return text;
    }

    try {
      const [translation] = await this.translate.translate(text, {
        from: sourceLanguage,
        to: targetLanguage,
      });

      // Cache the translation
      if (!this.cache.has(cacheKey)) {
        this.cache.set(cacheKey, new Map());
      }
      this.cache.get(cacheKey)!.set(text, translation);

      return translation;
    } catch (error) {
      console.warn('Translation failed:', error);
      return text; // Return original text on error
    }
  }

  /**
   * Translate an object containing text values
   */
  async translateObject(obj: any, targetLanguage: string, sourceLanguage = 'tr'): Promise<any> {
    if (targetLanguage === 'tr' || targetLanguage === sourceLanguage) {
      return obj;
    }

    if (typeof obj === 'string') {
      return await this.translateText(obj, targetLanguage, sourceLanguage);
    }

    if (Array.isArray(obj)) {
      return Promise.all(obj.map(item => this.translateObject(item, targetLanguage, sourceLanguage)));
    }

    if (obj && typeof obj === 'object') {
      const translated: any = {};
      for (const [key, value] of Object.entries(obj)) {
        // Only translate specific text fields
        if (this.isTranslatableField(key) && typeof value === 'string') {
          translated[key] = await this.translateText(value, targetLanguage, sourceLanguage);
        } else if (typeof value === 'object') {
          translated[key] = await this.translateObject(value, targetLanguage, sourceLanguage);
        } else {
          translated[key] = value;
        }
      }
      return translated;
    }

    return obj;
  }

  /**
   * Check if a field should be translated
   */
  private isTranslatableField(fieldName: string): boolean {
    const translatableFields = [
      'title', 'description', 'content', 'name', 'label', 'message',
      'text', 'subtitle', 'summary', 'details', 'category', 'status',
      'organizationType', 'country', 'prizeDescription', 'requirements'
    ];
    return translatableFields.includes(fieldName.toLowerCase());
  }

  /**
   * Get client IP from request
   */
  getClientIP(req: any): string {
    return req.headers['x-forwarded-for'] || 
           req.headers['x-real-ip'] || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
           '127.0.0.1';
  }

  /**
   * Get user's preferred language based on IP and headers
   */
  async getUserLanguage(req: any): Promise<string> {
    try {
      // First try to get country from IP
      const clientIP = this.getClientIP(req);
      const country = await this.detectCountryFromIP(clientIP);
      const languageFromCountry = this.getLanguageFromCountry(country);

      // Check Accept-Language header as fallback
      const acceptLanguage = req.headers['accept-language'];
      if (acceptLanguage) {
        const preferredLanguage = acceptLanguage.split(',')[0].split('-')[0];
        // Use header language if it's different from country language
        if (preferredLanguage && preferredLanguage !== languageFromCountry) {
          return preferredLanguage.toLowerCase();
        }
      }

      return languageFromCountry;
    } catch (error) {
      console.warn('Could not determine user language:', error);
      return 'en'; // Default to English
    }
  }

  /**
   * Clear translation cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Check if translation service is available
   */
  isAvailable(): boolean {
    return this.initialized && this.translate !== null;
  }
}

export const translationService = new TranslationService();