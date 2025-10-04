import { colors } from "./colors";
import { spacing } from "./spacing";
import { textVariants, typography } from "./typography";

const baseTheme = {
    spacing,
    typography,
    textVariants
};

export const lightTheme = {
    ...baseTheme,
    colors: colors.light,
    mode: 'light' as const
};

export const darkTheme = {
    ...baseTheme,
    colors: colors.dark,
    mode: 'dark' as const
};

export type Theme = typeof lightTheme;