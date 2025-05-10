import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Location from 'expo-location';

type LocationPermissionContextType = {
  permissionGranted: boolean;
  requestPermission: () => Promise<void>;
};

const LocationPermissionContext = createContext<LocationPermissionContextType>({
  permissionGranted: false,
  requestPermission: async () => {},
});

export const useLocationPermission = () => useContext(LocationPermissionContext);

export const LocationPermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [permissionGranted, setPermissionGranted] = useState(false);

  const requestPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    setPermissionGranted(status === 'granted');
  };

  useEffect(() => {
    requestPermission();
  }, []);

  return (
    <LocationPermissionContext.Provider value={{ permissionGranted, requestPermission }}>
      {children}
    </LocationPermissionContext.Provider>
  );
};
