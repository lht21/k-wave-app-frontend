// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { FavoriteNewsProvider } from './src/contexts/FavoriteNewsContext';
import RootNavigator from './src/navigation/RootNavigator';

const App = () => {
  return (
    <AuthProvider>
      <FavoriteNewsProvider>
        <NavigationContainer>
          {/* Chỉ render duy nhất RootNavigator */}
          <RootNavigator />
        </NavigationContainer>
      </FavoriteNewsProvider>
    </AuthProvider>
  );
};

export default App;