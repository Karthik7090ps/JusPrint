import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Text, Button, ProgressBar, Card, useTheme, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const STEPS = [
    { key: 'paid', label: 'Payment Verified', icon: 'check-circle' },
    { key: 'queued', label: 'In Queue', icon: 'clock-outline' },
    { key: 'printing', label: 'Printing', icon: 'printer' },
    { key: 'ready', label: 'Ready for Pickup', icon: 'package-variant' }
];

interface JobStatusProps {
    navigation: any;
    route?: any;
    // For bottom bar mode
    isBottomBar?: boolean;
    onExpand?: () => void;
}

export const JobStatus = ({ navigation, route, isBottomBar = false, onExpand }: JobStatusProps) => {
    const theme = useTheme();
    const { document, settings } = route?.params || { document: { name: 'Document.pdf' }, settings: {} };

    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isMinimized, setIsMinimized] = useState(isBottomBar);

    useEffect(() => {
        // Simulate MQTT updates
        const timer = setInterval(() => {
            setCurrentStep((prev) => {
                if (prev < STEPS.length - 1) return prev + 1;
                return prev;
            });
        }, 3000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (currentStep === 2) {
            // Printing progress
            const printTimer = setInterval(() => {
                setProgress(old => {
                    if (old >= 1) {
                        clearInterval(printTimer);
                        return 1;
                    }
                    return old + 0.1;
                });
            }, 500);
            return () => clearInterval(printTimer);
        }
    }, [currentStep]);

    // Zomato-style bottom bar (minimized view)
    if (isMinimized) {
        return (
            <TouchableOpacity
                style={[styles.bottomBar, { backgroundColor: theme.colors.primary }]}
                onPress={() => setIsMinimized(false)}
                activeOpacity={0.9}
            >
                <View style={styles.bottomBarContent}>
                    <View style={styles.bottomBarLeft}>
                        <Icon name={STEPS[currentStep].icon} size={20} color="white" />
                        <View style={{ marginLeft: 12 }}>
                            <Text style={styles.bottomBarTitle}>{STEPS[currentStep].label}</Text>
                            <Text style={styles.bottomBarSubtitle}>{document?.name}</Text>
                        </View>
                    </View>
                    {currentStep === 2 && (
                        <View style={styles.progressMini}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>{Math.round(progress * 100)}%</Text>
                        </View>
                    )}
                    <Icon name="chevron-up" size={24} color="white" />
                </View>
                {currentStep === 2 && (
                    <ProgressBar
                        progress={progress}
                        color="white"
                        style={styles.bottomBarProgress}
                    />
                )}
            </TouchableOpacity>
        );
    }

    // Full screen view
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <IconButton icon="chevron-down" onPress={() => navigation.goBack()} />
                <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>Print Status</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <Card style={styles.card}>
                    <Card.Content>
                        <View style={styles.jobHeader}>
                            <View style={styles.docIcon}>
                                <Icon name="file-pdf-box" size={32} color="#E74C3C" />
                            </View>
                            <View>
                                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{document?.name}</Text>
                                <Text variant="bodySmall" style={{ color: '#666' }}>Job #12345</Text>
                            </View>
                        </View>

                        <View style={styles.timeline}>
                            {STEPS.map((step, index) => (
                                <View key={step.key} style={styles.stepRow}>
                                    <View style={styles.stepIndicator}>
                                        <View style={[
                                            styles.dot,
                                            { backgroundColor: index <= currentStep ? theme.colors.primary : '#E0E0E0' }
                                        ]}>
                                            {index < currentStep && (
                                                <Icon name="check" size={12} color="white" />
                                            )}
                                        </View>
                                        {index < STEPS.length - 1 && (
                                            <View style={[
                                                styles.line,
                                                { backgroundColor: index < currentStep ? theme.colors.primary : '#E0E0E0' }
                                            ]} />
                                        )}
                                    </View>
                                    <View style={styles.stepContent}>
                                        <Text style={{
                                            fontWeight: index === currentStep ? 'bold' : 'normal',
                                            color: index <= currentStep ? 'black' : '#999'
                                        }}>
                                            {step.label}
                                        </Text>
                                        {index === 2 && currentStep === 2 && (
                                            <ProgressBar
                                                progress={progress}
                                                color={theme.colors.primary}
                                                style={styles.progressBar}
                                            />
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    </Card.Content>
                </Card>

                {currentStep === 3 && (
                    <Card style={[styles.card, { backgroundColor: '#E8F5E9' }]}>
                        <Card.Content style={{ alignItems: 'center' }}>
                            <Icon name="check-circle" size={48} color="#4ECDC4" />
                            <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginTop: 12 }}>
                                Ready for Pickup!
                            </Text>
                            <Text variant="displaySmall" style={styles.lockerCode}>
                                8921
                            </Text>
                            <Text variant="bodyMedium" style={{ color: '#666' }}>Locker #12 • Use this code</Text>
                        </Card.Content>
                    </Card>
                )}
            </View>

            <View style={styles.footer}>
                <Button
                    mode="contained"
                    onPress={() => navigation.navigate('MainTabs')}
                    style={{ flex: 1 }}
                >
                    {currentStep === 3 ? 'Done' : 'Print Another'}
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F5F9' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 8,
        backgroundColor: 'white',
    },
    content: { flex: 1, padding: 16 },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 16,
    },
    jobHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    docIcon: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: '#FFF5F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    timeline: {
        paddingLeft: 8,
    },
    stepRow: {
        flexDirection: 'row',
        minHeight: 50,
    },
    stepIndicator: {
        alignItems: 'center',
        width: 24,
    },
    dot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    line: {
        width: 2,
        flex: 1,
        marginVertical: 4,
    },
    stepContent: {
        flex: 1,
        marginLeft: 12,
        paddingBottom: 16,
    },
    progressBar: {
        marginTop: 8,
        height: 6,
        borderRadius: 3,
    },
    lockerCode: {
        fontWeight: 'bold',
        letterSpacing: 8,
        marginTop: 12,
        marginBottom: 8,
    },
    footer: {
        padding: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
    // Bottom bar styles (Zomato-style)
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
        elevation: 10,
    },
    bottomBarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    bottomBarLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    bottomBarTitle: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    bottomBarSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
    },
    progressMini: {
        marginRight: 12,
    },
    bottomBarProgress: {
        height: 3,
        backgroundColor: 'rgba(255,255,255,0.3)',
    },
});
