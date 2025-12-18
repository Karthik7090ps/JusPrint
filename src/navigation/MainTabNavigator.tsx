import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PrintDashboard } from '../screens/printing/PrintDashboard';
import { ProjectsDashboard } from '../screens/projects/ProjectsDashboard';
import { ServicesHub } from '../screens/services/ServicesHub';
import { MarketplaceHome } from '../screens/marketplace/MarketplaceHome';
import { CommunityHub } from '../screens/community/CommunityHub';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CustomTabBarButton } from '../components/common/CustomTabBarButton';
import { View, Platform } from 'react-native';

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    // Calculate proper bottom padding for navigation bar
    const bottomPadding = Platform.OS === 'android' ? Math.max(insets.bottom, 8) : insets.bottom;

    return (
        <Tab.Navigator
            initialRouteName="Print"
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: '#F0F0F0',
                    elevation: 8,
                    height: 60 + bottomPadding,
                    paddingBottom: bottomPadding,
                    paddingTop: 6,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                },
                tabBarActiveTintColor: '#1A1A2E',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarLabelStyle: { fontWeight: '600', fontSize: 10, marginBottom: 2 },
                tabBarItemStyle: { paddingTop: 4 },
            }}
        >

            <Tab.Screen
                name="Projects"
                component={ProjectsDashboard}
                options={{
                    tabBarIcon: ({ color, size }) => <Icon name="rocket-launch" size={size} color={color} />,
                    tabBarLabel: 'Projects'
                }}
            />
            <Tab.Screen
                name="Services"
                component={ServicesHub}
                options={{
                    tabBarIcon: ({ color, size }) => <Icon name="cogs" size={size} color={color} />,
                    tabBarLabel: 'Services'
                }}
            />

            {/* Center Print Action */}
            <Tab.Screen
                name="Print"
                component={PrintDashboard}
                options={{
                    tabBarIcon: ({ focused }) => (
                        <View style={{ alignItems: 'center', justifyContent: 'center', top: 0 }}>
                            <Icon name="printer" size={28} color="white" />
                        </View>
                    ),
                    tabBarButton: (props) => <CustomTabBarButton {...props} />,
                    tabBarLabel: () => null,
                }}
            />

            <Tab.Screen
                name="Market"
                component={MarketplaceHome}
                options={{
                    tabBarIcon: ({ color, size }) => <Icon name="storefront" size={size} color={color} />,
                    tabBarLabel: 'Market'
                }}
            />
            <Tab.Screen
                name="Community"
                component={CommunityHub}
                options={{
                    tabBarIcon: ({ color, size }) => <Icon name="account-group" size={size} color={color} />,
                    tabBarLabel: 'Community'
                }}
            />

        </Tab.Navigator >
    );
};
