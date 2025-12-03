// src/navigation/AppNavigator.tsx (Student Navigator)
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Home01Icon,
  NewsIcon,
  Image01Icon,
  BookIcon,
  Settings02Icon,
  CircleIcon
} from '@hugeicons/core-free-icons';

import NewsScreen from '../screens/News/NewsScreen';
import LearnImageScreen from '../screens/LearnImage/LearnImageScreen';
import RoadmapScreen from '../screens/Roadmap/RoadmapScreen';
import SettingScreen from '../screens/Setting/SettingScreen';
import StdHome from '../screens/Home/StdHome';
import { palette } from '../theme/colors';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator cho student
const StudentTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icon = (() => {
            switch (route.name) {
              case 'Home':
                return focused ? Home01Icon : Home01Icon;
              case 'News':
                return focused ? NewsIcon : NewsIcon;
              case 'LearnImage':
                return focused ? Image01Icon : Image01Icon;
              case 'Roadmap':
                return focused ? BookIcon : BookIcon;
              case 'Setting':
                return focused ? Settings02Icon : Settings02Icon;
              default:
                return CircleIcon;
            }
          })();

          return <HugeiconsIcon icon={icon} size={size} color={color} strokeWidth={2} />;
        },
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.gray900,
      })}
    >
      <Tab.Screen name="Home" component={StdHome} options={{ tabBarLabel: 'Trang chủ' }} />
      <Tab.Screen name="News" component={NewsScreen} options={{ tabBarLabel: 'Tin tức' }} />
      <Tab.Screen name="LearnImage" component={LearnImageScreen} options={{ tabBarLabel: 'Học ảnh' }}/>
      <Tab.Screen name="Roadmap" component={RoadmapScreen} options={{ tabBarLabel: 'Lộ trình' }} />
      <Tab.Screen name="Setting" component={SettingScreen} options={{ tabBarLabel: 'Cài đặt' }} />
    </Tab.Navigator>
  );
};

// Stack Navigator cho student
const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="StudentMain" 
        component={StudentTabs}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;