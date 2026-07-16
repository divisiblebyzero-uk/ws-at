// src/hooks/useTheme.ts
import { useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

export const useTheme = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    // 1. If the user explicitly saved a choice via an in-app button, respect it
    const saved = localStorage.getItem('app-theme') as ThemeMode;
    if (saved) return saved;

    // 2. Default fallback to real-time system settings
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    // Sync the attribute to apply the correct index.css variables instantly
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    // 3. THE RE-RENDER FIX: Listen for system theme flips while the app is active
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // ONLY auto-flip if the user hasn't explicitly locked an option in local storage
      const hasManualOverride = localStorage.getItem('app-theme');
      if (!hasManualOverride) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    // Attach the hardware listener loop
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    // Clean up the listener channels on component unmount
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('app-theme', nextTheme); // Lock manual choice
  };

  return { theme, toggleTheme };
};
