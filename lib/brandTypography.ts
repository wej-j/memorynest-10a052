import { StyleSheet } from 'react-native';

/**
 * Canonical font families for Remory.
 * Fredoka is reserved for the brand wordmark; interface copy stays in Inter.
 */
export const brandFontFamilies = {
  wordmark: 'Fredoka_700Bold',
  uiRegular: 'Inter_400Regular',
  uiMedium: 'Inter_500Medium',
  uiSemibold: 'Inter_600SemiBold',
  uiBold: 'Inter_700Bold',
} as const;

/** Shared typography roles for brand-led screens and components. */
export const brandTypography = StyleSheet.create({
  wordmark: {
    fontFamily: brandFontFamilies.wordmark,
    fontWeight: '700',
    letterSpacing: -1.5,
  },
  tagline: {
    fontFamily: brandFontFamilies.uiMedium,
    letterSpacing: 0.2,
  },
  ui: {
    fontFamily: brandFontFamilies.uiRegular,
  },
  uiMedium: {
    fontFamily: brandFontFamilies.uiMedium,
  },
  uiSemibold: {
    fontFamily: brandFontFamilies.uiSemibold,
  },
  uiBold: {
    fontFamily: brandFontFamilies.uiBold,
  },
});
