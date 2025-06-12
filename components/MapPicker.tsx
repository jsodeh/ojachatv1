import React, { useEffect, useRef, useState } from 'react';
import { X, Search } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface MapPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  defaultCenter?: { lat: number; lng: number };
}

// Add Google Maps type definitions
declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

type GoogleLatLng = google.maps.LatLng;
type GoogleMap = google.maps.Map;
type GoogleMarker = google.maps.Marker;
type GoogleGeocoder = google.maps.Geocoder;
type GoogleGeocoderResult = google.maps.GeocoderResult;
type GoogleGeocoderStatus = google.maps.GeocoderStatus;
type GoogleMapMouseEvent = google.maps.MapMouseEvent;
type GoogleSearchBox = google.maps.places.SearchBox;

const MapPicker: React.FC<MapPickerProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  defaultCenter = { lat: 9.0820, lng: 8.6753 } // Default center of Nigeria
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState<GoogleMap | null>(null);
  const [marker, setMarker] = useState<GoogleMarker | null>(null);
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [searchBox, setSearchBox] = useState<GoogleSearchBox | null>(null);

  useEffect(() => {
    // Load Google Maps script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  }, []);

  const isLocationInNigeria = (results: GoogleGeocoderResult[]) => {
    const nigeriaComponent = results[0].address_components.find(
      component => 
        component.types.includes('country') && 
        component.short_name === 'NG'
    );
    return !!nigeriaComponent;
  };

  const updateMarkerAndAddress = (latLng: GoogleLatLng) => {
    if (!marker) return;
    
    marker.setPosition(latLng);
    const geocoder = new window.google.maps.Geocoder();
    
    setError(null);
    geocoder.geocode(
      { location: { lat: latLng.lat(), lng: latLng.lng() } },
      (results: GoogleGeocoderResult[] | null, status: GoogleGeocoderStatus) => {
        if (status === 'OK' && results && results[0]) {
          if (isLocationInNigeria(results)) {
            setAddress(results[0].formatted_address);
          } else {
            setError('Please select a location within Nigeria.');
            setAddress('');
          }
        } else {
          setError('Could not find address for this location. Please try another location.');
          setAddress('');
        }
      }
    );
  };

  const initializeMap = () => {
    if (!mapRef.current || !searchInputRef.current) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 6,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ],
      // Restrict the map's bounds to Nigeria
      restriction: {
        latLngBounds: {
          north: 13.8856,
          south: 4.2773,
          west: 2.6684,
          east: 14.6801
        },
        strictBounds: true
      }
    });

    const markerInstance = new window.google.maps.Marker({
      map: mapInstance,
      draggable: true,
      animation: window.google.maps.Animation.DROP
    });

    // Initialize SearchBox
    const searchBoxInstance = new window.google.maps.places.SearchBox(searchInputRef.current);
    mapInstance.controls[window.google.maps.ControlPosition.TOP_CENTER].push(searchInputRef.current);

    // Bias SearchBox results towards current map's viewport
    mapInstance.addListener('bounds_changed', () => {
      searchBoxInstance.setBounds(mapInstance.getBounds() as google.maps.LatLngBounds);
    });

    // Listen for SearchBox results
    searchBoxInstance.addListener('places_changed', () => {
      const places = searchBoxInstance.getPlaces();
      if (!places || places.length === 0) return;

      const place = places[0];
      if (!place.geometry || !place.geometry.location) return;

      // Update map view
      if (place.geometry.viewport) {
        mapInstance.fitBounds(place.geometry.viewport);
      } else {
        mapInstance.setCenter(place.geometry.location);
        mapInstance.setZoom(17);
      }

      // Update marker and address
      updateMarkerAndAddress(place.geometry.location);
    });

    // Add click event listener to map
    mapInstance.addListener('click', (e: GoogleMapMouseEvent) => {
      if (e.latLng) {
        updateMarkerAndAddress(e.latLng);
      }
    });

    // Add dragend event listener to marker
    markerInstance.addListener('dragend', () => {
      const position = markerInstance.getPosition();
      if (position) {
        updateMarkerAndAddress(position);
      }
    });

    setMap(mapInstance);
    setMarker(markerInstance);
    setSearchBox(searchBoxInstance);
    setLoading(false);
  };

  const handleConfirm = () => {
    if (marker && address) {
      const position = marker.getPosition();
      if (position) {
        onLocationSelect({
          lat: position.lat(),
          lng: position.lng(),
          address
        });
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-3xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Select Delivery Location</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <>
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for a location..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50"
              />
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600">
                {error}
              </div>
            )}
            
            <div 
              ref={mapRef} 
              className="w-full h-[400px] rounded-lg mb-4"
            />
            
            {address && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Selected location:</p>
                <p className="font-medium">{address}</p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!address}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Location
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MapPicker; 