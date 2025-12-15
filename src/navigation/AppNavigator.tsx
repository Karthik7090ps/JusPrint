import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabNavigator } from './MainTabNavigator';
import { DocumentUpload } from '../screens/printing/DocumentUpload';
import { PrinterSelection } from '../screens/printing/PrinterSelection';
import { PaymentScreen } from '../screens/printing/PaymentScreen';
import { JobStatus } from '../screens/printing/JobStatus';
import { RequirementForm } from '../screens/projects/RequirementForm';
import { PCBOrderScreen } from '../screens/services/PCBOrderScreen';
import { Print3DScreen } from '../screens/services/Print3DScreen';
import { ComponentsStore } from '../screens/services/ComponentsStore';
import { ProductDetails } from '../screens/marketplace/ProductDetails';
import { SettingsScreen } from '../screens/profile/SettingsScreen';

import { SplashScreen } from '../screens/SplashScreen';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="MainTabs" component={MainTabNavigator} />
                <Stack.Screen name="DocumentUpload" component={DocumentUpload} options={{ headerShown: false }} />
                <Stack.Screen name="PrinterSelection" component={PrinterSelection} options={{ headerShown: true, title: 'Select Printer' }} />
                <Stack.Screen name="PaymentScreen" component={PaymentScreen} options={{ headerShown: true, title: 'Payment' }} />
                <Stack.Screen name="JobStatus" component={JobStatus} options={{ headerShown: true, title: 'Tracking' }} />
                <Stack.Screen name="RequirementForm" component={RequirementForm} options={{ headerShown: false }} />
                <Stack.Screen name="PCBOrder" component={PCBOrderScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Print3D" component={Print3DScreen} options={{ headerShown: false }} />
                <Stack.Screen name="ComponentsStore" component={ComponentsStore} options={{ headerShown: false }} />

                <Stack.Screen name="ProductDetails" component={ProductDetails} options={{ headerShown: false }} />
                <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};
