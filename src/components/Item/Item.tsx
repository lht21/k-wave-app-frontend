import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { typography } from '../../theme/typography'
import { colors, palette } from '../../theme/colors'

type ItemProps = {
    title?: string;
}

const Item = ({title}: ItemProps) => {
  return (
    <TouchableOpacity style={[styles.itemContainer]}>
      <Image source={require('../../assets/icon1.png')} style={{width: 50, height: 50}} />

      
      <Text style={[styles.itemLabel]}>{title}</Text>
      
    </TouchableOpacity>
  )
}

export default Item

const styles = StyleSheet.create({
    itemContainer: {
        backgroundColor: palette.white,
        shadowColor: palette.black,
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,   
        padding: 10,
        borderRadius: 20,
        alignItems: 'center',
        width: 100,
        height: 100,
        justifyContent: 'center',
        gap: 5,
    },
    itemLabel: {
        fontFamily: typography.fonts.semiBold,
        fontSize: typography.fontSizes.sm,
        fontWeight: '800',
        color: palette.black,
    },

})