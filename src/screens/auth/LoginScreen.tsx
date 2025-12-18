import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import { Text, TextInput, Button, useTheme, ActivityIndicator, Snackbar, Portal } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { loginUser, updateName, updateUserName } from '../../store/slices/authSlice';
import { authService } from '../../services/authService';
import { ApiErrorType } from '../../config/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const LoginScreen = () => {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Enhanced error state
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [errorType, setErrorType] = useState<ApiErrorType | null>(null);

    // Animations
    const fadeAnim = useState(new Animated.Value(0))[0];
    const slideAnim = useState(new Animated.Value(20))[0];

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]).start();
    }, []);

    const showError = (message: string, type?: ApiErrorType) => {
        setErrorMsg(message);
        setErrorType(type || null);
    };

    const handleSendOTP = async () => {
        if (!name.trim()) {
            showError('Please enter your full name');
            return;
        }
        if (!email.trim()) {
            showError('Please enter your email');
            return;
        }

        setIsLoading(true);
        setErrorMsg(null);

        try {
            const result = await authService.sendOTP(email);

            if (result.success) {
                setIsOtpSent(true);
                showError('✅ OTP sent successfully! Check your email.'); // Success message
            } else {
                showError(result.error || 'Failed to send OTP', result.errorType);
            }
        } catch (error: any) {
            showError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length !== 6) {
            showError('Please enter a valid 6-digit OTP');
            return;
        }

        setIsLoading(true);
        setErrorMsg(null);

        try {
            const result = await authService.verifyOTP(email, otp, name);

            if (result.success && result.userId && result.token && result.refreshToken) {
                if (result.name) {
                    dispatch(updateUserName(result.name));
                }

                await dispatch(loginUser({
                    userId: result.userId,
                    accessToken: result.token,
                    refreshToken: result.refreshToken,
                })).unwrap();
            } else {
                showError(result.error || 'Invalid OTP', result.errorType);
            }
        } catch (error: any) {
            showError('Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    // Determine Snackbar style based on error type
    const getSnackbarStyle = () => {
        if (errorMsg?.startsWith('✅')) {
            return { backgroundColor: '#2ECC71' }; // Success green
        }

        if (errorType === ApiErrorType.NETWORK_ERROR) {
            return { backgroundColor: '#E74C3C' }; // Network error red
        }

        if (errorType === ApiErrorType.TIMEOUT_ERROR) {
            return { backgroundColor: '#F39C12' }; // Timeout orange
        }

        return { backgroundColor: '#323232' }; // Default dark
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <Animated.View style={[styles.headerContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <View style={[styles.logoPlaceholder, { backgroundColor: theme.colors.primary }]}>
                        <Text style={styles.logoText}>JP</Text>
                    </View>
                    <Text variant="headlineMedium" style={styles.title}>Welcome to JusPrint</Text>
                    <Text variant="bodyMedium" style={styles.subtitle}>
                        {isOtpSent ? '✉️ Verification code sent!' : 'Fastest way to get your documents printed'}
                    </Text>
                </Animated.View>

                {/* Form */}
                <Animated.View style={[styles.formContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    {!isOtpSent ? (
                        <>
                            <TextInput
                                label="Full Name"
                                value={name}
                                onChangeText={setName}
                                mode="outlined"
                                style={styles.input}
                                left={<TextInput.Icon icon="account-outline" />}
                                outlineColor="#E0E0E0"
                                activeOutlineColor={theme.colors.primary}
                            />
                            <TextInput
                                label="Email Address"
                                value={email}
                                onChangeText={setEmail}
                                mode="outlined"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                style={styles.input}
                                left={<TextInput.Icon icon="email-outline" />}
                                outlineColor="#E0E0E0"
                                activeOutlineColor={theme.colors.primary}
                            />
                            <Button
                                mode="contained"
                                onPress={handleSendOTP}
                                loading={isLoading}
                                disabled={isLoading}
                                style={styles.button}
                                contentStyle={styles.buttonContent}
                            >
                                Get OTP
                            </Button>
                        </>
                    ) : (
                        <>
                            <View style={[styles.infoBox, { backgroundColor: '#E8F5E9' }]}>
                                <Icon name="check-circle-outline" size={20} color="#4CAF50" />
                                <Text style={[styles.infoText, { color: '#2E7D32' }]}>
                                    The OTP has been sent to {email}
                                </Text>
                            </View>
                            <TextInput
                                label="6-Digit OTP"
                                value={otp}
                                onChangeText={setOtp}
                                mode="outlined"
                                keyboardType="number-pad"
                                style={styles.input}
                                maxLength={6}
                                left={<TextInput.Icon icon="numeric-6-box-outline" />}
                                outlineColor="#E0E0E0"
                                activeOutlineColor={theme.colors.primary}
                            />
                            <Button
                                mode="contained"
                                onPress={handleVerifyOTP}
                                loading={isLoading}
                                disabled={isLoading}
                                style={styles.button}
                                contentStyle={styles.buttonContent}
                            >
                                Verify & Login
                            </Button>
                            <Button mode="text" onPress={() => setIsOtpSent(false)} style={styles.textButton} disabled={isLoading}>
                                Change Details
                            </Button>
                        </>
                    )}
                </Animated.View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text variant="bodySmall" style={styles.footerText}>By continuing, you agree to JusPrint's</Text>
                    <View style={styles.footerLinks}>
                        <Text variant="bodySmall" style={styles.link}>Terms of Service</Text>
                        <Text variant="bodySmall" style={styles.footerText}> and </Text>
                        <Text variant="bodySmall" style={styles.link}>Privacy Policy</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Enhanced Snackbar with styling based on error type */}
            <Portal>
                <Snackbar
                    visible={!!errorMsg}
                    onDismiss={() => setErrorMsg(null)}
                    duration={5000}
                    action={{
                        label: 'OK',
                        onPress: () => setErrorMsg(null),
                    }}
                    style={getSnackbarStyle()}
                >
                    {errorMsg}
                </Snackbar>
            </Portal>
        </KeyboardAvoidingView>
    );
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 80 : 60,
        paddingBottom: 40,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logoPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    logoText: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: 'bold',
    },
    title: {
        fontWeight: 'bold',
        color: '#1A1A2E',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        color: '#666666',
        textAlign: 'center',
    },
    formContainer: {
        width: '100%',
        marginBottom: 32,
    },
    input: {
        marginBottom: 16,
        backgroundColor: '#FFFFFF',
    },
    button: {
        marginTop: 8,
        borderRadius: 12,
        elevation: 0,
    },
    buttonContent: {
        height: 56,
    },
    textButton: {
        marginTop: 16,
    },
    footer: {
        marginTop: 'auto',
        alignItems: 'center',
    },
    footerText: {
        color: '#999999',
    },
    footerLinks: {
        flexDirection: 'row',
        marginTop: 4,
    },
    link: {
        color: '#6C63FF',
        fontWeight: '600',
    },
    snackbar: {
        backgroundColor: '#323232',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        gap: 12,
    },
    infoText: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
});
