import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark';
type FontSize = 'small' | 'medium' | 'large' | 'extra-large';
type ContrastMode = 'normal' | 'high';

interface AccessibilityContextType {
  theme: ThemeMode;
  fontSize: FontSize;
  contrast: ContrastMode;
  setTheme: (theme: ThemeMode) => void;
  setFontSize: (size: FontSize) => void;
  setContrast: (contrast: ContrastMode) => void;
  toggleTheme: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const STORAGE_KEYS = {
  THEME: 'accessibility-theme',
  FONT_SIZE: 'accessibility-font-size',
  CONTRAST: 'accessibility-contrast',
};

const FONT_SIZE_MAP = {
  small: '14px',
  medium: '16px',
  large: '18px',
  'extra-large': '20px',
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return (saved as ThemeMode) || 'light';
  });

  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FONT_SIZE);
    return (saved as FontSize) || 'medium';
  });

  const [contrast, setContrastState] = useState<ContrastMode>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONTRAST);
    return (saved as ContrastMode) || 'normal';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply theme
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);

    // Apply font size
    root.style.fontSize = FONT_SIZE_MAP[fontSize];
    localStorage.setItem(STORAGE_KEYS.FONT_SIZE, fontSize);

    // Apply contrast
    if (contrast === 'high') {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    localStorage.setItem(STORAGE_KEYS.CONTRAST, contrast);
  }, [theme, fontSize, contrast]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const setFontSize = (newSize: FontSize) => {
    setFontSizeState(newSize);
  };

  const setContrast = (newContrast: ContrastMode) => {
    setContrastState(newContrast);
  };

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <AccessibilityContext.Provider
      value={{
        theme,
        fontSize,
        contrast,
        setTheme,
        setFontSize,
        setContrast,
        toggleTheme,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
