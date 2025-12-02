import { StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import React from 'react'
import { typography } from '../../theme/typography'
import { colors, palette } from '../../theme/colors'


type ButtonProps = {
    title: string,
    variant?: 'primary' | 'outline' | 'danger' | 'secondary',
    size?: 'small' | 'medium' | 'large',
    leftIcon?: React.ReactNode,
    rightIcon?: React.ReactNode,
    isLoading?: boolean,
    loadingText?: string,
    [x:string]: any
}

const Button: React.FC<ButtonProps> = ({title, variant = 'primary', size = 'medium', leftIcon, rightIcon, isLoading = false, loadingText, ...rest}) => {

    const isDisabled = rest.disabled || isLoading;

  return (
    <TouchableOpacity 
        style={[styles.baseContainerStyle, styles[`${variant}Container`], styles[`${size}Container`]]} 
        disabled={isDisabled}
        {...rest}
    >
        {isLoading ? (
            <>
                <ActivityIndicator size="small" color={variant === 'outline' ? colors.light.primary : colors.light.text} />
                <Text style={[styles.baseTextStyle, styles[`${variant}Text`], styles[`${size}Text`], isDisabled && styles.disabledContainer]}>
                    {loadingText || 'Loading...'}
                </Text> 
            </>
        ) : (
            <>
                {leftIcon && <Text style={{marginRight: 8}}>{leftIcon}</Text>}
                <Text style={[styles.baseTextStyle, styles[`${variant}Text`], styles[`${size}Text`]]}>{title}</Text>
                {rightIcon && <Text style={{marginLeft: 8}}>{rightIcon}</Text>}
            </>
        )}
    </TouchableOpacity>
  )
}

export default Button

const styles = StyleSheet.create({
    baseContainerStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        flexDirection: 'row',
    },
    baseTextStyle: {
        fontSize: typography.fontSizes.md,
        fontFamily: typography.fonts.semiBold,
        fontWeight: '800'
    },

    // -primary
    primaryContainer:{
        backgroundColor: colors.light.primary
    },
    primaryText:{
        color: palette.white
    },

    // ---secondary
    secondaryContainer: {
        backgroundColor: colors.light.secondary, 
    },
    secondaryText: {
        color: palette.white, // chữ trắng
    },

    // ---outline 
    outlineContainer:{
        borderWidth: 1,
        borderColor: colors.light.primary,
        backgroundColor: 'transparent'
    },
    outlineText:{
        color: colors.light.black, // đổi màu chữ sang đen
    },

    //danger
    dangerContainer:{
        backgroundColor: colors.light.error,
    },
    dangerText:{
        color: '#FFFFFF'
    },

    //disabled
    disabledContainer:{
        opacity: 0.5,   
    },

    // ---size small
    smallContainer:{
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    smallText:{
        fontSize: typography.fontSizes.sm,
    },

    // ---size medium
    mediumContainer:{
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    mediumText:{
        fontSize: typography.fontSizes.md,
    },

    // ---size large

    largeContainer:{
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    largeText:{
        fontSize: typography.fontSizes.lg,
    },
})