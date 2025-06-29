import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, Crosshair, Loader2, Check, AlertCircle } from 'lucide-react';
import { getCurrentLocation, reverseGeocode, formatCoordinates, type LocationCoordinates } from '@/utils/location';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerProps {
  onLocationSelect: (location: { coordinates: LocationCoordinates; address: string }) => void;
  initialLocation?: LocationCoordinates;
  className?: string;
}

// Component to handle map clicks
const MapClickHandler: React.FC<{
  onLocationClick: (coordinates: LocationCoordinates) => void;
}> = ({ onLocationClick }) => {
  useMapEvents({
    click: (e) => {
      onLocationClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
  className = "",
}) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates | null>(
    initialLocation || null
  );
  const [address, setAddress] = useState<string>("");
  const [manualAddress, setManualAddress] = useState<string>("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [locationError, setLocationError] = useState<string>("");
  const [mapCenter, setMapCenter] = useState<LocationCoordinates>(
    initialLocation || { lat: 28.6448, lng: 77.216721 } // Default to Delhi
  );

  useEffect(() => {
    if (selectedLocation) {
      loadAddress(selectedLocation);
    }
  }, [selectedLocation]);

  const loadAddress = async (coordinates: LocationCoordinates) => {
    setIsLoadingAddress(true);
    try {
      const addressResult = await reverseGeocode(coordinates);
      setAddress(addressResult);
      setManualAddress(addressResult);
    } catch (error) {
      setAddress(formatCoordinates(coordinates));
      setManualAddress(formatCoordinates(coordinates));
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleGetCurrentLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError("");
    
    try {
      const result = await getCurrentLocation();
      setSelectedLocation(result.coordinates);
      setMapCenter(result.coordinates);
      if (result.address) {
        setAddress(result.address);
        setManualAddress(result.address);
      }
    } catch (error: any) {
      setLocationError(error.error || "Failed to get location");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleMapClick = async (coordinates: LocationCoordinates) => {
    setSelectedLocation(coordinates);
    setMapCenter(coordinates);
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onLocationSelect({
        coordinates: selectedLocation,
        address: manualAddress || address,
      });
    }
  };

  const handleManualAddressChange = (value: string) => {
    setManualAddress(value);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Select Complaint Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Get Current Location Button */}
        <div className="flex gap-2">
          <Button
            onClick={handleGetCurrentLocation}
            disabled={isLoadingLocation}
            variant="outline"
            className="flex-1"
          >
            {isLoadingLocation ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Crosshair className="h-4 w-4 mr-2" />
            )}
            Use Current Location
          </Button>
          
          {selectedLocation && (
            <Button onClick={handleConfirmLocation} className="flex-shrink-0">
              <Check className="h-4 w-4 mr-2" />
              Confirm
            </Button>
          )}
        </div>

        {/* Error Message */}
        {locationError && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded">
            <AlertCircle className="h-4 w-4" />
            {locationError}
          </div>
        )}

        {/* Map */}
        <div className="h-64 w-full rounded-lg overflow-hidden border">
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onLocationClick={handleMapClick} />
            {selectedLocation && (
              <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
            )}
          </MapContainer>
        </div>

        {/* Location Info */}
        {selectedLocation && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="coordinates">GPS Coordinates</Label>
              <Input
                id="coordinates"
                value={formatCoordinates(selectedLocation)}
                readOnly
                className="bg-gray-50"
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <Input
                  id="address"
                  value={manualAddress}
                  onChange={(e) => handleManualAddressChange(e.target.value)}
                  placeholder="Enter or edit address..."
                />
                {isLoadingAddress && (
                  <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                You can edit the address or leave it as detected
              </p>
            </div>

            <Badge variant="outline" className="w-fit">
              <MapPin className="h-3 w-3 mr-1" />
              Location Selected
            </Badge>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          Click on the map to set location or use current location
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationPicker;
