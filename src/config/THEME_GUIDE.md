# Theme Configuration Guide

## Overview
This guide explains how to use and modify the theme configuration for the Medi-Mart application.

## File Structure
- `frontend/src/config/theme.js` - Main theme configuration file
- `frontend/src/index.css` - Global CSS with CSS variables (also needs updating when theme changes)

## Current Theme Colors

### Primary Colors
- **Primary**: `#946259` - Main brand color (buttons, accents, links)
- **Primary Dark**: `#7a4f47` - Darker shade for hover states
- **Primary Light**: `#b07a6f` - Lighter shade for subtle accents
- **Primary Accent**: `#a66d62` - Alternative accent color

### Background Colors
- **Background**: `#faf9f6` - Main background (cream/beige)
- **Background Light**: `#f5f5f0` - Light background variant
- **White**: `#ffffff` - Pure white

### Text Colors
- **Text**: `#2c2c2c` - Main text color (dark gray)
- **Text Secondary**: `#666666` - Secondary text
- **Text Light**: `#999999` - Light text

### Border Colors
- **Border**: `#d4d4c4` - Main border color (light gray)
- **Border Light**: `#e5e5e5` - Lighter border
- **Border Dark**: `#b0b0b0` - Darker border

### Status Colors
- **Success**: `#10b981` - Green for success states
- **Error**: `#ef4444` - Red for errors
- **Warning**: `#f59e0b` - Orange for warnings
- **Info**: `#3b82f6` - Blue for info

### Special Colors
- **Sold Out**: `#ef4444` - Red for "Sold Out" badges
- **Discount**: `#946259` - Color for discount badges

## How to Change Themes

### Option 1: Modify theme.js
1. Open `frontend/src/config/theme.js`
2. Modify the `themes.current` object with your new color values
3. Update `frontend/src/index.css` CSS variables to match

### Option 2: Revert to Original
If you want to revert to the original theme:
```javascript
import { revertToOriginal } from './config/theme';
revertToOriginal();
```

## Usage in Components

### Import and Use
```javascript
import { colors, theme } from '../../config/theme';

// Use in className
<div className={`bg-[${colors.primary}] text-white`}>

// Or use the theme object
<div style={{ backgroundColor: theme.colors.primary }}>
```

## Important Notes

1. **CSS Variables**: The `index.css` file also has CSS variables defined. When changing themes, update both:
   - `theme.js` (for JavaScript usage)
   - `index.css` (for CSS/Tailwind usage)

2. **Tailwind Classes**: Many components use Tailwind classes with hardcoded colors like `bg-[#946259]`. To fully switch themes, you'll need to:
   - Replace hardcoded colors with theme variables, OR
   - Update all instances manually

3. **Original Theme**: The `themes.original` object is preserved and should NOT be modified. It's your backup.

## Next Steps for Full Theme Support

To make theme switching easier in the future, consider:
1. Creating a ThemeProvider context
2. Replacing hardcoded color values with theme variables
3. Using CSS variables more extensively
4. Creating a theme switcher component

