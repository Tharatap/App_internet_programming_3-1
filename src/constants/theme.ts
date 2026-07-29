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
 * Brand palette for the Chaje Electric shop UI — "cozy pixel game" theme
 * (converted from the Claude Design mockup in `16-bit pixel theme conversion/`).
 * Warm cream background, thick dark-brown pixel borders, hard offset shadows
 * (no blur), lime-green CTA kept from the original minimal theme.
 */
export const Brand = {
  /** Main page background — warm cream */
  background: '#FDF3DC',
  /** Card / panel surface (near-white, sits on top of the cream background) */
  surface: '#FFFDF5',
  /** Slightly deeper surface for skeletons / image placeholders */
  surfaceDeep: '#F5EDD8',
  /** Primary CTA accent (lime green) — unchanged from the original theme */
  accent: '#D6F26A',
  /** Text/icon that sits on the accent button */
  onAccent: '#2B2118',
  /** Primary text (warm near-black) */
  text: '#2B2118',
  /** Secondary text */
  textSecondary: '#6B5C42',
  /** Tertiary / muted text */
  textMuted: '#9A8B70',
  /** Success / energy-saving badge */
  successBg: '#7BC96F',
  successText: '#2B2118',
  /** Favorite / wishlist accent */
  favoriteBg: '#FFD6E5',
  favoriteIcon: '#FF7BA9',
  /** Pixel border color — used everywhere instead of soft dividers */
  divider: '#2B2118',
  /** Out-of-stock / destructive label */
  danger: '#C2456B',
  /** Notification dot */
  notification: '#FF6B8A',
  /** Inactive tab icon */
  tabInactive: '#A2937A',
  /** Header / hero surfaces */
  skyBlue: '#BFE6F7',
  saleBg: '#FFB4C6',
  coin: '#FFC94D',
  orange: '#FF9A3D',
  mint: '#C9E4C5',
  tan: '#FFDDA8',
} as const;

/** Pastel background per product category chip (matches the mockup's category tiles). */
export const CategoryPalette = [
  '#BFE6F7',
  '#FFD6E5',
  '#FFDDA8',
  '#D6F26A',
  '#C9E4C5',
] as const;

/**
 * Radii are intentionally 0 across the board — the pixel theme uses sharp
 * corners everywhere (circles are done with borderRadius: size / 2 directly
 * on avatars/dots, not via this token).
 */
export const Radius = {
  sm: 0,
  md: 0,
  card: 0,
  lg: 0,
  pill: 0,
} as const;

/** Pixel border width used on cards, buttons, and panels. */
export const PixelBorder = {
  thin: 2,
  base: 3,
  thick: 4,
} as const;

/** Hard (non-blurred) drop-shadow offset used instead of soft shadows. */
export const PixelShadow = {
  sm: 3,
  md: 5,
  lg: 8,
} as const;

/**
 * Font families loaded via @expo-google-fonts/* in the root layout
 * (see `useFonts` in `src/app/_layout.tsx`). Fall back to system fonts until
 * the pixel/Kanit/Noto Sans Thai fonts finish loading.
 */
export const PixelFonts = {
  /** Chunky pixel display font — headings, prices, badges (Latin/numerals only). */
  pixel: 'PressStart2P_400Regular',
  /** Thai-capable heading font. */
  headingRegular: 'Kanit_400Regular',
  headingMedium: 'Kanit_500Medium',
  headingSemiBold: 'Kanit_600SemiBold',
  headingBold: 'Kanit_700Bold',
  /** Thai-capable body font for longer copy. */
  bodyRegular: 'NotoSansThai_400Regular',
  bodyMedium: 'NotoSansThai_500Medium',
  bodySemiBold: 'NotoSansThai_600SemiBold',
} as const;
