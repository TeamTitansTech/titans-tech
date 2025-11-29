'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from 'react';
import { getCompanyPublicInfo, type Company } from '@/data/services/companies.api';
import { useTheme as useNextTheme } from 'next-themes';

interface ThemeContextType {
  companyInfo: Pick<Company, 'id' | 'slug' | 'name' | 'logo' | 'brandColor' | 'accentColor'> | null;
  isLoading: boolean;
  updateBrandColor: (color: string) => void;
  updateAccentColor: (color: string) => void;
  updateColors: (brandColor: string, accentColor: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Converts a hex color to HSL values string for CSS variables
 * @param hex - Hex color string (e.g., "#22c55e" or "22c55e")
 * @returns HSL values string (e.g., "142 71% 45%")
 */
function hexToHSL(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Parse hex values
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Generates a foreground color based on background brightness
 * Returns white for dark colors, dark for light colors
 */
function getForegroundHSL(hex: string): string {
  hex = hex.replace(/^#/, '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return white for dark backgrounds, dark for light backgrounds
  return luminance > 0.5 ? '215 25% 15%' : '0 0% 98%';
}

/**
 * Derives a sidebar background color from the brand color
 * In dark mode: uses neutral dark colors (no brand tint)
 * In light mode: uses brand-tinted dark sidebar
 */
function getSidebarHSL(hex: string, isDark: boolean): string {
  // Dark mode: pure neutral dark sidebar
  if (isDark) {
    return '0 0% 5%';
  }

  // Light mode: derive from brand color
  hex = hex.replace(/^#/, '');

  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  // Light mode: dark sidebar with visible brand color tint
  // Higher saturation (50%) and lightness (18%) to make brand color more visible
  return `${Math.round(h * 360)} ${Math.round(s * 50)}% 18%`;
}

/**
 * Derives a sidebar accent color (slightly lighter than sidebar for hover states)
 */
function getSidebarAccentHSL(hex: string, isDark: boolean): string {
  // Dark mode: pure neutral accent
  if (isDark) {
    return '0 0% 12%';
  }

  // Light mode: derive from brand color
  hex = hex.replace(/^#/, '');

  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  // Light mode: slightly lighter than sidebar for hover states
  return `${Math.round(h * 360)} ${Math.round(s * 45)}% 25%`;
}

function applyPrimaryColor(brandColor: string, isDark: boolean = false) {
  const primaryHSL = hexToHSL(brandColor);
  const foregroundHSL = getForegroundHSL(brandColor);
  const sidebarHSL = getSidebarHSL(brandColor, isDark);
  const sidebarAccentHSL = getSidebarAccentHSL(brandColor, isDark);

  // Apply to document root
  document.documentElement.style.setProperty('--primary', primaryHSL);
  document.documentElement.style.setProperty('--primary-foreground', foregroundHSL);
  document.documentElement.style.setProperty('--ring', primaryHSL);

  // Also update sidebar primary for consistency
  document.documentElement.style.setProperty('--sidebar-primary', primaryHSL);
  document.documentElement.style.setProperty('--sidebar-primary-foreground', foregroundHSL);

  // Update sidebar background based on brand color (dark version)
  document.documentElement.style.setProperty('--sidebar', sidebarHSL);
  document.documentElement.style.setProperty('--sidebar-background', sidebarHSL);
  document.documentElement.style.setProperty('--sidebar-accent', sidebarAccentHSL);
  document.documentElement.style.setProperty('--sidebar-border', sidebarAccentHSL);
}

function applyAccentColor(accentColor: string) {
  const accentHSL = hexToHSL(accentColor);
  const foregroundHSL = getForegroundHSL(accentColor);

  // Apply accent color
  document.documentElement.style.setProperty('--accent', accentHSL);
  document.documentElement.style.setProperty('--accent-foreground', foregroundHSL);

  // Update action orange (used for hovers)
  document.documentElement.style.setProperty('--action-orange', accentHSL);

  // Update sidebar ring (often uses accent)
  document.documentElement.style.setProperty('--sidebar-ring', accentHSL);
}

function applyThemeColors(brandColor?: string, accentColor?: string, isDark: boolean = false) {
  if (brandColor) {
    applyPrimaryColor(brandColor, isDark);
  }
  if (accentColor) {
    applyAccentColor(accentColor);
  }
}

function clearThemeColors() {
  // Clear primary colors
  document.documentElement.style.removeProperty('--primary');
  document.documentElement.style.removeProperty('--primary-foreground');
  document.documentElement.style.removeProperty('--ring');
  document.documentElement.style.removeProperty('--sidebar-primary');
  document.documentElement.style.removeProperty('--sidebar-primary-foreground');

  // Clear sidebar background colors
  document.documentElement.style.removeProperty('--sidebar');
  document.documentElement.style.removeProperty('--sidebar-background');
  document.documentElement.style.removeProperty('--sidebar-accent');
  document.documentElement.style.removeProperty('--sidebar-border');

  // Clear accent colors
  document.documentElement.style.removeProperty('--accent');
  document.documentElement.style.removeProperty('--accent-foreground');
  document.documentElement.style.removeProperty('--action-orange');
  document.documentElement.style.removeProperty('--sidebar-ring');
}

interface ThemeProviderProps {
  children: ReactNode;
  subdomain: string;
  initialColors?: {
    brandColor?: string;
    accentColor?: string;
  };
}

/**
 * Generate initial CSS for server-side rendering to prevent color flash
 */
function generateInitialCSS(brandColor?: string, accentColor?: string): string {
  if (!brandColor && !accentColor) return '';

  const cssVars: string[] = [];

  if (brandColor) {
    const primaryHSL = hexToHSL(brandColor);
    const foregroundHSL = getForegroundHSL(brandColor);
    // For initial render, use light mode sidebar colors (will be adjusted by JS for dark mode)
    const sidebarHSL = getSidebarHSL(brandColor, false);
    const sidebarAccentHSL = getSidebarAccentHSL(brandColor, false);

    cssVars.push(`--primary: ${primaryHSL}`);
    cssVars.push(`--primary-foreground: ${foregroundHSL}`);
    cssVars.push(`--ring: ${primaryHSL}`);
    cssVars.push(`--sidebar-primary: ${primaryHSL}`);
    cssVars.push(`--sidebar-primary-foreground: ${foregroundHSL}`);
    cssVars.push(`--sidebar: ${sidebarHSL}`);
    cssVars.push(`--sidebar-background: ${sidebarHSL}`);
    cssVars.push(`--sidebar-accent: ${sidebarAccentHSL}`);
    cssVars.push(`--sidebar-border: ${sidebarAccentHSL}`);
  }

  if (accentColor) {
    const accentHSL = hexToHSL(accentColor);
    const foregroundHSL = getForegroundHSL(accentColor);

    cssVars.push(`--accent: ${accentHSL}`);
    cssVars.push(`--accent-foreground: ${foregroundHSL}`);
    cssVars.push(`--action-orange: ${accentHSL}`);
    cssVars.push(`--sidebar-ring: ${accentHSL}`);
  }

  return `:root { ${cssVars.join('; ')} }`;
}

export function ThemeProvider({ children, subdomain, initialColors }: ThemeProviderProps) {
  const [companyInfo, setCompanyInfo] = useState<ThemeContextType['companyInfo']>(null);
  const [isLoading, setIsLoading] = useState(!initialColors);
  const { resolvedTheme } = useNextTheme();
  const colorsRef = useRef<{ brandColor?: string; accentColor?: string }>(initialColors || {});

  const isDark = resolvedTheme === 'dark';

  // Generate initial CSS for server-side rendering
  const initialCSS = generateInitialCSS(initialColors?.brandColor, initialColors?.accentColor);

  // Apply colors on mount and when initial colors are provided
  useEffect(() => {
    if (initialColors?.brandColor || initialColors?.accentColor) {
      applyThemeColors(initialColors.brandColor, initialColors.accentColor, isDark);
    }
  }, [initialColors, isDark]);

  // Fetch company theme on mount (only if no initial colors provided)
  useEffect(() => {
    async function fetchCompanyTheme() {
      if (!subdomain || initialColors) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await getCompanyPublicInfo({ companySlug: subdomain });

        if (response.data) {
          setCompanyInfo(response.data);

          // Store colors for re-application on theme change
          colorsRef.current = {
            brandColor: response.data.brandColor || undefined,
            accentColor: response.data.accentColor || undefined,
          };

          // Apply theme colors if available
          applyThemeColors(
            response.data.brandColor || undefined,
            response.data.accentColor || undefined,
            isDark,
          );
        }
      } catch (error) {
        console.error('Failed to fetch company theme:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCompanyTheme();

    // Cleanup: remove custom styles when unmounting
    return () => {
      clearThemeColors();
    };
  }, [subdomain, isDark, initialColors]);

  // Re-apply colors when dark/light mode changes
  useEffect(() => {
    if (colorsRef.current.brandColor || colorsRef.current.accentColor) {
      applyThemeColors(colorsRef.current.brandColor, colorsRef.current.accentColor, isDark);
    }
  }, [isDark]);

  // Allow updating the brand color dynamically (useful for settings page preview)
  const updateBrandColor = useCallback(
    (color: string) => {
      if (color) {
        applyPrimaryColor(color, isDark);
        colorsRef.current.brandColor = color;
        setCompanyInfo((prev) => (prev ? { ...prev, brandColor: color } : null));
      }
    },
    [isDark],
  );

  // Allow updating the accent color dynamically
  const updateAccentColor = useCallback((color: string) => {
    if (color) {
      applyAccentColor(color);
      colorsRef.current.accentColor = color;
      setCompanyInfo((prev) => (prev ? { ...prev, accentColor: color } : null));
    }
  }, []);

  // Update both colors at once
  const updateColors = useCallback(
    (brandColor: string, accentColor: string) => {
      applyThemeColors(brandColor, accentColor, isDark);
      colorsRef.current = { brandColor, accentColor };
      setCompanyInfo((prev) => (prev ? { ...prev, brandColor, accentColor } : null));
    },
    [isDark],
  );

  return (
    <ThemeContext.Provider
      value={{ companyInfo, isLoading, updateBrandColor, updateAccentColor, updateColors }}
    >
      {/* Inject initial CSS to prevent color flash during hydration */}
      {initialCSS && <style dangerouslySetInnerHTML={{ __html: initialCSS }} />}
      {children}
    </ThemeContext.Provider>
  );
}

// Default values for when useTheme is called outside of ThemeProvider (e.g., admin routes)
const defaultThemeContext: ThemeContextType = {
  companyInfo: null,
  isLoading: false,
  updateBrandColor: () => {},
  updateAccentColor: () => {},
  updateColors: () => {},
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  // Return default context if used outside ThemeProvider (e.g., admin routes)
  if (context === undefined) {
    return defaultThemeContext;
  }
  return context;
}
