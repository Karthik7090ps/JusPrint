import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, PanResponder, TouchableOpacity } from 'react-native';
import { Text, Button, Card, useTheme, Divider, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppHeader } from '../../components/common/AppHeader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.6;

export const PaymentScreen = ({ navigation, route }: { navigation: any; route?: any }) => {
    const theme = useTheme();
    const { document, settings, pricing } = route?.params || {
        document: { name: 'Document.pdf', pages: 10 },
        settings: { copies: 1, colorMode: 'bw', sides: 'single' },
        pricing: { total: 20, currency: '₹' },
    };

    const [isConfirming, setIsConfirming] = useState(false);
    const [isPaid, setIsPaid] = useState(false);
    const slideAnim = useRef(new Animated.Value(0)).current;

    const totalAmount = pricing.total * (settings?.copies || 1);

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
            if (gestureState.dx > 0) {
                slideAnim.setValue(Math.min(gestureState.dx, SWIPE_THRESHOLD));
            }
        },
        onPanResponderRelease: (_, gestureState) => {
            if (gestureState.dx >= SWIPE_THRESHOLD) {
                // Confirmed!
                Animated.timing(slideAnim, {
                    toValue: SCREEN_WIDTH - 80,
                    duration: 200,
                    useNativeDriver: true,
                }).start(() => {
                    setIsPaid(true);
                    // Navigate to status after delay
                    setTimeout(() => {
                        navigation.replace('JobStatus', { document, settings });
                    }, 1000);
                });
            } else {
                // Reset
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                }).start();
            }
        },
    });

    const slideProgress = slideAnim.interpolate({
        inputRange: [0, SWIPE_THRESHOLD],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const backgroundColor = slideProgress.interpolate({
        inputRange: [0, 1],
        outputRange: ['#F0F0F0', '#4ECDC4'],
    });

    return (
        <View style={styles.container}>
            <AppHeader showLogo={false} title="Confirm Payment" showBack={true} showWallet={true} />

            <View style={styles.content}>
                {/* Order Summary */}
                <Card style={styles.summaryCard}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.sectionTitle}>Order Summary</Text>

                        <View style={styles.row}>
                            <Text variant="bodyMedium">Document</Text>
                            <Text variant="bodyMedium" style={{ fontWeight: '500' }}>{document?.name}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text variant="bodyMedium">Pages</Text>
                            <Text variant="bodyMedium">{settings?.totalPages || 10} × {settings?.copies || 1}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text variant="bodyMedium">Print Type</Text>
                            <Text variant="bodyMedium">{settings?.colorMode === 'color' ? 'Color' : 'Black & White'}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text variant="bodyMedium">Sides</Text>
                            <Text variant="bodyMedium">{settings?.sides === 'double' ? 'Double-sided' : 'Single-sided'}</Text>
                        </View>

                        <Divider style={{ marginVertical: 16 }} />

                        <View style={styles.totalRow}>
                            <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>Total</Text>
                            <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                                {pricing?.currency}{totalAmount}
                            </Text>
                        </View>
                    </Card.Content>
                </Card>

                {/* Payment Method */}
                <Card style={styles.paymentCard}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.sectionTitle}>Pay with</Text>

                        <TouchableOpacity style={styles.paymentOption}>
                            <View style={styles.paymentIcon}>
                                <Icon name="wallet" size={24} color={theme.colors.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>JusPrint Wallet</Text>
                                <Text variant="bodySmall" style={{ color: '#666' }}>Balance: ₹450</Text>
                            </View>
                            <Icon name="check-circle" size={24} color={theme.colors.primary} />
                        </TouchableOpacity>
                    </Card.Content>
                </Card>
            </View>

            {/* Slide to Confirm - Zomato Style */}
            <View style={styles.bottomSection}>
                {isPaid ? (
                    <View style={styles.successBanner}>
                        <Icon name="check-circle" size={24} color="white" />
                        <Text style={styles.successText}>Payment Successful!</Text>
                    </View>
                ) : (
                    <View style={styles.sliderContainer}>
                        <Animated.View style={[styles.sliderTrack, { backgroundColor }]}>
                            <Text style={styles.sliderLabel}>Slide to Pay {pricing?.currency}{totalAmount}</Text>
                        </Animated.View>

                        <Animated.View
                            {...panResponder.panHandlers}
                            style={[
                                styles.sliderThumb,
                                { transform: [{ translateX: slideAnim }] }
                            ]}
                        >
                            <Icon name="chevron-double-right" size={28} color={theme.colors.primary} />
                        </Animated.View>
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F5F9' },
    content: { flex: 1, padding: 16 },
    summaryCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    paymentCard: {
        backgroundColor: 'white',
        borderRadius: 16,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
    },
    paymentIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFF5F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    bottomSection: {
        padding: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    sliderContainer: {
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
        position: 'relative',
    },
    sliderTrack: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
    },
    sliderLabel: {
        color: '#666',
        fontWeight: 'bold',
        fontSize: 16,
    },
    sliderThumb: {
        position: 'absolute',
        left: 4,
        top: 4,
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    successBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4ECDC4',
        padding: 16,
        borderRadius: 30,
        gap: 8,
    },
    successText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
