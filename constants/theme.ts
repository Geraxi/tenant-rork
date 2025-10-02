export const Colors = {
  primary: '#4A7FE5',
  primaryDark: '#3B6BD1',
  primaryLight: '#6B9AFF',
  secondary: '#5A8BF7',
  accent: '#7BA7FF',
  accentLight: '#A3C4FF',
  text: '#222222',
  textSecondary: '#717171',
  textLight: '#FFFFFF',
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  backgroundGradientStart: '#4A7FE5',
  backgroundGradientEnd: '#6B9AFF',
  border: '#E5E5E5',
  borderLight: 'rgba(255, 255, 255, 0.25)',
  success: '#00C851',
  warning: '#FFB74D',
  error: '#FF5252',
  like: '#4CAF50',
  nope: '#F44336',
  overlay: 'rgba(74, 127, 229, 0.1)',
  overlayDark: 'rgba(255, 255, 255, 0.15)',
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

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal' as const,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: 'normal' as const,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: 'normal' as const,
    lineHeight: 16,
  },
};