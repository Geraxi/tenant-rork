// Apple HIG Semantic Colors - Dynamic colors that adapt to light/dark mode
// Following iOS system color palette for native feel
export const Colors = {
  // Primary Brand Colors - iOS Blue as base
  primary: '#007AFF', // iOS system blue
  primaryDark: '#0051D5',
  primaryLight: '#5AC8FA',
  
  // Secondary Colors
  secondary: '#5856D6', // iOS system purple
  accent: '#007AFF',
  accentLight: '#5AC8FA',
  
  // Label Colors (Text) - iOS semantic colors
  label: '#000000', // Primary text
  labelSecondary: 'rgba(60, 60, 67, 0.6)', // Secondary text
  labelTertiary: 'rgba(60, 60, 67, 0.3)', // Tertiary text
  labelQuaternary: 'rgba(60, 60, 67, 0.18)', // Quaternary text
  
  // Legacy text aliases for backward compatibility
  text: '#000000',
  textSecondary: 'rgba(60, 60, 67, 0.6)',
  textLight: '#FFFFFF',
  
  // Background Colors - iOS semantic backgrounds
  systemBackground: '#FFFFFF', // Primary background
  secondarySystemBackground: '#F2F2F7', // Secondary background
  tertiarySystemBackground: '#FFFFFF', // Tertiary background
  
  // Legacy background aliases
  background: '#FFFFFF',
  backgroundSecondary: '#F2F2F7',
  backgroundGradientStart: '#007AFF',
  backgroundGradientEnd: '#5AC8FA',
  
  // Grouped Background Colors - for grouped lists
  systemGroupedBackground: '#F2F2F7',
  secondarySystemGroupedBackground: '#FFFFFF',
  tertiarySystemGroupedBackground: '#F2F2F7',
  
  // Fill Colors - for UI elements
  systemFill: 'rgba(120, 120, 128, 0.2)',
  secondarySystemFill: 'rgba(120, 120, 128, 0.16)',
  tertiarySystemFill: 'rgba(118, 118, 128, 0.12)',
  quaternarySystemFill: 'rgba(116, 116, 128, 0.08)',
  
  // Separator Colors
  separator: 'rgba(60, 60, 67, 0.29)',
  opaqueSeparator: '#C6C6C8',
  
  // Legacy border aliases
  border: 'rgba(60, 60, 67, 0.29)',
  borderLight: 'rgba(255, 255, 255, 0.3)',
  
  // iOS System Colors for semantic meaning
  systemRed: '#FF3B30',
  systemOrange: '#FF9500',
  systemYellow: '#FFCC00',
  systemGreen: '#34C759',
  systemMint: '#00C7BE',
  systemTeal: '#30B0C7',
  systemCyan: '#32ADE6',
  systemBlue: '#007AFF',
  systemIndigo: '#5856D6',
  systemPurple: '#AF52DE',
  systemPink: '#FF2D55',
  systemBrown: '#A2845E',
  systemGray: '#8E8E93',
  systemGray2: '#AEAEB2',
  systemGray3: '#C7C7CC',
  systemGray4: '#D1D1D6',
  systemGray5: '#E5E5EA',
  systemGray6: '#F2F2F7',
  
  // Semantic Status Colors
  success: '#34C759', // iOS green
  warning: '#FF9500', // iOS orange
  error: '#FF3B30', // iOS red
  info: '#007AFF', // iOS blue
  
  // Action Colors
  like: '#34C759', // iOS green
  nope: '#FF3B30', // iOS red
  superLike: '#007AFF', // iOS blue
  
  // Overlay Colors
  overlay: 'rgba(0, 122, 255, 0.1)',
  overlayDark: 'rgba(0, 0, 0, 0.4)',
  overlayLight: 'rgba(255, 255, 255, 0.2)',
  
  // Link Color
  link: '#007AFF',
  
  // Placeholder Color
  placeholderText: 'rgba(60, 60, 67, 0.3)',
};

// Dark Mode Colors - for future dark mode support
export const DarkColors = {
  // Primary Brand Colors
  primary: '#0A84FF', // iOS system blue (dark)
  primaryDark: '#409CFF',
  primaryLight: '#64D2FF',
  
  secondary: '#5E5CE6', // iOS system purple (dark)
  accent: '#0A84FF',
  accentLight: '#64D2FF',
  
  // Label Colors (Text)
  label: '#FFFFFF',
  labelSecondary: 'rgba(235, 235, 245, 0.6)',
  labelTertiary: 'rgba(235, 235, 245, 0.3)',
  labelQuaternary: 'rgba(235, 235, 245, 0.18)',
  
  text: '#FFFFFF',
  textSecondary: 'rgba(235, 235, 245, 0.6)',
  textLight: '#FFFFFF',
  
  // Background Colors
  systemBackground: '#000000',
  secondarySystemBackground: '#1C1C1E',
  tertiarySystemBackground: '#2C2C2E',
  
  background: '#000000',
  backgroundSecondary: '#1C1C1E',
  backgroundGradientStart: '#0A84FF',
  backgroundGradientEnd: '#64D2FF',
  
  // Grouped Background Colors
  systemGroupedBackground: '#000000',
  secondarySystemGroupedBackground: '#1C1C1E',
  tertiarySystemGroupedBackground: '#2C2C2E',
  
  // Fill Colors
  systemFill: 'rgba(120, 120, 128, 0.36)',
  secondarySystemFill: 'rgba(120, 120, 128, 0.32)',
  tertiarySystemFill: 'rgba(118, 118, 128, 0.24)',
  quaternarySystemFill: 'rgba(118, 118, 128, 0.18)',
  
  // Separator Colors
  separator: 'rgba(84, 84, 88, 0.6)',
  opaqueSeparator: '#38383A',
  
  border: 'rgba(84, 84, 88, 0.6)',
  borderLight: 'rgba(255, 255, 255, 0.15)',
  
  // iOS System Colors (Dark Mode)
  systemRed: '#FF453A',
  systemOrange: '#FF9F0A',
  systemYellow: '#FFD60A',
  systemGreen: '#32D74B',
  systemMint: '#63E6E2',
  systemTeal: '#40CBE0',
  systemCyan: '#64D2FF',
  systemBlue: '#0A84FF',
  systemIndigo: '#5E5CE6',
  systemPurple: '#BF5AF2',
  systemPink: '#FF375F',
  systemBrown: '#AC8E68',
  systemGray: '#8E8E93',
  systemGray2: '#636366',
  systemGray3: '#48484A',
  systemGray4: '#3A3A3C',
  systemGray5: '#2C2C2E',
  systemGray6: '#1C1C1E',
  
  success: '#32D74B',
  warning: '#FF9F0A',
  error: '#FF453A',
  info: '#0A84FF',
  
  like: '#32D74B',
  nope: '#FF453A',
  superLike: '#0A84FF',
  
  overlay: 'rgba(10, 132, 255, 0.15)',
  overlayDark: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(255, 255, 255, 0.1)',
  
  link: '#0A84FF',
  placeholderText: 'rgba(235, 235, 245, 0.3)',
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