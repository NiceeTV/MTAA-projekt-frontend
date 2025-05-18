import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Kontext a provider pre správu témy aplikácie (dark/light mode).
 * 
 * Tento modul poskytuje:
 * - Globálny stav pre správu tmavého/svetlého režimu
 * - Funkciu na prepínanie medzi režimami
 * - Ukladanie nastavení do AsyncStorage pre trvalosť
 * - Jednoduchý prístup k téme cez vlastný hook useTheme()
 * 
 * Hlavné funkcie:
 * - Inicializácia témy pri spustení aplikácie
 * - Synchronizácia stavu s lokálnym úložiskom
 * - Poskytnutie kontextu pre celú aplikáciu
 * 
 * Rozhranie:
 * - ThemeContextType - Typ pre kontext témy
 * - ThemeProvider - Komponent poskytujúci kontext
 * - useTheme() - Hook pre prístup k téme
 */

type ThemeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
});

type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      const stored = await AsyncStorage.getItem('darkMode');
      if (stored !== null) setDarkMode(stored === 'true');
    };
    loadTheme();
  }, []);

  const toggleDarkMode = async () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    await AsyncStorage.setItem('darkMode', newValue.toString());
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
