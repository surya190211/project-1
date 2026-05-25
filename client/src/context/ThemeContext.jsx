import React, { createContext, useContext, useState, useEffect } from 'react';
import { applyTheme } from '../utils/theme.js';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('dsa_tracker_theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Default to dark mode for premium look
    return true;
  });

  useEffect(() => {
    applyTheme(darkMode);
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
