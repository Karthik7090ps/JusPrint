import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PrintDashboard } from '../screens/printing/PrintDashboard';
import { ProjectsDashboard } from '../screens/projects/ProjectsDashboard';
import { ServicesHub } from '../screens/services/ServicesHub';
import { MarketplaceHome } from '../screens/marketplace/MarketplaceHome';
import { CommunityHub } from '../screens/community/CommunityHub';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { colors } from '../theme/colors';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { useEffect } from 'react';

const Tab = createBottomTabNavigator();

// Simple animated icon component
const TabIcon = ({ name, color, focused }: { name: string; color: string; focused: boolean }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 1, {
      damping: 15,
      stiffness: 200,
    });
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Icon name={name} size={24} color={color} />
    </Animated.View>
  );
};

export const MainTabNavigator = () => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === 'android' ? Math.max(insets.bottom, 8) : insets.bottom;

  return (
    <Tab.Navigator
      initialRouteName="Print"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 55 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          marginBottom: 2,
        },
        tabBarItemStyle: {
          paddingTop: 4,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Print"
        component={PrintDashboard}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="printer" color={color} focused={focused} />
          ),
          tabBarLabel: 'Print',
        }}
      />

      <Tab.Screen
        name="Projects"
        component={ProjectsDashboard}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="briefcase" color={color} focused={focused} />
          ),
          tabBarLabel: 'Projects',
        }}
      />

      <Tab.Screen
        name="Market"
        component={MarketplaceHome}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="shopping" color={color} focused={focused} />
          ),
          tabBarLabel: 'Market',
        }}
      />

      <Tab.Screen
        name="Services"
        component={ServicesHub}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="tools" color={color} focused={focused} />
          ),
          tabBarLabel: 'Services',
        }}
      />

      <Tab.Screen
        name="Community"
        component={CommunityHub}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="account-group" color={color} focused={focused} />
          ),
          tabBarLabel: 'Community',
        }}
      />
    </Tab.Navigator>
  );
};
