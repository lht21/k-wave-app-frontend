export const palette = {
  primary: '#269a56ff',
secondary: '#A1BC98' ,// cam nhạt, nổi bật với xanh lá
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

    blue: '#2962FF',
    orange: '#FF5722',
    purple: '#6200EE',
    white: '#FFFFFF',
    black: '#000000',
    warning: '#FFA000',
    success: '#388E3C',
    info: '#1976D2',
};

export const colors = {
    light: {
        primary: palette.primary,
        secondary: palette.secondary, 
        background: palette.gray100,
        card: palette.white,
        text: palette.gray900,
        textSecondary: palette.gray500,  
        success: palette.success,
        error: palette.error,
        warning: palette.warning,
        border: palette.gray100,
        
        gray900: palette.gray900,
        gray100: palette.gray100,
        gray500: palette.gray500,  
        white: palette.white,   
        black: palette.black,
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