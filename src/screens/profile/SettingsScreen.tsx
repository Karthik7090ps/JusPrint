import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Text, Avatar, List, Divider, useTheme, Button, SegmentedButtons, Portal, Modal, ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppHeader } from '../../components/common/AppHeader';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { logoutUser, selectCampus } from '../../store/slices/authSlice';
import { authService } from '../../services/authService';
import { paymentService } from '../../services/paymentService';
import { getSecureItem, STORAGE_KEYS } from '../../utils/secureStorage';
import { getInitials, getAvatarColor } from '../../utils/avatarUtils';

export const SettingsScreen = ({ navigation }: { navigation: any }) => {
    const theme = useTheme();
    const dispatch = useDispatch<AppDispatch>();
    const { name, campusName, campusCode } = useSelector((state: RootState) => state.auth);

    // Mock State for Settings
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);

    // Default Print Settings
    const [defaultColor, setDefaultColor] = useState('bw');
    const [defaultSides, setDefaultSides] = useState('single');

    // Campus selection state
    const [campuses, setCampuses] = useState<any[]>([]);
    const [showCampusModal, setShowCampusModal] = useState(false);
    const [isLoadingCampuses, setIsLoadingCampuses] = useState(false);

    // Confirmation Dialog States
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showCampusConfirm, setShowCampusConfirm] = useState(false);
    const [pendingCampus, setPendingCampus] = useState<any>(null);

    // History State
    const [history, setHistory] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [totalHistoryCount, setTotalHistoryCount] = useState(0);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    useEffect(() => {
        fetchHistory(true);
    }, []);

    const fetchHistory = async (isInitial: boolean = true) => {
        if (isInitial) setHistoryLoading(true);
        else setLoadingMore(true);

        try {
            const token = await getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
            const currentCount = isInitial ? 0 : history.length;
            const limit = 10;
            const res = await paymentService.getPaymentHistory(limit, currentCount, token || undefined);

            if (res.success) {
                if (isInitial) {
                    setHistory(res.payments || []);
                } else {
                    setHistory(prev => [...prev, ...(res.payments || [])]);
                }
                setTotalHistoryCount(res.total_count || 0);
            }
        } catch (error) {
            console.error('History fetch error:', error);
        } finally {
            setHistoryLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (showCampusModal) {
            fetchCampuses();
        }
    }, [showCampusModal]);

    const fetchCampuses = async () => {
        setIsLoadingCampuses(true);
        try {
            const result = await authService.getCampuses();
            if (result.success) {
                setCampuses(result.campuses);
            }
        } catch (error) {
            console.error('Failed to load campuses');
        } finally {
            setIsLoadingCampuses(false);
        }
    };

    const handleCampusSelect = (campus: any) => {
        setPendingCampus(campus);
        setShowCampusConfirm(true);
    };

    const confirmCampusChange = () => {
        if (pendingCampus) {
            dispatch(selectCampus({ code: pendingCampus.code, name: pendingCampus.name }));
            setShowCampusModal(false);
        }
    };

    const handleLogout = () => {
        setShowLogoutConfirm(true);
    };

    return (
        <View style={[styles.container, isDarkMode && styles.containerDark]}>
            <AppHeader title="Settings" showBack={true} />

            <ScrollView contentContainerStyle={styles.content}>

                {/* Profile Section */}
                <View style={[styles.profileHeader, isDarkMode && styles.cardDark]}>
                    <Avatar.Text
                        size={64}
                        label={getInitials(name)}
                        style={{ backgroundColor: getAvatarColor(name) }}
                    />
                    <View style={styles.profileInfo}>
                        <Text variant="titleLarge" style={[{ fontWeight: 'bold' }, isDarkMode && styles.textDark]}>{name}</Text>
                        <View style={styles.campusRow}>
                            <Icon name="map-marker" size={14} color={theme.colors.primary} />
                            <Text variant="bodyMedium" style={{ color: isDarkMode ? '#AAA' : '#666' }}>{campusName || 'No Campus Selected'}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setShowCampusModal(true)}>
                            <Text style={{ color: theme.colors.primary, marginTop: 4, fontWeight: 'bold' }}>Switch Campus</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Section: App Settings */}
                <View style={[styles.section, isDarkMode && styles.cardDark]}>
                    <Text variant="titleSmall" style={styles.sectionTitle}>App Settings</Text>

                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <Icon name="theme-light-dark" size={24} color={isDarkMode ? 'white' : '#666'} />
                            <Text variant="bodyLarge" style={[styles.rowLabel, isDarkMode && styles.textDark]}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={isDarkMode}
                            onValueChange={setIsDarkMode}
                            trackColor={{ false: '#767577', true: theme.colors.primary }}
                            thumbColor={isDarkMode ? 'white' : '#f4f3f4'}
                        />
                    </View>

                    <Divider style={[styles.divider, isDarkMode && { backgroundColor: '#444' }]} />

                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <Icon name="bell-outline" size={24} color={isDarkMode ? 'white' : '#666'} />
                            <Text variant="bodyLarge" style={[styles.rowLabel, isDarkMode && styles.textDark]}>Notifications</Text>
                        </View>
                        <Switch
                            value={notifications}
                            onValueChange={setNotifications}
                            trackColor={{ false: '#767577', true: theme.colors.primary }}
                            thumbColor={notifications ? 'white' : '#f4f3f4'}
                        />
                    </View>
                </View>

                {/* Section: Print Defaults */}
                <View style={[styles.section, isDarkMode && styles.cardDark]}>
                    <Text variant="titleSmall" style={styles.sectionTitle}>System Defaults</Text>

                    <View style={styles.settingBlock}>
                        <Text variant="bodyMedium" style={{ marginBottom: 8, color: isDarkMode ? '#CCC' : '#444' }}>Default Color Mode</Text>
                        <SegmentedButtons
                            value={defaultColor}
                            onValueChange={setDefaultColor}
                            buttons={[
                                { value: 'bw', label: 'Black & White' },
                                { value: 'color', label: 'Color' },
                            ]}
                            density="small"
                        />
                    </View>

                    <View style={styles.settingBlock}>
                        <Text variant="bodyMedium" style={{ marginBottom: 8, color: isDarkMode ? '#CCC' : '#444' }}>Default Sides</Text>
                        <SegmentedButtons
                            value={defaultSides}
                            onValueChange={setDefaultSides}
                            buttons={[
                                { value: 'single', label: 'Single Sided' },
                                { value: 'double', label: 'Double Sided' },
                            ]}
                            density="small"
                        />
                    </View>
                </View>

                {/* Order History Section */}
                <View style={[styles.section, isDarkMode && styles.cardDark]}>
                    <View style={styles.sectionHeader}>
                        <Text variant="titleSmall" style={styles.sectionTitle}>Order History</Text>
                        <TouchableOpacity onPress={() => fetchHistory(true)} disabled={historyLoading || loadingMore}>
                            <Icon name="refresh" size={18} color={theme.colors.primary} style={{ opacity: (historyLoading || loadingMore) ? 0.5 : 1 }} />
                        </TouchableOpacity>
                    </View>

                    {historyLoading && history.length === 0 ? (
                        <ActivityIndicator style={{ marginVertical: 20 }} />
                    ) : history.length === 0 ? (
                        <View style={styles.emptyHistory}>
                            <Icon name="history" size={40} color="#DDD" />
                            <Text variant="bodySmall" style={{ color: '#AAA', marginTop: 8 }}>No orders yet</Text>
                        </View>
                    ) : (
                        <View style={styles.historyList}>
                            {history.map((payment: any, index: number) => {
                                const isExpanded = expandedOrder === payment.transaction_id;
                                const date = new Date(payment.initiated_at).toLocaleDateString('en-IN', {
                                    day: '2-digit', month: 'short', year: 'numeric'
                                });
                                const statusColor = payment.status === 'success' ? '#2ECC71' :
                                    payment.status === 'failed' ? '#E74C3C' : '#F1C40F';

                                return (
                                    <View key={payment.transaction_id || index}>
                                        <TouchableOpacity
                                            style={styles.historyItem}
                                            onPress={() => setExpandedOrder(isExpanded ? null : payment.transaction_id)}
                                        >
                                            <View style={[styles.statusIndicator, { backgroundColor: statusColor + '20' }]}>
                                                <Icon
                                                    name={payment.status === 'success' ? 'check' : payment.status === 'failed' ? 'close' : 'clock-outline'}
                                                    size={16}
                                                    color={statusColor}
                                                />
                                            </View>
                                            <View style={{ flex: 1, marginLeft: 12 }}>
                                                <Text variant="bodyMedium" style={[{ fontWeight: '600' }, isDarkMode && styles.textDark]}>
                                                    ₹{payment.amount}
                                                </Text>
                                                <Text variant="bodySmall" style={{ color: '#888' }}>{date}</Text>
                                            </View>
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <Text variant="labelSmall" style={{ color: statusColor, textTransform: 'uppercase', fontWeight: 'bold' }}>
                                                    {payment.status}
                                                </Text>
                                                <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} size={20} color="#CCC" />
                                            </View>
                                        </TouchableOpacity>

                                        {isExpanded && (
                                            <View style={styles.expandedDetails}>
                                                <View style={styles.detailRow}>
                                                    <Text variant="labelSmall" style={styles.detailLabel}>Txn ID:</Text>
                                                    <Text variant="labelSmall" style={styles.detailValue}>{payment.transaction_id || 'N/A'}</Text>
                                                </View>
                                                <View style={styles.detailRow}>
                                                    <Text variant="labelSmall" style={styles.detailLabel}>Method:</Text>
                                                    <Text variant="labelSmall" style={styles.detailValue}>{payment.payment_method} ({payment.payment_provider || 'UPI'})</Text>
                                                </View>
                                                {payment.upi_transaction_id && (
                                                    <View style={styles.detailRow}>
                                                        <Text variant="labelSmall" style={styles.detailLabel}>UPI Ref:</Text>
                                                        <Text variant="labelSmall" style={styles.detailValue}>{payment.upi_transaction_id}</Text>
                                                    </View>
                                                )}
                                                {payment.failure_reason && (
                                                    <Text variant="labelSmall" style={{ color: '#E74C3C', marginTop: 4 }}>
                                                        Error: {payment.failure_reason}
                                                    </Text>
                                                )}
                                            </View>
                                        )}
                                        {index < history.length - 1 && <Divider style={{ marginVertical: 4, opacity: 0.5 }} />}
                                    </View>
                                );
                            })}

                            {history.length < totalHistoryCount && (
                                <Button
                                    mode="text"
                                    onPress={() => fetchHistory(false)}
                                    loading={loadingMore}
                                    style={{ alignSelf: 'center', marginTop: 12 }}
                                    labelStyle={{ fontSize: 13 }}
                                >
                                    Load More
                                </Button>
                            )}
                        </View>
                    )}
                </View>

                {/* Section: App Settings */}

                <Text style={styles.versionText}>Version 1.0.2 (Build 45)</Text>

            </ScrollView>

            {/* Campus Selection Modal */}
            <Portal>
                <Modal
                    visible={showCampusModal}
                    onDismiss={() => setShowCampusModal(false)}
                    contentContainerStyle={styles.modalContent}
                >
                    <Text variant="titleLarge" style={styles.modalTitle}>Choose Campus</Text>
                    <ScrollView style={styles.campusList}>
                        {isLoadingCampuses ? <ActivityIndicator animating={true} style={{ marginVertical: 20 }} /> :
                            campuses.map((campus) => (
                                <List.Item
                                    key={campus.id}
                                    title={campus.name}
                                    description={campus.address}
                                    left={props => <List.Icon {...props} icon="map-marker-outline" />}
                                    onPress={() => handleCampusSelect(campus)}
                                    style={[
                                        styles.campusItem,
                                        campusCode === campus.code && { backgroundColor: theme.colors.primary + '10' }
                                    ]}
                                />
                            ))}
                    </ScrollView>
                    <Button onPress={() => setShowCampusModal(false)}>Close</Button>
                </Modal>
            </Portal>

            {/* Logout Confirmation */}
            <ConfirmationDialog
                visible={showLogoutConfirm}
                onDismiss={() => setShowLogoutConfirm(false)}
                title="Logout"
                description="Are you sure you want to log out? You'll need to sign in again to use JusPrint."
                confirmLabel="Yes, Logout"
                onConfirm={() => dispatch(logoutUser())}
                icon="logout"
                type="destructive"
            />

            {/* Campus Change Confirmation */}
            <ConfirmationDialog
                visible={showCampusConfirm}
                onDismiss={() => setShowCampusConfirm(false)}
                title="Switch Campus?"
                description={pendingCampus ? `Do you want to switch your primary campus to ${pendingCampus.name}?` : ''}
                confirmLabel="Switch"
                onConfirm={confirmCampusChange}
                icon="map-marker-distance"
                type="primary"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F5F9' },
    content: { padding: 16, paddingBottom: 40 },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 16,
        elevation: 2,
    },
    profileInfo: { marginLeft: 16, flex: 1 },
    campusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    section: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        elevation: 1,
    },
    sectionTitle: {
        color: '#888',
        marginBottom: 16,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontSize: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    rowLabel: {
        color: '#333',
    },
    divider: {
        marginVertical: 12,
    },
    settingBlock: {
        marginBottom: 16,
    },
    versionText: {
        textAlign: 'center',
        color: '#AAA',
        fontSize: 12,
    },
    containerDark: { backgroundColor: '#121212' },
    cardDark: { backgroundColor: '#1E1E1E' },
    textDark: { color: 'white' },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 16,
        maxHeight: '80%',
    },
    modalTitle: { fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
    campusList: { marginBottom: 16 },
    campusItem: { borderRadius: 8, marginVertical: 2 },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyHistory: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    historyList: {
        marginTop: 4,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    statusIndicator: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    expandedDetails: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabel: {
        color: '#888',
        fontWeight: 'bold',
    },
    detailValue: {
        color: '#444',
    },
});
