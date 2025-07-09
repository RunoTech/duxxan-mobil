import { Request, Response, NextFunction } from 'express';
import { translationService } from '../../lib/translation';

interface TranslatedRequest extends Request {
  userLanguage?: string;
  userCountry?: string;
}

/**
 * Middleware to detect user language and add translation capabilities
 */
export const languageDetectionMiddleware = async (
  req: TranslatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Detect user's preferred language
    const userLanguage = await translationService.getUserLanguage(req);
    const clientIP = translationService.getClientIP(req);
    const userCountry = await translationService.detectCountryFromIP(clientIP);

    // Add language info to request
    req.userLanguage = userLanguage;
    req.userCountry = userCountry;

    // Add translation function to response object
    (res as any).translateAndSend = async function(data: any) {
      // Skip translation for certain routes
      const skipTranslationRoutes = [
        '/api/auth',
        '/api/wallet',
        '/api/blockchain',
        '/api/upload',
        '/api/stats'
      ];

      const shouldSkipTranslation = skipTranslationRoutes.some(route => 
        req.path.startsWith(route)
      );

      if (shouldSkipTranslation || !req.userLanguage || req.userLanguage === 'tr') {
        return res.json(data);
      }

      try {
        // Translate the response data
        const translatedData = await translationService.translateObject(data, req.userLanguage, 'tr');
        return res.json(translatedData);
      } catch (error) {
        console.warn('Translation failed:', error);
        return res.json(data);
      }
    };

    next();
  } catch (error) {
    console.warn('Language detection failed:', error);
    next();
  }
};

/**
 * Middleware to add translation headers to response
 */
export const translationHeadersMiddleware = (
  req: TranslatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.userLanguage) {
    res.setHeader('X-User-Language', req.userLanguage);
  }
  if (req.userCountry) {
    res.setHeader('X-User-Country', req.userCountry);
  }
  next();
};