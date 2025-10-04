import { TextStyle } from  'react-native';

export const typography = {
    fonts: {
        regular: 'Roboto-Regular',
        bold: 'Roboto-Bold',
        semiBold: 'Roboto-SemiBold',
        koreanRegular: 'NotoSansKR-Regular',
        koreanBold: 'NotoSansKR-Bold'
    },
    fontSizes: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 20,
        xl: 24
    },
    fontWeights: {
        regular: '400',
        bold: '700',
        semiBold: '600'
    }
};

export const textVariants = {
    header: {
        fontFamily: typography.fonts.bold,  
        fontSize: typography.fontSizes.xl
    } as TextStyle,
    subheader: {
        fontFamily: typography.fonts.semiBold,
        fontSize: typography.fontSizes.lg
    } as TextStyle,
    body: {
        fontFamily: typography.fonts.regular,
        fontSize: typography.fontSizes.md
    } as TextStyle,
    caption: {
        fontFamily: typography.fonts.regular,
        fontSize: typography.fontSizes.sm
    } as TextStyle,
    button: {
        fontFamily: typography.fonts.semiBold,
        fontSize: typography.fontSizes.md
    } as TextStyle,
    koreanBody: {
        fontFamily: typography.fonts.koreanRegular,
        fontSize: typography.fontSizes.md
    } as TextStyle,
    koreanHeader: {
        fontFamily: typography.fonts.koreanBold,
        fontSize: typography.fontSizes.xl
    } as TextStyle
};