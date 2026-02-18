import React, { createContext, useState, useContext, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationContextType {
  location: Location.LocationObject | null;
  loading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  refreshLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setError('Location permission denied');
        return false;
      }

      await refreshLocation();
      return true;
    } catch (err) {
      setError('Failed to request location permission');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshLocation = async () => {
    try {
      setLoading(true);
      setError(null);

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });

      setLocation(location);
    } catch (err) {
      setError('Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        loading,
        error,
        requestPermission,
        refreshLocation
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
};
