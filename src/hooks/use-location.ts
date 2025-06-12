import { useState, useEffect } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  area?: string;
}

export const useLocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding using OpenStreetMap Nominatim API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          // Extract area name from response
          const area = data.address?.suburb || 
                      data.address?.town || 
                      data.address?.city || 
                      data.address?.state;
          
          setLocation({ latitude, longitude, area });
        } catch (error) {
          setLocation({ latitude, longitude });
          console.error('Error getting location name:', error);
        }
      },
      (error) => {
        setError(error.message);
      }
    );
  }, []);

  return { location, error };
}; 