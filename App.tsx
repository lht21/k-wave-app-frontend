// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { FavoriteNewsProvider } from './src/contexts/FavoriteNewsContext';
import AppNavigator from './src/navigation/AppNavigator';
import StdNavigator from './src/navigation/StdNavigator';
import RootNavigator from './src/navigation/RootNavigator'; // Import RootNavigator mới

const App = () => {
  return (
    <AuthProvider>
      <FavoriteNewsProvider>
        <NavigationContainer>
          {/* <AppNavigator /> */}
          <StdNavigator />
        </NavigationContainer>
      </FavoriteNewsProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;