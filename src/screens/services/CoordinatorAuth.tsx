import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Card, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

export const CoordinatorAuth = ({ navigation }: { navigation: any }) => {
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        college: '',
        clubName: '',
        role: '',
        otp: '',
    });
    const [step, setStep] = useState<'details' | 'otp'>('details');
    const [loading, setLoading] = useState(false);

    const handleSendOTP = async () => {
        setLoading(true);
        // TODO: API call to send OTP
        setTimeout(() => {
            setLoading(false);
            setStep('otp');
        }, 1500);
    };

    const handleVerifyOTP = async () => {
        setLoading(true);
        // TODO: API call to verify OTP and login
        setTimeout(() => {
            setLoading(false);
            navigation.navigate('CoordinatorDashboard');
        }, 1500);
    };

    return (
        <View style={styles.container}>
            {/* Header - Minimalist */}
            <View style={styles.header}>
                <Icon name="account-tie" size={64} color="white" />
                <Text style={styles.headerTitle}>Coordinator Portal</Text>
                <Text style={styles.headerSubtitle}>
                    {mode === 'login' ? 'Welcome back!' : 'Create your coordinator account'}
                </Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Card style={styles.formCard}>
                        <Card.Content>
                            {/* Mode Toggle */}
                            <View style={styles.modeToggle}>
                                <Button
                                    mode={mode === 'login' ? 'contained' : 'outlined'}
                                    onPress={() => setMode('login')}
                                    style={styles.modeButton}
                                    labelStyle={{ fontSize: 13 }}
                                >
                                    Login
                                </Button>
                                <Button
                                    mode={mode === 'signup' ? 'contained' : 'outlined'}
                                    onPress={() => setMode('signup')}
                                    style={styles.modeButton}
                                    labelStyle={{ fontSize: 13 }}
                                >
                                    Sign Up
                                </Button>
                            </View>

                            {step === 'details' ? (
                                <>
                                    {mode === 'signup' && (
                                        <>
                                            <TextInput
                                                label="Full Name *"
                                                value={formData.name}
                                                onChangeText={(text) => setFormData({ ...formData, name: text })}
                                                style={styles.input}
                                                left={<TextInput.Icon icon="account" />}
                                                mode="outlined"
                                            />
                                            <TextInput
                                                label="College/University *"
                                                value={formData.college}
                                                onChangeText={(text) => setFormData({ ...formData, college: text })}
                                                style={styles.input}
                                                left={<TextInput.Icon icon="school" />}
                                                mode="outlined"
                                            />
                                            <TextInput
                                                label="Club/Organization Name *"
                                                value={formData.clubName}
                                                onChangeText={(text) => setFormData({ ...formData, clubName: text })}
                                                style={styles.input}
                                                left={<TextInput.Icon icon="account-group" />}
                                                mode="outlined"
                                            />
                                            <TextInput
                                                label="Your Role *"
                                                value={formData.role}
                                                onChangeText={(text) => setFormData({ ...formData, role: text })}
                                                style={styles.input}
                                                left={<TextInput.Icon icon="badge-account" />}
                                                mode="outlined"
                                                placeholder="e.g., President, Event Head"
                                            />
                                        </>
                                    )}

                                    <TextInput
                                        label="Email Address *"
                                        value={formData.email}
                                        onChangeText={(text) => setFormData({ ...formData, email: text })}
                                        style={styles.input}
                                        left={<TextInput.Icon icon="email" />}
                                        mode="outlined"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />

                                    <TextInput
                                        label="Phone Number *"
                                        value={formData.phone}
                                        onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                        style={styles.input}
                                        left={<TextInput.Icon icon="phone" />}
                                        mode="outlined"
                                        keyboardType="phone-pad"
                                    />

                                    {mode === 'signup' && (
                                        <View style={styles.infoBox}>
                                            <Icon name="information" size={20} color="#6366F1" />
                                            <Text style={styles.infoText}>
                                                We'll verify your coordinator status before approving your account
                                            </Text>
                                        </View>
                                    )}

                                    <Button
                                        mode="contained"
                                        onPress={handleSendOTP}
                                        style={styles.submitButton}
                                        loading={loading}
                                        disabled={loading}
                                        icon="send"
                                    >
                                        Send OTP
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.otpTitle}>Enter OTP</Text>
                                    <Text style={styles.otpSubtitle}>
                                        We sent a 6-digit code to {formData.email}
                                    </Text>

                                    <TextInput
                                        label="6-Digit OTP"
                                        value={formData.otp}
                                        onChangeText={(text) => setFormData({ ...formData, otp: text })}
                                        style={styles.input}
                                        left={<TextInput.Icon icon="lock" />}
                                        mode="outlined"
                                        keyboardType="number-pad"
                                        maxLength={6}
                                    />

                                    <Button
                                        mode="contained"
                                        onPress={handleVerifyOTP}
                                        style={styles.submitButton}
                                        loading={loading}
                                        disabled={loading || formData.otp.length !== 6}
                                        icon="check-circle"
                                    >
                                        Verify & Continue
                                    </Button>

                                    <Button
                                        mode="text"
                                        onPress={() => setStep('details')}
                                        style={{ marginTop: 8 }}
                                    >
                                        Change Email
                                    </Button>

                                    <Button
                                        mode="text"
                                        onPress={handleSendOTP}
                                        disabled={loading}
                                    >
                                        Resend OTP
                                    </Button>
                                </>
                            )}
                        </Card.Content>
                    </Card>

                    {/* Benefits */}
                    <View style={styles.benefitsSection}>
                        <Text style={styles.benefitsTitle}>Why use CampusConnect?</Text>
                        {[
                            'Create unlimited events',
                            'Custom registration forms',
                            'Real-time analytics',
                            'Instant payment processing',
                            'Export data to Excel',
                            'QR code check-in',
                        ].map((benefit, index) => (
                            <View key={index} style={styles.benefitItem}>
                                <Icon name="check-circle" size={20} color="#10B981" />
                                <Text style={styles.benefitText}>{benefit}</Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F5F9',
    },
    header: {
        padding: 32,
        paddingTop: 48,
        alignItems: 'center',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        backgroundColor: '#1A1A2E',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 16,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    formCard: {
        borderRadius: 20,
        backgroundColor: 'white',
        marginBottom: 16,
    },
    modeToggle: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 24,
    },
    modeButton: {
        flex: 1,
    },
    input: {
        marginBottom: 16,
        backgroundColor: 'white',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#6366F115',
        padding: 12,
        borderRadius: 12,
        marginBottom: 16,
        gap: 8,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
    },
    submitButton: {
        marginTop: 8,
        paddingVertical: 6,
    },
    otpTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#1A1A2E',
    },
    otpSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
    },
    benefitsSection: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 20,
    },
    benefitsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#1A1A2E',
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    benefitText: {
        fontSize: 14,
        color: '#666',
    },
});
