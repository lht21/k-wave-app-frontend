import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SearchIcon } from '@hugeicons/core-free-icons'
import {HugeiconsIcon} from '@hugeicons/react-native';
import { textVariants } from '../theme/typography';
import { colors } from '../theme/colors';

const AppNavigator = () => {
  return (
    <View>
        <HugeiconsIcon
            icon={SearchIcon}
            size={24}
            color="black"
            strokeWidth={1.5}
        />
      <Text style={styles.text}>저는</Text>
    </View>
  )
}

export default AppNavigator

const styles = StyleSheet.create({
    text: textVariants.koreanHeader,
})