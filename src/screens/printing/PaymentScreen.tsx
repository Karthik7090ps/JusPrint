import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, Card, useTheme, Divider, IconButton, ActivityIndicator, Snackbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Skeleton } from '../../components/common/Skeleton';
import { useDispatch } from 'react-redux';
import { startPrintJob } from '../../store/slices/printSlice';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// UPI Apps available
const UPI_APPS = [
    { id: 'gpay', name: 'Google Pay', icon: 'google', color: '#4285F4', popular: true },
    { id: 'phonepe', name: 'PhonePe', icon: 'cellphone', color: '#5F259F', popular: true },
    { id: 'paytm', name: 'Paytm', icon: 'wallet', color: '#00BAF2', popular: true },
    { id: 'amazonpay', name: 'Amazon Pay', icon: 'shopping', color: '#FF9900', popular: false },
    { id: 'bhim', name: 'BHIM', icon: 'bank', color: '#00796B', popular: false },
    { id: 'cred', name: 'CRED', icon: 'credit-card', color: '#1A1A1A', popular: false },
];

// Backend pricing calculation (simulated)
const calculatePriceFromBackend = async (settings: any): Promise<{
    basePrice: number;
    colorCharge: number;
    duplexDiscount: number;
    pageSizeCharge: number;
    bindingCharge: number;
    total: number;
    perPage: number;
    breakdown: { label: string; amount: number }[];
}> => {
    await new Promise(resolve => setTimeout(() => resolve(undefined), 800));

    const pages = settings.totalPages || 10;
    const copies = settings.copies || 1;

    // Base pricing
    const bwRate = 2; // ₹2 per page B&W
    const colorRate = 5; // ₹5 per page Color

    // Calculate base
    const isColor = settings.colorMode === 'color';
    const baseRate = isColor ? colorRate : bwRate;
    const basePrice = baseRate * pages * copies;

    // Color surcharge
    const colorCharge = isColor ? Math.round(pages * 0.5) : 0;

    // Duplex discount (20% off)
    const duplexDiscount = settings.sides === 'double' ? -Math.round(basePrice * 0.2) : 0;

    // Page size surcharge
    let pageSizeCharge = 0;
    if (settings.pageSize === 'A3') pageSizeCharge = pages * 3;
    if (settings.pageSize === 'Letter') pageSizeCharge = pages * 1;

    // Binding charge
    const bindingCharge = settings.binding ? 30 : 0;

    const total = Math.max(basePrice + colorCharge + duplexDiscount + pageSizeCharge + bindingCharge, 0);
    const perPage = Math.round((total / (pages * copies)) * 100) / 100;

    const breakdown = [
        { label: `${pages} pages × ${copies} copies @ ₹${baseRate}/page`, amount: basePrice },
    ];

    if (colorCharge > 0) breakdown.push({ label: 'Color printing charge', amount: colorCharge });
    if (duplexDiscount < 0) breakdown.push({ label: 'Duplex discount (20%)', amount: duplexDiscount });
    if (pageSizeCharge > 0) breakdown.push({ label: `${settings.pageSize} size surcharge`, amount: pageSizeCharge });
    if (bindingCharge > 0) breakdown.push({ label: 'Binding', amount: bindingCharge });

    return { basePrice, colorCharge, duplexDiscount, pageSizeCharge, bindingCharge, total, perPage, breakdown };
};

// Simulated payment processing
const processPayment = async (method: string, upiId: string, amount: number): Promise<{ success: boolean; transactionId: string; message: string }> => {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(() => resolve(undefined), 2500));

    // 90% success rate for demo
    const success = Math.random() > 0.1;

    if (success) {
        return {
            success: true,
            transactionId: `TXN${Date.now()}`,
            message: 'Payment successful'
        };
    } else {
        return {
            success: false,
            transactionId: '',
            message: 'Payment failed. Please try again.'
        };
    }
};

interface PaymentScreenProps {
    navigation: any;
    route?: any;
}

export const PaymentScreen = ({ navigation, route }: PaymentScreenProps) => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();

    const { document, settings } = route?.params || {
        document: { name: 'Document.pdf', pages: 10 },
        settings: { copies: 1, colorMode: 'bw', sides: 'single', totalPages: 10 },
    };

    // States
    const [isLoadingPrice, setIsLoadingPrice] = useState(true);
    const [pricing, setPricing] = useState<any>(null);
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [upiId, setUpiId] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [transactionId, setTransactionId] = useState<string | null>(null);

    // Animation
    const successAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadPricing();
    }, []);

    const loadPricing = async () => {
        setIsLoadingPrice(true);
        try {
            const price = await calculatePriceFromBackend(settings);
            setPricing(price);
        } catch (error) {
            setErrorMsg('Failed to calculate price. Please try again.');
        } finally {
            setIsLoadingPrice(false);
        }
    };

    const handleSelectMethod = (methodId: string) => {
        setSelectedMethod(methodId);
        // Auto-fill sample UPI for demo
        if (methodId === 'gpay') setUpiId('user@okaxis');
        else if (methodId === 'phonepe') setUpiId('user@ybl');
        else if (methodId === 'paytm') setUpiId('user@paytm');
        else setUpiId('');
    };

    const handlePayment = async () => {
        if (!selectedMethod || !upiId.trim()) {
            setErrorMsg('Please select a payment method and enter UPI ID');
            return;
        }

        if (!upiId.includes('@')) {
            setErrorMsg('Please enter a valid UPI ID');
            return;
        }

        setIsProcessing(true);
        setPaymentStatus('processing');

        try {
            const result = await processPayment(selectedMethod, upiId, pricing.total);

            if (result.success) {
                setPaymentStatus('success');
                setTransactionId(result.transactionId);

                // Dispatch global job start
                dispatch(startPrintJob({
                    id: result.transactionId,
                    documentName: document.name,
                    totalAmount: pricing.total
                }));

                // Animate success
                Animated.spring(successAnim, {
                    toValue: 1,
                    friction: 5,
                    useNativeDriver: true,
                }).start();

                // Navigate to status after delay
                // REPLACE stack so user can't go back to payment
                setTimeout(() => {
                    navigation.reset({
                        index: 1,
                        routes: [
                            { name: 'MainTabs' },
                            {
                                name: 'JobStatus',
                                params: {
                                    document,
                                    settings,
                                    pricing,
                                    transactionId: result.transactionId
                                }
                            },
                        ],
                    });
                }, 2000);
            } else {
                setPaymentStatus('failed');
                setErrorMsg(result.message);
            }
        } catch (error) {
            setPaymentStatus('failed');
            setErrorMsg('Payment failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const renderPricingSkeleton = () => (
        <Card style={styles.summaryCard}>
            <Card.Content>
                <Skeleton height={20} width="40%" style={{ marginBottom: 16 }} />
                <Skeleton height={16} width="100%" style={{ marginBottom: 12 }} />
                <Skeleton height={16} width="100%" style={{ marginBottom: 12 }} />
                <Skeleton height={16} width="80%" style={{ marginBottom: 16 }} />
                <Divider style={{ marginVertical: 16 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Skeleton height={24} width="30%" />
                    <Skeleton height={32} width="25%" />
                </View>
            </Card.Content>
        </Card>
    );

    const renderProcessing = () => (
        <View style={styles.processingOverlay}>
            <View style={styles.processingCard}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text variant="titleMedium" style={{ marginTop: 16, fontWeight: 'bold' }}>
                    Processing Payment...
                </Text>
                <Text variant="bodySmall" style={{ color: '#666', marginTop: 8, textAlign: 'center' }}>
                    Please wait while we confirm your payment{'\n'}with {UPI_APPS.find(a => a.id === selectedMethod)?.name}
                </Text>
            </View>
        </View>
    );

    const renderSuccess = () => (
        <View style={styles.processingOverlay}>
            <Animated.View style={[
                styles.successCard,
                {
                    transform: [{ scale: successAnim }],
                    opacity: successAnim,
                }
            ]}>
                <View style={styles.successIcon}>
                    <Icon name="check" size={48} color="white" />
                </View>
                <Text variant="headlineSmall" style={{ marginTop: 20, fontWeight: 'bold', color: '#2ECC71' }}>
                    Payment Successful!
                </Text>
                <Text variant="bodyMedium" style={{ color: '#666', marginTop: 8 }}>
                    Transaction ID: {transactionId}
                </Text>
                <Text variant="bodySmall" style={{ color: '#888', marginTop: 16 }}>
                    Redirecting to print status...
                </Text>
            </Animated.View>
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
                <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>Payment</Text>
                <View style={{ width: 48 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Order Summary with Backend Pricing */}
                    {isLoadingPrice ? renderPricingSkeleton() : pricing && (
                        <Card style={styles.summaryCard}>
                            <Card.Content>
                                <Text variant="titleMedium" style={styles.sectionTitle}>Order Summary</Text>

                                <View style={styles.row}>
                                    <Text variant="bodyMedium">Document</Text>
                                    <Text variant="bodyMedium" style={{ fontWeight: '500' }} numberOfLines={1}>
                                        {document?.name}
                                    </Text>
                                </View>

                                <View style={styles.row}>
                                    <Text variant="bodyMedium">Print Type</Text>
                                    <Text variant="bodyMedium">
                                        {settings?.colorMode === 'color' ? 'Color' : 'Black & White'}
                                    </Text>
                                </View>

                                <View style={styles.row}>
                                    <Text variant="bodyMedium">Sides</Text>
                                    <Text variant="bodyMedium">
                                        {settings?.sides === 'double' ? 'Double-sided' : 'Single-sided'}
                                    </Text>
                                </View>

                                <Divider style={{ marginVertical: 12 }} />

                                {/* Price Breakdown */}
                                <Text variant="labelMedium" style={{ color: '#888', marginBottom: 8 }}>
                                    PRICE BREAKDOWN
                                </Text>
                                {pricing.breakdown.map((item: any, index: number) => (
                                    <View key={index} style={styles.breakdownRow}>
                                        <Text variant="bodySmall" style={{ color: '#666', flex: 1 }}>
                                            {item.label}
                                        </Text>
                                        <Text
                                            variant="bodySmall"
                                            style={{
                                                fontWeight: '600',
                                                color: item.amount < 0 ? '#2ECC71' : '#1A1A2E'
                                            }}
                                        >
                                            {item.amount < 0 ? '-' : ''}₹{Math.abs(item.amount)}
                                        </Text>
                                    </View>
                                ))}

                                <Divider style={{ marginVertical: 12 }} />

                                <View style={styles.totalRow}>
                                    <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>Total</Text>
                                    <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                                        ₹{pricing.total}
                                    </Text>
                                </View>
                            </Card.Content>
                        </Card>
                    )}

                    {/* UPI Payment Methods */}
                    <Card style={styles.paymentCard}>
                        <Card.Content>
                            <Text variant="titleMedium" style={styles.sectionTitle}>Pay with UPI</Text>

                            {/* Popular Apps */}
                            <Text variant="labelMedium" style={{ color: '#888', marginBottom: 12 }}>
                                POPULAR APPS
                            </Text>
                            <View style={styles.appsGrid}>
                                {UPI_APPS.filter(app => app.popular).map(app => (
                                    <TouchableOpacity
                                        key={app.id}
                                        style={[
                                            styles.appCard,
                                            selectedMethod === app.id && styles.appCardSelected,
                                            selectedMethod === app.id && { borderColor: app.color }
                                        ]}
                                        onPress={() => handleSelectMethod(app.id)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.appIcon, { backgroundColor: app.color + '15' }]}>
                                            <Icon name={app.icon} size={24} color={app.color} />
                                        </View>
                                        <Text variant="labelMedium" style={{ marginTop: 8, fontWeight: '600' }}>
                                            {app.name}
                                        </Text>
                                        {selectedMethod === app.id && (
                                            <View style={[styles.checkBadge, { backgroundColor: app.color }]}>
                                                <Icon name="check" size={12} color="white" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Other Apps */}
                            <Text variant="labelMedium" style={{ color: '#888', marginTop: 16, marginBottom: 12 }}>
                                OTHER UPI APPS
                            </Text>
                            <View style={styles.otherAppsRow}>
                                {UPI_APPS.filter(app => !app.popular).map(app => (
                                    <TouchableOpacity
                                        key={app.id}
                                        style={[
                                            styles.otherAppBtn,
                                            selectedMethod === app.id && styles.otherAppBtnSelected,
                                        ]}
                                        onPress={() => handleSelectMethod(app.id)}
                                    >
                                        <Icon name={app.icon} size={18} color={selectedMethod === app.id ? 'white' : app.color} />
                                        <Text
                                            variant="labelSmall"
                                            style={{
                                                marginLeft: 6,
                                                color: selectedMethod === app.id ? 'white' : '#1A1A2E'
                                            }}
                                        >
                                            {app.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* UPI ID Input */}
                            {selectedMethod && (
                                <View style={styles.upiInputSection}>
                                    <Text variant="labelMedium" style={{ color: '#888', marginBottom: 8 }}>
                                        ENTER UPI ID
                                    </Text>
                                    <View style={styles.upiInputContainer}>
                                        <Icon name="at" size={20} color="#888" style={{ marginRight: 8 }} />
                                        <TextInput
                                            style={styles.upiInput}
                                            placeholder="username@upi"
                                            placeholderTextColor="#999"
                                            value={upiId}
                                            onChangeText={setUpiId}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                        />
                                        {upiId.includes('@') && (
                                            <Icon name="check-circle" size={20} color="#2ECC71" />
                                        )}
                                    </View>
                                    <Text variant="bodySmall" style={{ color: '#888', marginTop: 8 }}>
                                        A payment request will be sent to this UPI ID
                                    </Text>
                                </View>
                            )}
                        </Card.Content>
                    </Card>

                    {/* Security Info */}
                    <View style={styles.securityInfo}>
                        <Icon name="shield-check" size={16} color="#2ECC71" />
                        <Text variant="bodySmall" style={{ color: '#666', marginLeft: 8 }}>
                            100% Secure Payments powered by Razorpay
                        </Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom Bar */}
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
                <View>
                    <Text variant="bodySmall" style={{ color: '#666' }}>Amount to pay</Text>
                    <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                        ₹{pricing?.total || '--'}
                    </Text>
                </View>
                <Button
                    mode="contained"
                    onPress={handlePayment}
                    disabled={!selectedMethod || !upiId.includes('@') || isProcessing || isLoadingPrice}
                    loading={isProcessing}
                    style={{ paddingHorizontal: 24 }}
                    contentStyle={{ height: 48 }}
                >
                    {isProcessing ? 'Processing...' : `Pay ₹${pricing?.total || '--'}`}
                </Button>
            </View>

            {/* Processing Overlay */}
            {paymentStatus === 'processing' && renderProcessing()}

            {/* Success Overlay */}
            {paymentStatus === 'success' && renderSuccess()}

            {/* Error Snackbar */}
            <Snackbar
                visible={!!errorMsg}
                onDismiss={() => setErrorMsg(null)}
                action={{ label: 'OK', onPress: () => setErrorMsg(null) }}
                duration={3000}
            >
                {errorMsg}
            </Snackbar>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F5F9' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 8,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    content: { flex: 1, padding: 16 },
    summaryCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 16,
        elevation: 2,
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    paymentCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 16,
        elevation: 2,
    },
    appsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    appCard: {
        width: '31%',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
        position: 'relative',
    },
    appCardSelected: {
        backgroundColor: '#FFF',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    appIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    otherAppsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    otherAppBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    otherAppBtnSelected: {
        backgroundColor: '#1A1A2E',
    },
    upiInputSection: {
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    upiInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    upiInput: {
        flex: 1,
        fontSize: 16,
        color: '#1A1A2E',
    },
    securityInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    processingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    processingCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        width: SCREEN_WIDTH - 64,
    },
    successCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 32,
        alignItems: 'center',
        width: SCREEN_WIDTH - 64,
    },
    successIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#2ECC71',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
