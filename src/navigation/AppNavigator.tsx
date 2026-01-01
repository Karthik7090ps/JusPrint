import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { SplashScreen } from '../screens/SplashScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { RootStackParamList } from './types';
import { useAppDispatch } from '../store/hooks';
import { checkStoredAuth } from '../store/slices/authSlice';
import { useWebSocket } from '../hooks/useWebSocket';

// Import missing screens
import { LoginScreen } from '../screens/auth/LoginScreen';
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

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const dispatch = useAppDispatch();
  useWebSocket();

  useEffect(() => {
    dispatch(checkStoredAuth());
  }, [dispatch]);

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        
        {/* Printing Flow */}
        <Stack.Screen name="DocumentUpload" component={DocumentUpload} />
        <Stack.Screen name="PrinterSelection" component={PrinterSelection} />
        <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
        <Stack.Screen name="JobStatus" component={JobStatus} />

        {/* Services & Projects */}
        <Stack.Screen name="RequirementForm" component={RequirementForm} />
        <Stack.Screen name="PCBOrder" component={PCBOrderScreen} />
        <Stack.Screen name="Print3D" component={Print3DScreen} />
        <Stack.Screen name="ComponentsStore" component={ComponentsStore} />

        {/* Marketplace */}
        <Stack.Screen name="ProductDetails" component={ProductDetails} />

        {/* Profile */}
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
