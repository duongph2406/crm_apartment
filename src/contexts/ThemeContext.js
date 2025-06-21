import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('system');
  const [resolvedTheme, setResolvedTheme] = useState('light');

  // Detect system theme
  const getSystemTheme = useCallback(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }, []);

  // Update resolved theme based on current theme setting
  const updateResolvedTheme = useCallback((currentTheme = theme) => {
    if (currentTheme === 'system') {
      setResolvedTheme(getSystemTheme());
    } else {
      setResolvedTheme(currentTheme);
    }
  }, [theme, getSystemTheme]);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme);
    
    // Initialize resolved theme without calling updateResolvedTheme to avoid dependency
    if (savedTheme === 'system') {
      setResolvedTheme(getSystemTheme());
    } else {
      setResolvedTheme(savedTheme);
    }
  }, [getSystemTheme]); // Include getSystemTheme since it's used inside

  // Listen for system theme changes
  useEffect(() => {
    updateResolvedTheme(theme);
    
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        updateResolvedTheme('system');
      }
    };
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [theme]); // Chỉ phụ thuộc vào theme

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [resolvedTheme]);

  const changeTheme = useCallback((newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    updateResolvedTheme(newTheme);
  }, [updateResolvedTheme]);

  const value = {
    theme,
    resolvedTheme,
    changeTheme,
    isDark: resolvedTheme === 'dark',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 