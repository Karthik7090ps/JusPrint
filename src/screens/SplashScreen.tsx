import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { checkStoredAuth, setAuthenticated } from '../store/slices/authSlice';

export const SplashScreen = ({ navigation }: { navigation: any }) => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const { isLoading, isAuthenticated } = useAppSelector(state => state.auth);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        // Start animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                useNativeDriver: true,
            })
        ]).start();

        // Check for stored authentication
        dispatch(checkStoredAuth());

        // For demo: auto-authenticate after splash (remove in production)
        dispatch(setAuthenticated(true));
    }, [dispatch, fadeAnim, scaleAnim]);

    useEffect(() => {
        // Navigate after auth check completes
        if (!isLoading) {
            const timer = setTimeout(() => {
                // In production: navigate based on isAuthenticated
                // For demo: always go to MainTabs
                navigation.replace('MainTabs');
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isLoading, isAuthenticated, navigation]);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                <View style={[styles.iconBox, { backgroundColor: theme.colors.primary }]}>
                    <Icon name="printer" size={60} color="white" />
                </View>
                <Text variant="displaySmall" style={{ fontWeight: 'bold', marginTop: 16, color: theme.colors.primary }}>
                    JusPrint
                </Text>
                <Text variant="titleMedium" style={{ color: theme.colors.secondary, marginTop: 8 }}>
                    The Student Super App
                </Text>
            </Animated.View>

            {/* Loading indicator while checking auth */}
            {isLoading && (
                <ActivityIndicator
                    animating={true}
                    size="small"
                    color={theme.colors.primary}
                    style={{ marginTop: 24 }}
                />
            )}

            <View style={styles.footer}>
                <Text variant="bodySmall" style={{ color: '#999' }}>Powered by JusPrint Tech</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    iconBox: {
        width: 100,
        height: 100,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: 'orange',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
    }
});
