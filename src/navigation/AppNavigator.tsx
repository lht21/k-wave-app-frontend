import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HugeiconsIcon } from '@hugeicons/react-native'; // 1. Import component chính

// 2. Import TỪNG icon bạn cần sử dụng (stroke và solid)
import {
  Home01Icon,
  NewsIcon,
  Image01Icon,
  BookIcon,
  Settings02Icon,
  CircleIcon // Icon mặc định
} from '@hugeicons/core-free-icons';

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
          // 3. Thay đổi logic: switch/case sẽ trả về đối tượng icon thay vì string
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
                return CircleIcon; // Trả về một icon mặc định đã import
            }
          })();

          // 4. Sử dụng component HugeiconsIcon và truyền đối tượng icon vào prop `icon`
          return <HugeiconsIcon icon={icon} size={size} color={color} strokeWidth={2} />;
        },
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.gray900,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Trang chủ' }} />
      <Tab.Screen name="News" component={NewsScreen} options={{ tabBarLabel: 'Tin tức' }} />
      <Tab.Screen name="LearnImage" component={LearnImageScreen} options={{ tabBarLabel: 'Học ảnh' }}/>
      <Tab.Screen name="Roadmap" component={RoadmapScreen} options={{ tabBarLabel: 'Lộ trình' }} />
      <Tab.Screen name="Setting" component={SettingScreen} options={{ tabBarLabel: 'Cài đặt' }} />
    </Tab.Navigator>
  );
};

export default AppNavigator;