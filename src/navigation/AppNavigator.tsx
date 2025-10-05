import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import { SearchIcon } from '@hugeicons/core-free-icons'
import {HugeiconsIcon} from '@hugeicons/react-native';
import { textVariants } from '../theme/typography';
import { colors } from '../theme/colors';
import Button from '../components/Button/Button';
import Item from '../components/Item/Item';

const AppNavigator = () => {

  

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <HugeiconsIcon
            icon={SearchIcon}
            size={24}
            color="black"
            strokeWidth={1.5}
        />
      <Text style={styles.text}>저는</Text>

      <Button 
        title="Login" 
        variant="primary"
        size="small"
        rightIcon={<HugeiconsIcon icon={SearchIcon} size={16} color="white" strokeWidth={3} />}
      />
      <Item 
        title="Item1"
      />
    </View>
  )
}

export default AppNavigator

const styles = StyleSheet.create({
    text: textVariants.koreanHeader,
})