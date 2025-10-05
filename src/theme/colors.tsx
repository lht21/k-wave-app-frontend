const palette = {
  primary: '#51AE77',
    secondary: '#03DAC6',
    surface: '#FFFFFF',
    error: '#B00020',
    onPrimary: '#FFFFFF',
    onSecondary: '#000000',
    onBackground: '#000000',
    onSurface: '#000000',
    onError: '#FFFFFF',
    
    gray900: '#212121',
    gray500: '#9E9E9E',
    gray100: '#F5F5F5',

    white: '#FFFFFF',
    black: '#000000',
    warning: '#FFA000',
    success: '#388E3C',
    info: '#1976D2',
};

export const colors = {
    light: {
        primary: palette.primary,
        background: palette.gray100,
        card: palette.white,
        text: palette.gray900,
        textSecondary: palette.gray500,  
        success: palette.success,
        error: palette.error,
        warning: palette.warning,
        border: palette.gray100 
    
    },
    dark: {
        primary: palette.primary,
        background: palette.black,
        card: palette.gray900,
        text: palette.white,
        textSecondary: palette.gray500,  
        success: palette.success,
        error: palette.error,
        warning: palette.warning,
        border: palette.gray900
    
    }
}