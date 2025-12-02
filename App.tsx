import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { FavoriteNewsProvider } from './src/contexts/FavoriteNewsContext';
import AppNavigator from './src/navigation/AppNavigator';
import StdNavigator from './src/navigation/StdNavigator';

const App = () => {
  return (
    <AuthProvider>
      <FavoriteNewsProvider>
        <NavigationContainer>
          {/* <AppNavigator /> */}
          <StdNavigator />
        </NavigationContainer>
      </FavoriteNewsProvider>
    </AuthProvider>
  );
};

export default App;