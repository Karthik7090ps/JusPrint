import { MD3LightTheme as DefaultTheme, configureFonts } from 'react-native-paper';
import { colors } from './colors';

// Define custom font config if needed (using system defaults for now but bolding headers)
const fontConfig = {
    fontFamily: 'System',
};

export const theme = {
    ...DefaultTheme,
    roundness: 12, // More rounded corners (Zepto style)
    colors: {
        ...DefaultTheme.colors,
        primary: colors.primary,
        onPrimary: colors.textInverse,
        primaryContainer: colors.primaryLight,
        onPrimaryContainer: colors.primaryDark,

        secondary: colors.secondary,
        onSecondary: colors.textInverse,
        secondaryContainer: colors.secondaryLight,
        onSecondaryContainer: colors.secondary,

        background: colors.background,
        surface: colors.surface,
        surfaceVariant: colors.surfaceVariant, // Cards
        onSurface: colors.textPrimary,
        onSurfaceVariant: colors.textSecondary,

        error: colors.error,

        // Custom mappings
        elevation: {
            level0: 'transparent',
            level1: colors.surface,
            level2: colors.surface,
            level3: colors.surface,
            level4: colors.surface,
            level5: colors.surface,
        },
    },
    animation: {
        scale: 1.0,
    },
};
