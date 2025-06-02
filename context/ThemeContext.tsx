import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

type ThemeType = 'light' | 'dark';

type ThemeContextType = {
  theme: ThemeType;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const deviceTheme = useColorScheme() as ThemeType;
  const [theme, setTheme] = useState<ThemeType>('dark');
  const mounted = useRef(false);
  
  useEffect(() => {
    mounted.current = true;
    
    // Load saved theme from AsyncStorage
    async function loadTheme() {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        // Only update state if component is still mounted
        if (mounted.current) {
          // If there's a saved theme, use it, otherwise use device theme
          setTheme(savedTheme as ThemeType || deviceTheme || 'dark');
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
        // Fallback to device theme or dark only if still mounted
        if (mounted.current) {
          setTheme(deviceTheme || 'dark');
        }
      }
    }
    
    loadTheme();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      mounted.current = false;
    };
  }, [deviceTheme]);
  
  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    if (mounted.current) {
      setTheme(newTheme);
    }
    
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}