import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, Button, Card, useTheme, Divider, IconButton, ActivityIndicator, Snackbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Skeleton } from '../../components/common/Skeleton';
import { useDispatch } from 'react-redux';
import { startPrintJob } from '../../store/slices/printSlice';
import { printerService } from '../../services/printerService';
import { paymentService } from '../../services/paymentService';
import { getSecureItem, STORAGE_KEYS } from '../../utils/secureStorage';

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

interface PaymentScreenProps {
    navigation: any;
    route?: any;
}

export const PaymentScreen = ({ navigation, route }: PaymentScreenProps) => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();

    const params = route?.params || {};
    const { document, settings, printerId, printerName, pricing: initialPricing } = params;

    // States
    const [isLoadingPrice, setIsLoadingPrice] = useState(true);
    const [calculatedPricing, setCalculatedPricing] = useState<any>(null);
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [upiId, setUpiId] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed' | 'timeout'>('idle');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [transactionId, setTransactionId] = useState<string | null>(null);

    // Animation
    const successAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        calculateTotal();
    }, [initialPricing, printerId]);

    const calculateTotal = async () => {
        setIsLoadingPrice(true);
        try {
            let printerPricing = initialPricing;

            // If initialPricing is the already calculated pricing (has 'total' property)
            // or if it's missing entirely but we have printerId
            if ((!printerPricing || printerPricing.total !== undefined) && printerId) {
                const result = await printerService.getPrinterDetails(printerId);
                if (result.success && result.printer) {
                    printerPricing = result.printer.pricing;
                }
            }

            if (!printerPricing) {
                // If we still don't have printer pricing config, use defaults or error
                setCalculatedPricing({
                    total: params.pricing?.total || 0,
                    breakdown: [{ label: 'Estimated Total', amount: params.pricing?.total || 0 }]
                });
                return;
            }

            // If printerPricing is the config object from backend
            if (printerPricing.price_bw_single !== undefined) {
                const pages = settings.totalPages || 0;
                const copies = settings.copies || 1;
                const isColor = settings.colorMode === 'color';
                const isDuplex = settings.sides === 'double';

                let perPageRate = 0;
                if (isColor) {
                    perPageRate = isDuplex ? (printerPricing.price_color_duplex || printerPricing.price_color_single) : printerPricing.price_color_single;
                } else {
                    perPageRate = isDuplex ? (printerPricing.price_bw_duplex || printerPricing.price_bw_single) : printerPricing.price_bw_single;
                }

                // Safety fallback
                if (!perPageRate) perPageRate = isColor ? 5 : 2;

                const totalAmount = perPageRate * pages * copies;
                setCalculatedPricing({
                    total: totalAmount,
                    breakdown: [
                        {
                            label: `${pages} pages × ${copies} copies @ ₹${perPageRate}/page`,
                            amount: totalAmount
                        }
                    ]
                });
            } else if (printerPricing.total !== undefined) {
                // It was already calculated
                setCalculatedPricing(printerPricing);
            }

        } catch (error) {
            console.error('Pricing calculation error:', error);
            setErrorMsg('Failed to calculate pricing. Please go back.');
        } finally {
            setIsLoadingPrice(false);
        }
    };

    const handlePayment = async () => {
        if (!selectedMethod || !upiId.trim()) {
            setErrorMsg('Please select a payment method and enter UPI ID');
            return;
        }

        setIsProcessing(true);
        setPaymentStatus('processing');

        try {
            const token = await getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
            // Generate a temporary job ID for tracing before registration if needed
            // Or use a combination of user/timestamp
            const tempJobId = `JOB_${Date.now()}`;

            // 1. Initiate Payment
            const initiateRes = await paymentService.initiatePayment({
                amount: calculatedPricing.total,
                payment_method: 'upi',
                payment_provider: selectedMethod,
                upi_id: upiId,
                print_job_id: tempJobId,
                description: `Print: ${document?.name}`
            }, token || undefined);

            if (!initiateRes.success) {
                throw new Error(initiateRes.message || 'Failed to initiate payment');
            }

            const txnId = initiateRes.transaction_id;
            setTransactionId(txnId);

            // 2. Process/Verify with 30s timeout
            let isVerified = false;
            const startTime = Date.now();
            const TIMEOUT_SEC = 30;

            // Simulate the processing call first (as per the curl example)
            // In a real app, this might be triggered by the user completing the payment in their app
            await paymentService.processPayment(txnId, token || undefined);

            while (Date.now() - startTime < TIMEOUT_SEC * 1000) {
                const verifyRes = await paymentService.verifyPayment(txnId, token || undefined);

                if (verifyRes.success && verifyRes.status === 'success') {
                    isVerified = true;
                    break;
                } else if (verifyRes.status === 'failed') {
                    throw new Error(verifyRes.message || 'Payment failed');
                }

                // Wait 2 seconds before next poll
                await new Promise(resolve => setTimeout(() => resolve(null), 2000));
            }

            if (!isVerified) {
                setPaymentStatus('timeout');
                setErrorMsg('Payment verification timed out. Please check your banking app.');
                return;
            }

            // 3. Success Flow
            setPaymentStatus('success');

            // Dispatch global job start
            dispatch(startPrintJob({
                id: txnId,
                documentName: document.name,
                totalAmount: calculatedPricing.total
            }));

            // Animate success
            Animated.spring(successAnim, {
                toValue: 1, friction: 5, useNativeDriver: true,
            }).start();

            // Navigate to status after delay
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
                                pricing: calculatedPricing,
                                transactionId: txnId
                            }
                        },
                    ],
                });
            }, 1500);

        } catch (error: any) {
            setPaymentStatus('failed');
            setErrorMsg(error.message || 'An unexpected error occurred during payment');
        } finally {
            setIsProcessing(false);
        }
    };

    const renderPricingSkeleton = () => (
        <Card style={styles.summaryCard}>
            <Card.Content>
                <Skeleton height={20} width="40%" style={{ marginBottom: 16 }} />
                <Skeleton height={60} width="100%" style={{ marginBottom: 12 }} />
                <Divider style={{ marginVertical: 16 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Skeleton height={24} width="30%" />
                    <Skeleton height={32} width="25%" />
                </View>
            </Card.Content>
        </Card>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
                <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>Payment</Text>
                <View style={{ width: 48 }} />
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
                >
                    {/* Order Summary */}
                    {isLoadingPrice ? renderPricingSkeleton() : (
                        <Card style={styles.summaryCard}>
                            <Card.Content>
                                <Text variant="titleMedium" style={styles.sectionTitle}>Order Summary</Text>
                                <View style={styles.row}>
                                    <Text variant="bodyMedium">Printer</Text>
                                    <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>{printerName || 'Selected Printer'}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text variant="bodyMedium">Document</Text>
                                    <Text variant="bodyMedium" numberOfLines={1}>{document?.name}</Text>
                                </View>

                                <Divider style={{ marginVertical: 12 }} />

                                {calculatedPricing?.breakdown?.map((item: any, index: number) => (
                                    <View key={index} style={styles.breakdownRow}>
                                        <Text variant="bodySmall" style={{ color: '#666', flex: 1 }}>{item.label}</Text>
                                        <Text variant="bodySmall" style={{ fontWeight: 'bold' }}>₹{item.amount}</Text>
                                    </View>
                                ))}

                                <Divider style={{ marginVertical: 12 }} />

                                <View style={styles.totalRow}>
                                    <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>Total Amount</Text>
                                    <Text variant="headlineMedium" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                                        ₹{calculatedPricing?.total || 0}
                                    </Text>
                                </View>
                            </Card.Content>
                        </Card>
                    )}

                    {/* UPI Selection */}
                    <Card style={styles.paymentCard}>
                        <Card.Content>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <Text variant="titleMedium" style={[styles.sectionTitle, { marginBottom: 0 }]}>Pay with UPI</Text>
                                <View style={styles.secureBadge}>
                                    <Icon name="shield-check" size={14} color="#2ECC71" />
                                    <Text style={styles.secureText}>Secure</Text>
                                </View>
                            </View>

                            <View style={styles.appsGrid}>
                                {UPI_APPS.filter(app => app.popular).map(app => {
                                    const isActive = selectedMethod === app.id;
                                    return (
                                        <TouchableOpacity
                                            key={app.id}
                                            activeOpacity={0.7}
                                            style={[
                                                styles.appCard,
                                                isActive && { borderColor: app.color, backgroundColor: app.color + '05', borderWidth: 2 }
                                            ]}
                                            onPress={() => {
                                                setSelectedMethod(app.id);
                                                // Pre-fill some defaults if needed, or leave empty for user
                                                if (upiId === '') setUpiId('user@' + app.id);
                                            }}
                                        >
                                            <View style={[styles.appIcon, { backgroundColor: app.color + '15' }]}>
                                                <Icon name={app.icon} size={24} color={app.color} />
                                            </View>
                                            <Text variant="labelSmall" style={[styles.appText, isActive && { color: app.color, fontWeight: 'bold' }]}>
                                                {app.name}
                                            </Text>
                                            {isActive && (
                                                <View style={[styles.activeIndicator, { backgroundColor: app.color }]}>
                                                    <Icon name="check" size={10} color="white" />
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {selectedMethod && (
                                <View style={styles.upiInputSection}>
                                    <Text variant="labelMedium" style={{ marginBottom: 8, color: '#666' }}>Enter UPI ID</Text>
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={styles.upiInput}
                                            placeholder="e.g. user@bank"
                                            value={upiId}
                                            onChangeText={setUpiId}
                                            autoCapitalize="none"
                                        />
                                        <IconButton icon="close-circle" size={20} onPress={() => setUpiId('')} />
                                    </View>
                                    <Text variant="bodySmall" style={{ color: '#888', marginTop: 4 }}>
                                        You'll receive a payment request on your {UPI_APPS.find(a => a.id === selectedMethod)?.name} app.
                                    </Text>
                                </View>
                            )}
                        </Card.Content>
                    </Card>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Bottom Bar */}
            <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
                <View>
                    <Text variant="bodySmall" style={{ color: '#666' }}>Amount to pay</Text>
                    <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                        ₹{calculatedPricing?.total || '--'}
                    </Text>
                </View>
                <Button
                    mode="contained"
                    onPress={handlePayment}
                    disabled={!selectedMethod || isProcessing || !upiId.trim()}
                    loading={isProcessing}
                    style={styles.payButton}
                    contentStyle={{ height: 50 }}
                >
                    Pay Now
                </Button>
            </View>

            {/* Processing Overlay */}
            {isProcessing && (
                <View style={styles.processingOverlay}>
                    <Card style={styles.statusCard}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text variant="titleMedium" style={{ marginTop: 20, fontWeight: 'bold' }}>Processing Payment</Text>
                        <Text variant="bodyMedium" style={{ color: '#666', textAlign: 'center', marginTop: 8 }}>
                            Please do not close the app or go back while we verify your transaction.
                        </Text>
                    </Card>
                </View>
            )}

            {/* Success Animation */}
            {paymentStatus === 'success' && (
                <View style={styles.processingOverlay}>
                    <Animated.View style={[
                        styles.successCard,
                        { transform: [{ scale: successAnim }], opacity: successAnim }
                    ]}>
                        <View style={styles.successIcon}><Icon name="check" size={48} color="white" /></View>
                        <Text variant="headlineSmall" style={{ marginTop: 20, fontWeight: 'bold', color: '#2ECC71' }}>Success!</Text>
                        <Text variant="bodyMedium" style={{ marginTop: 8 }}>Transaction ID: {transactionId}</Text>
                        <Text variant="bodySmall" style={{ color: '#888', marginTop: 12 }}>Redirecting to job status...</Text>
                    </Animated.View>
                </View>
            )}

            {/* Timeout / Failed Modal */}
            {(paymentStatus === 'failed' || paymentStatus === 'timeout') && (
                <View style={styles.processingOverlay}>
                    <Card style={styles.statusCard}>
                        <View style={[styles.errorIcon, { backgroundColor: paymentStatus === 'timeout' ? '#FF9800' : '#FF5252' }]}>
                            <Icon name={paymentStatus === 'timeout' ? 'clock-outline' : 'close'} size={40} color="white" />
                        </View>
                        <Text variant="titleLarge" style={{ marginTop: 20, fontWeight: 'bold' }}>
                            {paymentStatus === 'timeout' ? 'Payment Timeout' : 'Payment Failed'}
                        </Text>
                        <Text variant="bodyMedium" style={{ color: '#666', textAlign: 'center', marginTop: 8 }}>
                            {errorMsg || 'Something went wrong.'}
                        </Text>
                        <Button
                            mode="contained"
                            style={{ marginTop: 24, width: '100%' }}
                            onPress={() => setPaymentStatus('idle')}
                        >
                            Try Again
                        </Button>
                        <Button
                            mode="text"
                            style={{ marginTop: 8 }}
                            onPress={() => navigation.goBack()}
                        >
                            Cancel
                        </Button>
                    </Card>
                </View>
            )}

            <Snackbar
                visible={!!errorMsg && paymentStatus === 'idle'}
                onDismiss={() => setErrorMsg(null)}
                duration={4000}
                action={{ label: 'Dismiss', onPress: () => setErrorMsg(null) }}
            >
                {errorMsg}
            </Snackbar>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F5F9' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#EEE' },
    content: { flex: 1, padding: 16 },
    summaryCard: { borderRadius: 20, marginBottom: 16, elevation: 2, backgroundColor: 'white' },
    sectionTitle: { fontWeight: 'bold', marginBottom: 16, color: '#1A1A2E' },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
    paymentCard: { borderRadius: 20, marginBottom: 16, elevation: 2, backgroundColor: 'white' },
    secureBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, gap: 4 },
    secureText: { fontSize: 10, fontWeight: 'bold', color: '#2ECC71' },
    appsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    appCard: { width: '31%', backgroundColor: '#F8F9FA', borderRadius: 16, padding: 12, alignItems: 'center', position: 'relative', borderWidth: 2, borderColor: '#F0F0F0' },
    appIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
    appText: { fontSize: 11, color: '#666' },
    activeIndicator: { position: 'absolute', top: -8, right: -8, width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    upiInputSection: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 20 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0' },
    upiInput: { flex: 1, padding: 14, fontSize: 16, color: '#1A1A2E' },
    bottomBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E0E0E0', elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 10 },
    payButton: { paddingHorizontal: 32, borderRadius: 12 },
    processingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 100, padding: 20 },
    statusCard: { backgroundColor: 'white', borderRadius: 24, padding: 24, alignItems: 'center', width: '100%', elevation: 10 },
    successCard: { backgroundColor: 'white', borderRadius: 24, padding: 32, alignItems: 'center', width: SCREEN_WIDTH - 60 },
    successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#2ECC71', justifyContent: 'center', alignItems: 'center' },
    errorIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
});
