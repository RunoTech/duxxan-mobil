import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

interface LocationData {
  country: string;
  countryCode: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  timezone: string;
  ip: string;
}

interface GeolocationState {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  isAllowed: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: true,
    error: null,
    isAllowed: false
  });
  const { toast } = useToast();

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // First try browser geolocation
      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: false
          });
        });

        // Get country from coordinates using IP geolocation service
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error('IP geolocation failed');
        
        const ipData = await response.json();
        
        const locationData: LocationData = {
          country: ipData.country_name,
          countryCode: ipData.country_code,
          city: ipData.city,
          region: ipData.region,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timezone: ipData.timezone,
          ip: ipData.ip
        };

        setState({
          location: locationData,
          loading: false,
          error: null,
          isAllowed: true
        });

        // Store location in localStorage for offline use
        localStorage.setItem('userLocation', JSON.stringify(locationData));

      } else {
        throw new Error('Geolocation not supported');
      }
    } catch (error) {
      console.warn('Geolocation service unavailable, using browser settings');
      
      // Fallback to IP-only geolocation
      try {
        const response = await fetch('https://ipapi.co/json/');
        const ipData = await response.json();
        
        const locationData: LocationData = {
          country: ipData.country_name,
          countryCode: ipData.country_code,
          city: ipData.city,
          region: ipData.region,
          latitude: ipData.latitude,
          longitude: ipData.longitude,
          timezone: ipData.timezone,
          ip: ipData.ip
        };

        setState({
          location: locationData,
          loading: false,
          error: null,
          isAllowed: false
        });

        localStorage.setItem('userLocation', JSON.stringify(locationData));
      } catch (fallbackError) {
        // Final fallback - use cached location or defaults
        const cached = localStorage.getItem('userLocation');
        if (cached) {
          setState({
            location: JSON.parse(cached),
            loading: false,
            error: 'Using cached location',
            isAllowed: false
          });
        } else {
          setState({
            location: null,
            loading: false,
            error: 'Location detection failed',
            isAllowed: false
          });
        }
      }
    }
  };

  const checkCountryEligibility = (
    userCountryCode: string,
    raffleCountryRestriction: string,
    allowedCountries?: string,
    excludedCountries?: string
  ): { eligible: boolean; reason?: string } => {
    // If no restrictions, everyone can participate
    if (raffleCountryRestriction === 'all') {
      return { eligible: true };
    }

    // If only specific countries allowed
    if (raffleCountryRestriction === 'allowed' && allowedCountries) {
      const allowed = allowedCountries.split(',').map(c => c.trim().toUpperCase());
      if (!allowed.includes(userCountryCode.toUpperCase())) {
        return { 
          eligible: false, 
          reason: `This raffle is only available in: ${allowedCountries}` 
        };
      }
    }

    // If specific countries excluded
    if (raffleCountryRestriction === 'excluded' && excludedCountries) {
      const excluded = excludedCountries.split(',').map(c => c.trim().toUpperCase());
      if (excluded.includes(userCountryCode.toUpperCase())) {
        return { 
          eligible: false, 
          reason: `This raffle is not available in your country` 
        };
      }
    }

    // If specific country only
    if (raffleCountryRestriction !== 'all' && raffleCountryRestriction !== 'allowed' && raffleCountryRestriction !== 'excluded') {
      if (userCountryCode.toUpperCase() !== raffleCountryRestriction.toUpperCase()) {
        return { 
          eligible: false, 
          reason: `This raffle is only available in ${raffleCountryRestriction}` 
        };
      }
    }

    return { eligible: true };
  };

  return {
    ...state,
    detectLocation,
    checkCountryEligibility
  };
};