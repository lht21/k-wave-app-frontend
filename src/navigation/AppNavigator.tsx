import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import NewsScreen from '../screens/News/NewsScreen';
import LearnImageScreen from '../screens/LearnImage/LearnImageScreen';
import RoadmapScreen from '../screens/Roadmap/RoadmapScreen';
import SettingScreen from '../screens/Setting/SettingScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import { palette } from '../theme/colors';



const Tab = createBottomTabNavigator();

const AppNavigator = () => {

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const name = (() => {
            switch (route.name) {
              case 'Home':
                return focused ? 'home' : 'home-outline';
              case 'News':
                return focused ? 'newspaper' : 'newspaper-outline';
              case 'LearnImage':
                return focused ? 'image' : 'image-outline';
              case 'Roadmap':
                return focused ? 'book' : 'book-outline';
              case 'Setting':
                return focused ? 'settings' : 'settings-outline';
              default:
                return 'ellipse';
            }
          })();
          return <Ionicons name={name} size={size} color={color} />;
        },
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.gray900,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="News" component={NewsScreen} />
      <Tab.Screen name="LearnImage" component={LearnImageScreen} />
      <Tab.Screen name="Roadmap" component={RoadmapScreen} />
      <Tab.Screen name="Setting" component={SettingScreen} />
    </Tab.Navigator>
  )
}

export default AppNavigator