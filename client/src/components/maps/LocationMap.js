import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { MapPin, X } from 'lucide-react';
import toast from 'react-hot-toast';

const libraries = ['places'];

// North America bounds
const northAmericaBounds = {
  north: 71.5,
  south: 14.5,
  west: -168.0,
  east: -52.0
};

// Default center (USA)
const defaultCenter = {
  lat: 39.8283,
  lng: -98.5795
};

const LocationMap = ({ onLocationSelect, selectedLocation, apiKey, readOnly = false, markerColor = 'red' }) => {
  const [markerPosition, setMarkerPosition] = useState(selectedLocation || null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const mapRef = useRef(null);
  const geocoderRef = useRef(null);

  // Update marker position when selectedLocation changes
  React.useEffect(() => {
    if (selectedLocation) {
      setMarkerPosition(selectedLocation);
    }
  }, [selectedLocation]);

  const apiKeyValue = apiKey || process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
  
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKeyValue,
    libraries
  });

  // Warn if API key is missing
  React.useEffect(() => {
    if (!apiKeyValue && isLoaded) {
      console.warn('Google Maps API key is missing. Please set REACT_APP_GOOGLE_MAPS_API_KEY in your .env file');
    }
  }, [apiKeyValue, isLoaded]);

  // Initialize geocoder when map is loaded
  React.useEffect(() => {
    if (isLoaded && window.google && window.google.maps && window.google.maps.Geocoder) {
      try {
        geocoderRef.current = new window.google.maps.Geocoder();
      } catch (error) {
        console.error('Failed to initialize geocoder:', error);
      }
    }
  }, [isLoaded]);

  // Restrict map bounds to North America
  const onLoad = useCallback((map) => {
    mapRef.current = map;
    
    // Set restriction bounds
    const restriction = {
      latLngBounds: northAmericaBounds,
      strictBounds: false
    };
    
    map.setOptions({
      restriction: restriction,
      minZoom: 3,
      maxZoom: 18
    });
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Handle map click
  const handleMapClick = useCallback(async (event) => {
    // Don't allow clicking in read-only mode
    if (readOnly) {
      return;
    }

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    // Check if within North America bounds
    if (
      lat < northAmericaBounds.south ||
      lat > northAmericaBounds.north ||
      lng < northAmericaBounds.west ||
      lng > northAmericaBounds.east
    ) {
      toast.error('Please select a location within North America');
      return;
    }

    const position = { lat, lng };
    setMarkerPosition(position);
    setIsGeocoding(true);

    // Reverse geocode to get address
    if (!geocoderRef.current && window.google && window.google.maps) {
      // Initialize geocoder if not already initialized
      geocoderRef.current = new window.google.maps.Geocoder();
    }

    if (geocoderRef.current && window.google && window.google.maps) {
      try {
        const results = await new Promise((resolve, reject) => {
          geocoderRef.current.geocode(
            { location: position },
            (results, status) => {
              if (status === 'OK') {
                resolve(results);
              } else {
                // Provide more specific error messages
                let errorMessage = 'Geocoding failed';
                switch (status) {
                  case 'ZERO_RESULTS':
                    errorMessage = 'No address found for this location';
                    break;
                  case 'OVER_QUERY_LIMIT':
                    errorMessage = 'Geocoding quota exceeded. Please try again later';
                    break;
                  case 'REQUEST_DENIED':
                    errorMessage = 'Geocoding API access denied. Please enable Geocoding API in Google Cloud Console and check API key restrictions.';
                    break;
                  case 'INVALID_REQUEST':
                    errorMessage = 'Invalid geocoding request';
                    break;
                  default:
                    errorMessage = `Geocoding failed: ${status}`;
                }
                reject(new Error(errorMessage));
              }
            }
          );
        });

        if (results && results.length > 0) {
          const addressComponents = results[0].address_components;
          const formattedAddress = results[0].formatted_address;

          // Extract address components (excluding street number)
          let streetName = ''; // Only route, not street_number
          let city = '';
          let state = '';
          let zipCode = '';
          let country = '';
          let countryCode = '';

          addressComponents.forEach((component) => {
            const types = component.types;

            // Only get route (street name), exclude street_number (door number)
            if (types.includes('route') && !types.includes('street_number')) {
              streetName = component.long_name;
            }

            // Try different city types (locality, administrative_area_level_2, etc.)
            if (types.includes('locality')) {
              city = component.long_name;
            } else if (!city && types.includes('administrative_area_level_2')) {
              city = component.long_name;
            } else if (!city && types.includes('sublocality')) {
              city = component.long_name;
            }

            // State/Province
            if (types.includes('administrative_area_level_1')) {
              state = component.short_name; // Use short name for state (e.g., CA, NY)
            }

            // ZIP/Postal Code
            if (types.includes('postal_code')) {
              zipCode = component.long_name;
            }

            // Country
            if (types.includes('country')) {
              country = component.long_name;
              countryCode = component.short_name;
            }
          });

          // Call parent callback with location data
          onLocationSelect({
            coordinates: { lat, lng },
            address: streetName || '', // Only street name, no door number
            city: city || '',
            state: state || '',
            zipCode: zipCode || '',
            country: country || '',
            countryCode: countryCode || '',
            fullAddress: formattedAddress
          });

          toast.success('Location selected successfully');
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        
        // Show specific error message with helpful info
        const errorMsg = error.message || 'Failed to get address details';
        
        // For REQUEST_DENIED, show more detailed help
        if (errorMsg.includes('REQUEST_DENIED') || errorMsg.includes('access denied')) {
          toast.error(
            'Geocoding API Access Denied. Please enable Geocoding API in Google Cloud Console. See GEOCODING_TROUBLESHOOTING.md for help.',
            { 
              duration: 8000,
              style: {
                maxWidth: '500px',
                whiteSpace: 'normal'
              }
            }
          );
        } else {
          toast.error(errorMsg, { duration: 4000 });
        }
        
        // Still set coordinates even if geocoding fails
        // User can manually enter address
        onLocationSelect({
          coordinates: { lat, lng },
          address: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
          countryCode: ''
        });
      } finally {
        setIsGeocoding(false);
      }
    } else {
      // If geocoder not available, show helpful message
      console.warn('Geocoder not available. Make sure Google Maps API and Geocoding API are enabled.');
      toast.error('Geocoding service not available. Please check your API configuration.');
      
      // Still set coordinates
      onLocationSelect({
        coordinates: { lat, lng },
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        countryCode: ''
      });
      setIsGeocoding(false);
    }
  }, [onLocationSelect]);

  const handleClearLocation = () => {
    setMarkerPosition(null);
    onLocationSelect({
      coordinates: null,
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      countryCode: ''
    });
  };

  if (loadError) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-red-400">Error loading map. Please check your Google Maps API key.</p>
        <p className="text-gray-400 text-sm mt-2">
          Make sure REACT_APP_GOOGLE_MAPS_API_KEY is set in your .env file
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="glass-card p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-gray-400">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="glass-card p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MapPin className={`w-5 h-5 ${readOnly ? 'text-green-400' : 'text-blue-400'}`} />
            <h3 className="text-lg font-semibold text-white">
              {readOnly ? 'Project Location' : 'Select Project Location'}
            </h3>
          </div>
          {markerPosition && !readOnly && (
            <button
              onClick={handleClearLocation}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Clear location"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {!readOnly && (
          <p className="text-sm text-gray-400 mb-4">
            Click on the map to mark your project location (North America only)
          </p>
        )}
        
        {!apiKeyValue && (
          <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-sm font-medium">⚠️ API Key Missing</p>
            <p className="text-yellow-300 text-xs mt-1">
              Please set REACT_APP_GOOGLE_MAPS_API_KEY in your .env file
            </p>
            <p className="text-yellow-300 text-xs mt-1">
              See <strong>API_KEY_SETUP_GUIDE.md</strong> for step-by-step instructions
            </p>
          </div>
        )}

        <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden border border-white/20">
          {isGeocoding && (
            <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-white text-sm">Getting address...</p>
              </div>
            </div>
          )}
          
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={markerPosition || defaultCenter}
            zoom={markerPosition ? 15 : 4}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={readOnly ? undefined : handleMapClick}
            options={{
              streetViewControl: false,
              mapTypeControl: true,
              fullscreenControl: true,
              zoomControl: true,
              clickableIcons: false,
              draggable: !readOnly
            }}
          >
            {markerPosition && (() => {
              let markerIcon = undefined;
              
              if (markerColor === 'green' && window.google?.maps) {
                // Create a green pin marker - using standard pin shape path
                const pinPath = 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z';
                markerIcon = {
                  path: pinPath,
                  fillColor: '#10b981', // Green-500
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                  scale: 1.2,
                  anchor: new window.google.maps.Point(0, 0)
                };
              } else if (markerColor === 'blue' && window.google?.maps) {
                // Create a blue pin marker
                const pinPath = 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z';
                markerIcon = {
                  path: pinPath,
                  fillColor: '#3b82f6', // Blue-500
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                  scale: 1.2,
                  anchor: new window.google.maps.Point(0, 0)
                };
              }
              
              return (
                <Marker
                  position={markerPosition}
                  animation={readOnly ? undefined : window.google?.maps?.Animation?.DROP}
                  icon={markerIcon}
                />
              );
            })()}
          </GoogleMap>
        </div>

        {markerPosition && (
          <div className="mt-4 p-3 bg-white/5 rounded-lg">
            <p className="text-sm text-gray-400">Selected Location Coordinates:</p>
            <p className="text-white font-medium">
              {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              If address fields are empty, you can enter them manually below.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationMap;

