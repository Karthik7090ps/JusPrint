import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PrintDashboard } from '../screens/printing/PrintDashboard';
import { ProjectsDashboard } from '../screens/projects/ProjectsDashboard';
import { ServicesHub } from '../screens/services/ServicesHub';
import { MarketplaceHome } from '../screens/marketplace/MarketplaceHome';
import { CommunityHub } from '../screens/community/CommunityHub';
// Use MaterialCommunityIcons for rich icons
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from 'react-native-paper';

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
    const theme = useTheme();

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.colors.surface,
                    borderTopWidth: 0,
                    elevation: 10,
                    height: 65,
                    paddingBottom: 10,
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.secondary,
                tabBarLabelStyle: { fontWeight: '600', fontSize: 11 },
            }}
        >
            <Tab.Screen
                name="Print"
                component={PrintDashboard}
                options={{
                    tabBarIcon: ({ color, size }) => <Icon name="printer" size={size} color={color} />,
                    tabBarLabel: 'Print'
                }}
            />
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
        </Tab.Navigator>
    );
};
