import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or default to 'dark'
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    
    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
      // Default to dark theme if no preference is saved
      return 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  // Apply theme to document immediately on mount and whenever theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const root = document.documentElement;
      const body = document.body;

      if (theme === 'light') {
        root.classList.remove('dark');
        body.classList.add('light');
      } else {
        root.classList.add('dark');
        body.classList.remove('light');
      }

      // Save to localStorage
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.error('Error applying theme:', e);
    }
  }, [theme]);

  // Apply theme immediately on mount (before React renders)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedTheme = localStorage.getItem('theme') || 'dark';
      const root = document.documentElement;
      const body = document.body;

      if (savedTheme === 'light') {
        root.classList.remove('dark');
        body.classList.add('light');
      } else {
        root.classList.add('dark');
        body.classList.remove('light');
      }
    } catch (e) {
      // Ignore errors
    }
  }, []); // Run only once on mount

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      return newTheme;
    });
  };

  const setThemeMode = (mode) => {
    if (mode === 'light' || mode === 'dark') {
      setTheme(mode);
    }
  };

  // Listen for global theme toggle events
  useEffect(() => {
    const handler = () => toggleTheme();
    window.addEventListener('theme:toggle', handler);
    return () => window.removeEventListener('theme:toggle', handler);
  }, []);

  const value = {
    theme,
    toggleTheme,
    setTheme: setThemeMode,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;

