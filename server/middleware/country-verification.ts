import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage.js';

interface CountryRestriction {
  countryRestriction: string;
  allowedCountries?: string;
  excludedCountries?: string;
}

interface UserLocation {
  countryCode: string;
  country: string;
  city: string;
  ip: string;
}

// IP to Country mapping service
async function getCountryFromIP(ip: string): Promise<UserLocation | null> {
  try {
    // Use multiple IP geolocation services for reliability
    const services = [
      `https://ipapi.co/${ip}/json/`,
      `http://ip-api.com/json/${ip}`,
      `https://freegeoip.app/json/${ip}`
    ];

    for (const service of services) {
      try {
        const response = await fetch(service);
        if (response.ok) {
          const data = await response.json();
          
          // Normalize response based on service
          if (service.includes('ipapi.co')) {
            return {
              countryCode: data.country_code,
              country: data.country_name,
              city: data.city,
              ip: ip
            };
          } else if (service.includes('ip-api.com')) {
            return {
              countryCode: data.countryCode,
              country: data.country,
              city: data.city,
              ip: ip
            };
          } else if (service.includes('freegeoip.app')) {
            return {
              countryCode: data.country_code,
              country: data.country_name,
              city: data.city,
              ip: ip
            };
          }
        }
      } catch (serviceError) {
        console.warn(`Geolocation service ${service} failed:`, serviceError);
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.error('All geolocation services failed:', error);
    return null;
  }
}

// Check if user's country is eligible for the raffle
function isCountryEligible(
  userCountryCode: string,
  restriction: CountryRestriction
): { eligible: boolean; reason?: string } {
  const { countryRestriction, allowedCountries, excludedCountries } = restriction;

  // No restrictions - everyone can participate
  if (countryRestriction === 'all') {
    return { eligible: true };
  }

  // Only specific countries allowed
  if (countryRestriction === 'allowed' && allowedCountries) {
    const allowed = allowedCountries.split(',').map(c => c.trim().toUpperCase());
    if (!allowed.includes(userCountryCode.toUpperCase())) {
      return {
        eligible: false,
        reason: `This raffle is restricted to participants from: ${allowedCountries}`
      };
    }
  }

  // Specific countries excluded
  if (countryRestriction === 'excluded' && excludedCountries) {
    const excluded = excludedCountries.split(',').map(c => c.trim().toUpperCase());
    if (excluded.includes(userCountryCode.toUpperCase())) {
      return {
        eligible: false,
        reason: 'This raffle is not available in your country due to local regulations'
      };
    }
  }

  // Single country restriction
  if (countryRestriction !== 'all' && 
      countryRestriction !== 'allowed' && 
      countryRestriction !== 'excluded') {
    if (userCountryCode.toUpperCase() !== countryRestriction.toUpperCase()) {
      return {
        eligible: false,
        reason: `This raffle is only available to participants from ${countryRestriction}`
      };
    }
  }

  return { eligible: true };
}

// Middleware to verify country eligibility for raffle participation
export const verifyCountryEligibility = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const raffleId = parseInt(req.params.id || req.body.raffleId);
    
    if (isNaN(raffleId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid raffle ID'
      });
    }

    // Get raffle details
    const raffle = await storage.getRaffleById(raffleId);
    if (!raffle) {
      return res.status(404).json({
        success: false,
        message: 'Raffle not found'
      });
    }

    // Get user's location from multiple sources
    let userLocation: UserLocation | null = null;
    
    // 1. Try user profile country (most reliable if verified)
    const userId = (req as any).user?.id;
    if (userId) {
      const user = await storage.getUser(userId);
      if (user?.country) {
        userLocation = {
          countryCode: user.country,
          country: user.country,
          city: user.city || 'Unknown',
          ip: req.ip || 'Unknown'
        };
      }
    }

    // 2. Try device location from user_devices table
    if (!userLocation && userId) {
      const devices = await storage.getUserDevices(userId);
      const activeDevice = devices.find(d => d.isActive && d.location);
      if (activeDevice && activeDevice.location) {
        // Parse location string "City, Country" 
        const [city, country] = activeDevice.location.split(', ');
        userLocation = {
          countryCode: country || 'Unknown',
          country: country || 'Unknown', 
          city: city || 'Unknown',
          ip: activeDevice.ipAddress || req.ip || 'Unknown'
        };
      }
    }

    // 3. Fallback to IP geolocation
    if (!userLocation) {
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      userLocation = await getCountryFromIP(ip);
    }

    // If still no location, block participation for security
    if (!userLocation) {
      return res.status(403).json({
        success: false,
        message: 'Unable to verify your location. Please ensure location services are enabled.',
        error_code: 'LOCATION_VERIFICATION_FAILED'
      });
    }

    // Check eligibility
    const eligibility = isCountryEligible(userLocation.countryCode, {
      countryRestriction: raffle.countryRestriction || 'all',
      allowedCountries: raffle.allowedCountries || undefined,
      excludedCountries: raffle.excludedCountries || undefined
    });

    if (!eligibility.eligible) {
      console.log(`Country restriction blocked: ${userLocation.countryCode} for raffle ${raffleId}`);
      
      return res.status(403).json({
        success: false,
        message: eligibility.reason,
        error_code: 'COUNTRY_RESTRICTED',
        user_country: userLocation.country,
        user_country_code: userLocation.countryCode
      });
    }

    // Store verified location in request
    (req as any).userLocation = userLocation;
    (req as any).verifiedRaffle = raffle;

    next();
  } catch (error) {
    console.error('Country verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Location verification failed'
    });
  }
};

// Enhanced device tracking with geolocation
export const trackUserDevice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return next();

    const userAgent = req.get('user-agent') || '';
    const ip = req.ip || 'unknown';
    
    // Get location from IP
    const location = await getCountryFromIP(ip);
    
    if (location) {
      // Create device record with location
      await storage.createUserDevice({
        userId,
        deviceType: userAgent.includes('Mobile') ? 'mobile' : 'desktop',
        ipAddress: ip,
        userAgent,
        location: `${location.city}, ${location.country}`,
        isActive: true
      });
    }

    next();
  } catch (error) {
    console.error('Device tracking error:', error);
    next(); // Don't block the request
  }
};