import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, ProgressBar, Card, useTheme, IconButton } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { updateJobStatus, updateJobProgress, setLockerCode, clearJob } from '../../store/slices/printSlice';

const STEPS: { key: 'paid' | 'queued' | 'printing' | 'ready'; label: string; icon: string; description: string }[] = [
    { key: 'paid', label: 'Payment Verified', icon: 'check-circle', description: 'Payment confirmed' },
    { key: 'queued', label: 'In Queue', icon: 'clock-outline', description: 'Waiting to print' },
    { key: 'printing', label: 'Printing', icon: 'printer', description: 'Your document is printing' },
    { key: 'ready', label: 'Ready for Pickup', icon: 'package-variant', description: 'Collect from locker' }
];

export const JobStatus = ({ navigation, route }: { navigation: any; route?: any }) => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();

    // Redux State
    const { activeJob } = useSelector((state: RootState) => state.print);

    // Local state for fallback or if we want to show historical data passed via params
    // But primarily we want to sync with Redux active job if IDs match or no params.

    // Params might have data if coming from Payment or History
    const paramsJob = route?.params;

    const isCurrentActiveJob = activeJob && (!paramsJob?.transactionId || activeJob.id === paramsJob.transactionId);

    // Derived state
    const displayJob = isCurrentActiveJob ? activeJob : paramsJob; // Prefer active job for live updates

    // If no job data at all (shouldn't happen), handle gracefully
    if (!displayJob && !paramsJob) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text>No active job found.</Text>
                <Button onPress={() => navigation.navigate('MainTabs')}>Go Home</Button>
            </View>
        );
    }

    const currentStepIndex = STEPS.findIndex(s => s.key === (isCurrentActiveJob ? activeJob?.status : 'completed'));
    // If historical, we don't really have status, assume completed or show from params?
    // For MVP complexity reduction, if it's historical (from params and not active), assume completed or just show static data.
    // But let's focus on the ACTIVE job simulation.

    // Simulation Effect (ONLY if it is the active job)
    useEffect(() => {
        if (!isCurrentActiveJob || !activeJob) return;

        // Auto-advance simulation
        let timer: any;

        if (activeJob.status === 'paid') {
            timer = setTimeout(() => dispatch(updateJobStatus('queued')), 2000);
        } else if (activeJob.status === 'queued') {
            timer = setTimeout(() => dispatch(updateJobStatus('printing')), 2000);
        } else if (activeJob.status === 'printing') {
            if (activeJob.progress < 1) {
                timer = setTimeout(() => {
                    dispatch(updateJobProgress(Math.min(activeJob.progress + 0.1, 1)));
                }, 500);
            } else {
                dispatch(updateJobStatus('ready'));
            }
        } else if (activeJob.status === 'ready' && !activeJob.lockerCode) {
            dispatch(setLockerCode(Math.floor(1000 + Math.random() * 9000).toString()));
        }

        return () => clearTimeout(timer);
    }, [activeJob, isCurrentActiveJob, dispatch]);


    const handleDone = () => {
        // If job is ready, we can clear it from "active" floating status if user wants, 
        // OR we keep it until they pick it up. 
        // For now, let's keep it in Redux so the "Ready" bar stays on dashboard until they dismiss it or something.
        // But navigating back should go to Dashboard.
        navigation.navigate('MainTabs');
    };

    // Calculate step index safely
    const getStepIndex = (status: string) => {
        const idx = STEPS.findIndex(s => s.key === status);
        return idx >= 0 ? idx : (status === 'completed' ? 4 : 0);
    };

    const statusIndex = isCurrentActiveJob ? getStepIndex(activeJob!.status) : 4; // 4 = all done

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <IconButton icon="chevron-down" onPress={() => navigation.navigate('MainTabs')} />
                <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>Print Status</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                {/* Job Info Card */}
                <Card style={styles.card}>
                    <Card.Content>
                        <View style={styles.jobHeader}>
                            <View style={styles.docIcon}>
                                <Icon name="file-pdf-box" size={32} color="#E74C3C" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                                    {isCurrentActiveJob ? activeJob?.documentName : displayJob?.document?.name || 'Document'}
                                </Text>
                                <Text variant="bodySmall" style={{ color: '#666' }}>
                                    ID: #{isCurrentActiveJob ? activeJob?.id.slice(-6) : '---'}
                                </Text>
                            </View>
                            <View style={styles.amountBadge}>
                                <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                                    ₹{isCurrentActiveJob ? activeJob?.totalAmount : displayJob?.pricing?.total || 0}
                                </Text>
                            </View>
                        </View>

                        {/* Timeline */}
                        <View style={styles.timeline}>
                            {STEPS.map((step, index) => (
                                <View key={step.key} style={styles.stepRow}>
                                    <View style={styles.stepIndicator}>
                                        <View style={[
                                            styles.dot,
                                            {
                                                backgroundColor: index <= statusIndex ? theme.colors.primary : '#E0E0E0',
                                                borderWidth: index === statusIndex ? 3 : 0,
                                                borderColor: theme.colors.primary + '30',
                                            }
                                        ]}>
                                            {index < statusIndex && (
                                                <Icon name="check" size={12} color="white" />
                                            )}
                                            {index === statusIndex && index !== 3 && (
                                                <View style={styles.pulsingDot} />
                                            )}
                                        </View>
                                        {index < STEPS.length - 1 && (
                                            <View style={[
                                                styles.line,
                                                { backgroundColor: index < statusIndex ? theme.colors.primary : '#E0E0E0' }
                                            ]} />
                                        )}
                                    </View>
                                    <View style={styles.stepContent}>
                                        <Text style={{
                                            fontWeight: index === statusIndex ? 'bold' : 'normal',
                                            color: index <= statusIndex ? '#1A1A2E' : '#999',
                                            fontSize: 15,
                                        }}>
                                            {step.label}
                                        </Text>
                                        {index === statusIndex && (
                                            <Text variant="bodySmall" style={{ color: '#666', marginTop: 2 }}>
                                                {step.description}
                                            </Text>
                                        )}
                                        {/* Printing Progress Bar */}
                                        {step.key === 'printing' && index === statusIndex && (
                                            <View style={{ marginTop: 8 }}>
                                                <ProgressBar
                                                    progress={activeJob?.progress || 0}
                                                    color={theme.colors.primary}
                                                    style={styles.progressBar}
                                                />
                                                <Text variant="labelSmall" style={{ color: '#888', marginTop: 4 }}>
                                                    {Math.round((activeJob?.progress || 0) * 100)}% complete
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            ))}
                        </View>
                    </Card.Content>
                </Card>

                {/* Ready for Pickup Card */}
                {statusIndex === 3 && (
                    <Card style={[styles.card, styles.readyCard]}>
                        <Card.Content style={{ alignItems: 'center' }}>
                            <View style={styles.readyIcon}>
                                <Icon name="check" size={40} color="white" />
                            </View>
                            <Text variant="headlineSmall" style={{ fontWeight: 'bold', marginTop: 16, color: '#2ECC71' }}>
                                Ready for Pickup!
                            </Text>
                            <Text variant="displaySmall" style={styles.lockerCode}>
                                {activeJob?.lockerCode || '7392'}
                            </Text>
                            <View style={styles.lockerInfo}>
                                <Icon name="locker" size={20} color="#666" />
                                <Text variant="bodyMedium" style={{ color: '#666', marginLeft: 8 }}>
                                    Locker #12 • Library Ground Floor
                                </Text>
                            </View>
                            <Text variant="bodySmall" style={{ color: '#888', marginTop: 8, textAlign: 'center' }}>
                                Enter this code on the locker keypad to collect your prints
                            </Text>
                        </Card.Content>
                    </Card>
                )}

                {/* Estimated Time */}
                {statusIndex < 3 && (
                    <Card style={styles.card}>
                        <Card.Content style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Icon name="clock-outline" size={24} color={theme.colors.primary} />
                            <View style={{ marginLeft: 12 }}>
                                <Text variant="bodySmall" style={{ color: '#666' }}>Estimated time</Text>
                                <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
                                    {statusIndex === 0 ? '~3 minutes' : statusIndex === 1 ? '~2 minutes' : '~1 minute'}
                                </Text>
                            </View>
                        </Card.Content>
                    </Card>
                )}
            </View>

            {/* Footer */}
            <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
                <Button
                    mode="contained"
                    onPress={handleDone}
                    style={{ flex: 1 }}
                    contentStyle={{ height: 48 }}
                >
                    {statusIndex === 3 ? 'Done' : 'Back to Home'}
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
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    content: { flex: 1, padding: 16 },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 16,
        elevation: 2,
    },
    readyCard: {
        backgroundColor: '#F0FFF4',
        borderWidth: 1,
        borderColor: '#2ECC71',
    },
    jobHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
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
    amountBadge: {
        backgroundColor: '#FFF5F0',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    transactionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: 8,
        borderRadius: 8,
        marginBottom: 16,
    },
    timeline: {
        paddingLeft: 8,
    },
    stepRow: {
        flexDirection: 'row',
        minHeight: 60,
    },
    stepIndicator: {
        alignItems: 'center',
        width: 28,
    },
    dot: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pulsingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'white',
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
        height: 8,
        borderRadius: 4,
    },
    readyIcon: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#2ECC71',
        justifyContent: 'center',
        alignItems: 'center',
    },
    lockerCode: {
        fontWeight: 'bold',
        letterSpacing: 8,
        marginTop: 12,
        marginBottom: 8,
        color: '#1A1A2E',
    },
    lockerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    footer: {
        padding: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
});
