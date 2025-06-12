import React, { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface MapPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
}

const DEFAULT_COORDS = { lat: 9.0820, lng: 8.6753 }; // Nigeria's center

const MapPicker = ({
  isOpen,
  onClose,
  onLocationSelect,
}: MapPickerProps): JSX.Element | null => {
  const [address, setAddress] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Optional: Try to load Google Maps if API key exists
  const [mapsAvailable, setMapsAvailable] = useState(false);
  
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (apiKey && window.google === undefined) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
      script.async = true;
      script.onload = () => setMapsAvailable(true);
      script.onerror = () => setMapsAvailable(false);
      document.head.appendChild(script);
      
      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!street || !city || !state) {
      setError('Please fill in all address fields');
      return;
    }

    const fullAddress = `${street}, ${city}, ${state}, Nigeria`;
    
    // If Maps is available, try to geocode the address
    if (window.google && mapsAvailable) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: fullAddress }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          onLocationSelect({
            lat: location.lat(),
            lng: location.lng(),
            address: fullAddress
          });
        } else {
          // Fall back to approximate coordinates
          onLocationSelect({
            ...DEFAULT_COORDS,
            address: fullAddress
          });
        }
        onClose();
      });
    } else {
      // Without Maps API, just use the address string
      onLocationSelect({
        ...DEFAULT_COORDS,
        address: fullAddress
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter Delivery Address</DialogTitle>
          <DialogDescription>
            Please provide your detailed delivery address
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="street" className="text-sm font-medium text-gray-700">
              Street Address
            </label>
            <Input
              id="street"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Enter street address"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="city" className="text-sm font-medium text-gray-700">
              City
            </label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="state" className="text-sm font-medium text-gray-700">
              State
            </label>
            <Input
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="Enter state"
              className="w-full"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Confirm Address
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MapPicker; 