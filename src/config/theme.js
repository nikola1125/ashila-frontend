/**
 * Theme Configuration
 * 
 * This file contains all color values and theme settings for the application.
 * To switch themes, simply update the values in the 'current' theme object.
 * 
 * To revert to the original theme, copy values from 'original' to 'current'.
 */

export const themes = {
  // Original theme - DO NOT MODIFY (used for reverting)
  original: {
    colors: {
      // Primary brand colors
      primary: '#946259',           // Main brand color (buttons, accents, links)
      primaryDark: '#7a4f47',      // Darker shade for hover states
      primaryLight: '#b07a6f',    // Lighter shade for subtle accents
      primaryAccent: '#a66d62',   // Alternative accent color
      
      // Background colors
      background: '#faf9f6',      // Main background (cream/beige)
      backgroundLight: '#f5f5f0', // Light background variant
      white: '#ffffff',            // Pure white
      
      // Text colors
      text: '#2c2c2c',            // Main text color (dark gray)
      textSecondary: '#666666',   // Secondary text
      textLight: '#999999',        // Light text
      
      // Border colors
      border: '#d4d4c4',           // Main border color (light gray)
      borderLight: '#e5e5e5',     // Lighter border
      borderDark: '#b0b0b0',      // Darker border
      
      // Status colors
      success: '#10b981',          // Green for success states
      error: '#ef4444',            // Red for errors
      warning: '#f59e0b',          // Orange for warnings
      info: '#3b82f6',             // Blue for info
      
      // Special colors
      soldOut: '#ef4444',          // Red for "Sold Out" badges
      discount: '#946259',         // Color for discount badges
    },
    
    // Typography
    typography: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Playfair Display', 'serif'],
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      letterSpacing: {
        tight: '0.01em',
        normal: '0.015em',
        wide: '0.02em',
        wider: '0.03em',
        widest: '0.05em',
      },
    },
    
    // Spacing and layout
    spacing: {
      sectionPadding: {
        mobile: 'py-12',
        desktop: 'md:py-16',
      },
      containerMaxWidth: 'max-w-7xl',
    },
    
    // Border radius (currently square/0)
    borderRadius: {
      none: '0',
      sm: '0',
      md: '0',
      lg: '0',
      full: '9999px', // Only for cart badge
    },
  },
  
  // Current theme - modify this to change the theme
  current: {
    colors: {
      // Primary brand colors
      primary: '#A67856',           // Caramel Brown - Main brand color (buttons, accents, links, label stripe, cap, borders)
      primaryDark: '#8B6345',      // Darker shade for hover states (derived from Caramel Brown)
      primaryLight: '#B8906F',     // Lighter shade for subtle accents (derived from Caramel Brown)
      primaryAccent: '#F4A640',     // Golden Orange - Brand highlight (small icons or logo detail)
      
      // Background colors
      background: '#EBD8C8',        // Soft Almond Beige - Main background (elegant, warm, clean)
      backgroundLight: '#F5EDE4',  // Light background variant (lighter beige)
      white: '#ffffff',             // Pure white
      
      // Text colors
      text: '#4A3628',              // Rich Coffee Brown - Main text color
      textSecondary: '#6B5A4A',    // Secondary text (lighter coffee brown)
      textLight: '#8B7A6B',        // Light text (even lighter coffee brown)
      
      // Border colors
      border: '#D9BFA9',            // Warm Beige - Main border color (shadows/depth)
      borderLight: '#E8D4C4',      // Lighter border (lighter warm beige)
      borderDark: '#C4A68A',       // Darker border (darker warm beige)
      
      // Status colors
      success: '#10b981',           // Green for success states
      error: '#ef4444',             // Red for errors
      warning: '#f59e0b',           // Orange for warnings
      info: '#3b82f6',              // Blue for info
      
      // Special colors
      soldOut: '#ef4444',           // Red for "Sold Out" badges
      discount: '#A67856',          // Caramel Brown for discount badges
    },
    
    // Typography
    typography: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Playfair Display', 'serif'],
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      letterSpacing: {
        tight: '0.01em',
        normal: '0.015em',
        wide: '0.02em',
        wider: '0.03em',
        widest: '0.05em',
      },
    },
    
    // Spacing and layout
    spacing: {
      sectionPadding: {
        mobile: 'py-12',
        desktop: 'md:py-16',
      },
      containerMaxWidth: 'max-w-7xl',
    },
    
    // Border radius (currently square/0)
    borderRadius: {
      none: '0',
      sm: '0',
      md: '0',
      lg: '0',
      full: '9999px', // Only for cart badge
    },
  },
};

// Export current theme as default for easy access
export const theme = themes.current;

// Helper function to revert to original theme
export const revertToOriginal = () => {
  themes.current = JSON.parse(JSON.stringify(themes.original));
  return themes.current;
};

// Helper function to get a color value
export const getColor = (colorPath) => {
  const parts = colorPath.split('.');
  let value = themes.current;
  for (const part of parts) {
    value = value[part];
    if (value === undefined) return null;
  }
  return value;
};

// Export color shortcuts for convenience
export const colors = themes.current.colors;
export const typography = themes.current.typography;
export const spacing = themes.current.spacing;
export const borderRadius = themes.current.borderRadius;

