import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
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
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SplashScreen } from '../screens/SplashScreen';

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { checkStoredAuth } from '../store/slices/authSlice';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        dispatch(checkStoredAuth());
    }, [dispatch]);

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isLoading ? (
                    <Stack.Screen name="Splash" component={SplashScreen} />
                ) : !isAuthenticated ? (
                    <Stack.Screen name="Login" component={LoginScreen} />
                ) : (
                    <>
                        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
                        <Stack.Screen name="DocumentUpload" component={DocumentUpload} options={{ headerShown: false }} />
                        <Stack.Screen name="PrinterSelection" component={PrinterSelection} options={{ headerShown: true, title: 'Select Printer' }} />
                        <Stack.Screen name="PaymentScreen" component={PaymentScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="JobStatus" component={JobStatus} options={{ headerShown: false }} />
                        <Stack.Screen name="RequirementForm" component={RequirementForm} options={{ headerShown: false }} />
                        <Stack.Screen name="PCBOrder" component={PCBOrderScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Print3D" component={Print3DScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="ComponentsStore" component={ComponentsStore} options={{ headerShown: false }} />
                        <Stack.Screen name="ProductDetails" component={ProductDetails} options={{ headerShown: false }} />
                        <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
