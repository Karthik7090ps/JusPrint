import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { AppHeader } from '../../components/common/AppHeader';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data (same as before)
const fetchPrinterStatus = async () => ({
    location: 'Library – Ground Floor',
    printersOnline: 3,
    printersTotal: 4,
    waitTime: '2 min',
    isOnline: true,
});

const fetchRecentPrints = async () => [
    { id: 1, name: 'Project_Report.pdf', pages: 24, date: '2 hrs ago', colorMode: 'bw', sides: 'single' },
    { id: 2, name: 'Assignment.docx', pages: 8, date: 'Yesterday', colorMode: 'color', sides: 'double' },
];

const QUICK_ACTIONS = [
    { id: 'scan', icon: 'qrcode-scan', label: 'Scan QR' },
    { id: 'wallet', icon: 'wallet-plus', label: 'Add' },
    { id: 'printers', icon: 'printer-search', label: 'Printers' },
    { id: 'history', icon: 'history', label: 'History' },
];

export const PrintDashboard = ({ navigation }: { navigation: any }) => {
    const theme = useTheme();
    const [printerStatus, setPrinterStatus] = useState<any>(null);
    const [recentPrints, setRecentPrints] = useState<any[]>([]);
    const [walletBalance] = useState(450);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [status, prints] = await Promise.all([
            fetchPrinterStatus(),
            fetchRecentPrints(),
        ]);
        setPrinterStatus(status);
        setRecentPrints(prints);
    };

    return (
        <View style={styles.container}>
            {/* Minimal Header - Like Zepto */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Icon name="printer" size={24} color="#FF6B35" />
                    <Text style={styles.appName}>JusPrint</Text>
                </View>
                <TouchableOpacity
                    style={styles.walletBadge}
                    onPress={() => navigation.navigate('Wallet')}
                >
                    <Icon name="wallet" size={14} color="#FF6B35" />
                    <Text style={styles.walletText}>₹{walletBalance}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* 1. COMPACT Status Strip - Subtle, Non-intrusive */}
                <TouchableOpacity
                    style={styles.statusStrip}
                    onPress={() => navigation.navigate('PrinterSelection')}
                    activeOpacity={0.8}
                >
                    <View style={styles.statusLeft}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>
                            <Text style={styles.statusBold}>{printerStatus?.printersOnline}</Text> printers online
                        </Text>
                        <Text style={styles.statusSeparator}>•</Text>
                        <Text style={styles.statusLocation}>{printerStatus?.location}</Text>
                    </View>
                    <View style={styles.statusRight}>
                        <Text style={styles.waitTime}>{printerStatus?.waitTime}</Text>
                        <Icon name="chevron-right" size={16} color="#999" />
                    </View>
                </TouchableOpacity>

                {/* 2. HERO BUTTON - 80% of Visual Weight */}
                <TouchableOpacity
                    style={styles.heroButton}
                    onPress={() => navigation.navigate('DocumentUpload')}
                    activeOpacity={0.92}
                >
                    <LinearGradient
                        colors={['#FF6B35', '#F7931E']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroGradient}
                    >
                        {/* Large Icon */}
                        <View style={styles.heroIconCircle}>
                            <Icon name="upload" size={36} color="white" />
                        </View>

                        {/* Text Content */}
                        <View style={styles.heroTextBlock}>
                            <Text style={styles.heroTitle}>Upload & Print</Text>
                            <Text style={styles.heroSubtitle}>PDF, DOCX, PPT • Instant print</Text>
                        </View>

                        {/* Arrow */}
                        <View style={styles.heroArrow}>
                            <Icon name="arrow-right-circle" size={48} color="white" />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {/* 3. Quick Actions - Compact, 4 Icons Only */}
                <View style={styles.quickActions}>
                    {QUICK_ACTIONS.map(action => (
                        <TouchableOpacity
                            key={action.id}
                            style={styles.quickAction}
                            onPress={() => {
                                if (action.id === 'printers') navigation.navigate('PrinterSelection');
                                if (action.id === 'history') navigation.navigate('JobStatus');
                                if (action.id === 'wallet') navigation.navigate('Wallet');
                            }}
                            activeOpacity={0.7}
                        >
                            <View style={styles.quickActionIcon}>
                                <Icon name={action.icon} size={20} color="#666" />
                            </View>
                            <Text style={styles.quickActionLabel}>{action.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 4. Offer Banner - Single Line, Collapsible */}
                <TouchableOpacity style={styles.offerBanner} activeOpacity={0.85}>
                    <Icon name="tag-multiple" size={18} color="#FF6B35" />
                    <Text style={styles.offerText}>50% OFF Color Prints</Text>
                    <Icon name="chevron-right" size={16} color="#FF6B35" />
                </TouchableOpacity>

                {/* 5. Recent Prints - Minimal Cards */}
                <View style={styles.recentSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Prints</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('JobStatus')}>
                            <Text style={styles.seeAll}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    {recentPrints.map((item, index) => (
                        <View
                            key={item.id}
                            style={[
                                styles.recentCard,
                                index < recentPrints.length - 1 && styles.cardMargin
                            ]}
                        >
                            {/* Left: Icon + Info */}
                            <View style={styles.recentLeft}>
                                <View style={styles.recentIcon}>
                                    <Icon
                                        name={item.name.includes('.pdf') ? 'file-pdf-box' : 'file-document'}
                                        size={24}
                                        color="#E74C3C"
                                    />
                                </View>
                                <View style={styles.recentInfo}>
                                    <Text style={styles.recentName} numberOfLines={1}>
                                        {item.name}
                                    </Text>
                                    <Text style={styles.recentMeta}>
                                        {item.pages}p • {item.colorMode === 'bw' ? 'B&W' : 'Color'} • {item.date}
                                    </Text>
                                </View>
                            </View>

                            {/* Right: Reprint Button */}
                            <TouchableOpacity
                                style={styles.reprintBtn}
                                onPress={() => navigation.navigate('DocumentUpload', { document: item })}
                            >
                                <Icon name="refresh" size={18} color="#FF6B35" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },

    // ===== HEADER (Minimal) =====
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    appName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF6B35',
    },
    walletBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5F0',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 16,
        gap: 4,
    },
    walletText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#FF6B35',
    },

    // ===== SCROLL VIEW =====
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },

    // ===== 1. STATUS STRIP (Compact) =====
    statusStrip: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    statusLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#2ECC71',
    },
    statusText: {
        fontSize: 13,
        color: '#666',
    },
    statusBold: {
        fontWeight: 'bold',
        color: '#1A1A2E',
    },
    statusSeparator: {
        color: '#CCC',
        fontSize: 12,
    },
    statusLocation: {
        fontSize: 13,
        color: '#666',
        flex: 1,
    },
    statusRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    waitTime: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FF6B35',
    },

    // ===== 2. HERO BUTTON (80% Visual Weight) =====
    heroButton: {
        marginBottom: 20,
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 12,
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
    },
    heroGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 28,
        paddingHorizontal: 20,
        gap: 16,
    },
    heroIconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroTextBlock: {
        flex: 1,
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
        letterSpacing: 0.3,
    },
    heroSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.95)',
        fontWeight: '500',
    },
    heroArrow: {
        opacity: 0.9,
    },

    // ===== 3. QUICK ACTIONS (Subtle) =====
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
        marginBottom: 16,
    },
    quickAction: {
        alignItems: 'center',
        width: (SCREEN_WIDTH - 32 - 36) / 4,
    },
    quickActionIcon: {
        width: 52,
        height: 52,
        borderRadius: 16,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    quickActionLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#666',
    },

    // ===== 4. OFFER BANNER (Single Line) =====
    offerBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5F0',
        paddingHorizontal: 14,
        paddingVertical: 11,
        borderRadius: 12,
        marginBottom: 20,
        gap: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#FF6B35',
    },
    offerText: {
        flex: 1,
        fontSize: 13,
        fontWeight: '700',
        color: '#FF6B35',
    },

    // ===== 5. RECENT PRINTS (Minimal Cards) =====
    recentSection: {
        flex: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A2E',
    },
    seeAll: {
        fontSize: 13,
        fontWeight: '600',
        color: '#FF6B35',
    },
    recentCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    cardMargin: {
        marginBottom: 8,
    },
    recentLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    recentIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#FFF5F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    recentInfo: {
        flex: 1,
    },
    recentName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A1A2E',
        marginBottom: 3,
    },
    recentMeta: {
        fontSize: 11,
        color: '#999',
    },
    reprintBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF5F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
});
