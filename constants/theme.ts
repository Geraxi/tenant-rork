// Colors optimized for WCAG AA contrast ratios
export const Colors = {
  primary: '#3B6BD1', // Darker for better contrast (was #4A7FE5)
  primaryDark: '#2E5AB8',
  primaryLight: '#5A8BF7',
  secondary: '#4A7FE5',
  accent: '#6B9AFF',
  accentLight: '#8FB3FF',
  text: '#1A1A1A', // Darker for better contrast (was #222222)
  textSecondary: '#5A5A5A', // Darker for better contrast (was #717171)
  textLight: '#FFFFFF',
  background: '#FFFFFF',
  backgroundSecondary: '#F5F5F5', // Slightly darker for better distinction
  backgroundGradientStart: '#3B6BD1',
  backgroundGradientEnd: '#5A8BF7',
  border: '#D0D0D0', // Darker for better visibility
  borderLight: 'rgba(255, 255, 255, 0.3)',
  success: '#00A843', // Darker for better contrast
  warning: '#F57C00', // Darker for better contrast (was #FFB74D)
  error: '#D32F2F', // Darker for better contrast (was #FF5252)
  like: '#388E3C', // Darker for better contrast (was #4CAF50)
  nope: '#D32F2F', // Darker for better contrast (was #F44336)
  overlay: 'rgba(59, 107, 209, 0.1)',
  overlayDark: 'rgba(255, 255, 255, 0.2)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Typography with Dynamic Type support
// Base sizes that scale with system font size settings
export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
    // Scales with accessibility settings
    maxFontSizeMultiplier: 1.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    lineHeight: 32,
    maxFontSizeMultiplier: 1.5,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    maxFontSizeMultiplier: 1.5,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 24,
    maxFontSizeMultiplier: 2.0, // Allow more scaling for body text
  },
  caption: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 20,
    maxFontSizeMultiplier: 2.0,
  },
  small: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    lineHeight: 16,
    maxFontSizeMultiplier: 2.0,
  },
};

// Accessibility constants
export const Accessibility = {
  // Minimum touch target size per Apple HIG
  minTouchTarget: 44,
  // Recommended spacing for touch targets
  touchTargetSpacing: 8,
  // Animation durations (can be disabled for reduced motion)
  animationDuration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
};