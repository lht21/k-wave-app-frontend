import { StatusBar } from 'expo-status-bar';

import { ThemeProvider } from 'styled-components/native';
import AppNavigator from './src/navigation/AppNavigator';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text } from 'react-native';

export default function App() {

  
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>

   
    
  );
}

