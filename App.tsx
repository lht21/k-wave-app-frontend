import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import { darkTheme, lightTheme } from './src/theme';
import { ThemeProvider } from 'styled-components/native';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {

  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  return (
    <ThemeProvider theme={theme}>
      <AppNavigator />
    </ThemeProvider>
  );
}

