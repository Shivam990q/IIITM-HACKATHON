// Location utilities for GPS functionality

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface LocationResult {
  coordinates: LocationCoordinates;
  address?: string;
  error?: string;
}

/**
 * Get user's current GPS location
 */
export const getCurrentLocation = (): Promise<LocationResult> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        error: "Geolocation is not supported by this browser.",
      });
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // Try to get address from coordinates using reverse geocoding
        try {
          const address = await reverseGeocode(coordinates);
          resolve({
            coordinates,
            address,
          });
        } catch (error) {
          // Return coordinates even if reverse geocoding fails
          resolve({
            coordinates,
            address: `${coordinates.lat}, ${coordinates.lng}`,
          });
        }
      },
      (error) => {
        let errorMessage = "Unknown error occurred";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }

        reject({
          error: errorMessage,
        });
      },
      options
    );
  });
};

/**
 * Reverse geocode coordinates to get human-readable address
 * Using Nominatim (OpenStreetMap) API - free and no API key required
 */
export const reverseGeocode = async (coordinates: LocationCoordinates): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.lat}&lon=${coordinates.lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'NyayChain-CivicApp/1.0',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch address');
    }

    const data = await response.json();
    
    if (data.display_name) {
      return data.display_name;
    } else {
      return `${coordinates.lat}, ${coordinates.lng}`;
    }
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
    return `${coordinates.lat}, ${coordinates.lng}`;
  }
};

/**
 * Calculate distance between two coordinates in kilometers
 */
export const calculateDistance = (
  coord1: LocationCoordinates,
  coord2: LocationCoordinates
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLng = toRadians(coord2.lng - coord1.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) *
    Math.cos(toRadians(coord2.lat)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

/**
 * Format coordinates for display
 */
export const formatCoordinates = (coordinates: LocationCoordinates): string => {
  return `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`;
};

/**
 * Validate if coordinates are within reasonable bounds
 */
export const validateCoordinates = (coordinates: LocationCoordinates): boolean => {
  return (
    coordinates.lat >= -90 &&
    coordinates.lat <= 90 &&
    coordinates.lng >= -180 &&
    coordinates.lng <= 180
  );
};
