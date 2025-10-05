'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State to track if the theme has been initialized
  const [isClient, setIsClient] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Only run on the client side (after hydration)
    setIsClient(true);
    const storedTheme = (localStorage.getItem('theme') as Theme) || 'light';
    setTheme(storedTheme);
  }, []);

  useEffect(() => {
    if (isClient) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme, isClient]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  if (!isClient) {
    // Prevent rendering the children until the client is ready
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return [context.theme, context.toggleTheme] as const;
};
