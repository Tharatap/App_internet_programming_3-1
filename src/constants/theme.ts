/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/**
 * On web the app is constrained to a phone-sized column centered on screen so
 * the mobile layout doesn't stretch across a wide desktop window. On native it
 * is unused (screens fill the device).
 */
export const AppFrameWidth = 480;

/**
 * Brand palette for the Chaje Electric shop UI (Phase 1). These are fixed
 * light-theme design tokens taken from the design system in the spec — the
 * shop screens deliberately stay light/minimal regardless of color scheme.
 */
export const Brand = {
  /** Main page background */
  background: '#FFFFFF',
  /** Secondary surface: cards, search bar, banners */
  surface: '#F7F7F7',
  /** Slightly deeper surface for skeletons / image placeholders */
  surfaceDeep: '#ECECEC',
  /** Primary CTA accent (lime green) */
  accent: '#D6F26A',
  /** Text/icon that sits on the accent button */
  onAccent: '#1A1A1A',
  /** Primary text */
  text: '#1A1A1A',
  /** Secondary text */
  textSecondary: '#7A7A7A',
  /** Tertiary / muted text */
  textMuted: '#9A9A9A',
  /** Success / energy-saving badge */
  successBg: '#EAF6E8',
  successText: '#3B6D11',
  /** Favorite / wishlist accent */
  favoriteBg: '#FCEBEB',
  favoriteIcon: '#D4537E',
  /** Thin divider (used sparingly) */
  divider: '#EFEFEF',
  /** Out-of-stock label */
  danger: '#D64545',
  /** Notification dot */
  notification: '#E5484D',
  /** Inactive tab icon */
  tabInactive: '#B0B0B0',
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  card: 18,
  lg: 20,
  /** pill / full round for CTA buttons */
  pill: 28,
} as const;

