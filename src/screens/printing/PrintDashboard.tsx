import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, FlatList } from 'react-native';
import { Text, Card, useTheme, Button, Divider } from 'react-native-paper';
import { AppHeader } from '../../components/common/AppHeader';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { fetchHomeConfig } from '../../services/mockAdService';
import { HomeConfigResponse } from '../../types/ads';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data
const fetchLastUsedPrinter = async () => ({
    id: 'p1',
    name: 'Hp LaserJet Pro',
    location: 'Library – Ground Floor',
    status: 'Online',
    wait: '~2 min wait',
    isOnline: true,
    queueLength: 3,
});

const fetchRecentPrints = async () => [
    { id: 1, name: 'Project_Report.pdf', pages: 24, date: '2h ago', colorMode: 'bw', sides: 'single', timestamp: Date.now() - 7200000 },
    { id: 2, name: 'Assignment.docx', pages: 8, date: 'Yesterday', colorMode: 'color', sides: 'double', timestamp: Date.now() - 86400000 },
];

const QUICK_ACTIONS = [
    { id: 'scan', icon: 'qrcode-scan', label: 'Scan QR', color: '#4ECDC4' },
    { id: 'wallet', icon: 'wallet-plus', label: 'Add Money', color: '#FF9F43' },
    { id: 'printers', icon: 'printer-search', label: 'Printers', color: '#9B59B6' },
    { id: 'history', icon: 'history', label: 'History', color: '#3498DB' },
];

// Smart Carousel Generator
const generateSmartCards = (user: any, printer: any, recentPrints: any[]) => {
    const cards: any[] = [];
    const hour = new Date().getHours();

    // Priority 1: Uncollected Prints
    if (user?.uncollectedPrints > 0) {
        cards.push({
            id: 'collect',
            type: 'alert',
            title: 'Pick up your prints!',
            subtitle: `${user.uncollectedPrints} jobs waiting in Locker #${user.lockerNumber}`,
            icon: 'package-variant-closed',
            gradient: ['#9B59B6', '#8E44AD'],
            action: 'view_locker',
        });
    }

    // Priority 2: Low Wallet Balance
    if (user?.walletBalance < 100) {
        cards.push({
            id: 'wallet',
            type: 'alert',
            title: `Low Balance: ₹${user.walletBalance}`,
            subtitle: 'Add ₹200 to continue printing seamlessly',
            icon: 'wallet-plus',
            gradient: ['#E74C3C', '#C0392B'],
            action: 'add_money',
        });
    }

    // Priority 3: High Traffic Alert
    if (printer?.queueLength > 5 && hour >= 9 && hour <= 17) {
        cards.push({
            id: 'traffic',
            type: 'alert',
            title: 'High Traffic Alert',
            subtitle: `${printer.queueLength} jobs ahead • Try nearby printers`,
            icon: 'alert-circle',
            gradient: ['#FF9F43', '#EE8629'],
            action: 'find_printer',
        });
    }

    // Priority 4: Quick Reprint (Last 24 hours)
    const lastPrint = recentPrints[0];
    if (lastPrint && (Date.now() - lastPrint.timestamp) < 86400000) {
        cards.push({
            id: 'reprint',
            type: 'action',
            title: 'Quick Reprint',
            subtitle: `${lastPrint.name} • ${lastPrint.pages}p`,
            icon: 'refresh',
            gradient: ['#3498DB', '#2980B9'],
            action: 'reprint',
            data: lastPrint,
        });
    }

    // Priority 5: Active Offer
    if (cards.length < 2) {
        cards.push({
            id: 'offer',
            type: 'offer',
            title: '50% OFF Color Prints',
            subtitle: 'Valid till midnight • Use code COLOR50',
            icon: 'tag-multiple',
            gradient: ['#FF6B35', '#F7931E'],
            action: 'apply_offer',
        });
    }

    // Priority 6: Engagement Stats
    if (cards.length < 2 && user?.monthlyPages) {
        cards.push({
            id: 'stats',
            type: 'stats',
            title: 'Your Print Stats',
            subtitle: `${user.monthlyPages} pages this month • ₹${user.monthlySpent} spent`,
            icon: 'chart-line',
            gradient: ['#2ECC71', '#27AE60'],
            action: 'view_stats',
        });
    }

    // Priority 7: Pro Tip (Fallback)
    if (cards.length === 0) {
        cards.push({
            id: 'tip',
            type: 'tip',
            title: 'Pro Tip: Use Duplex Printing',
            subtitle: 'Save 50% paper + get 20% discount',
            icon: 'lightbulb-on',
            gradient: ['#4ECDC4', '#44A9A3'],
            action: 'learn_more',
        });
    }

    return cards.slice(0, 3); // Max 3 cards
};

export const PrintDashboard = ({ navigation, route }: { navigation: any; route: any }) => {
    const theme = useTheme();
    const [adConfig, setAdConfig] = useState<HomeConfigResponse | null>(null);
    const [selectedPrinter, setSelectedPrinter] = useState<any>(null);
    const [recentPrints, setRecentPrints] = useState<any[]>([]);
    const [smartCards, setSmartCards] = useState<any[]>([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);

    // Mock user data (replace with actual user context)
    const mockUser = {
        walletBalance: 85,
        uncollectedPrints: 0,
        lockerNumber: 7,
        monthlyPages: 320,
        monthlySpent: 280,
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (route.params?.selectedPrinter) {
            setSelectedPrinter(route.params.selectedPrinter);
        }
    }, [route.params?.selectedPrinter]);

    // Regenerate smart cards when data changes
    useEffect(() => {
        if (selectedPrinter && recentPrints.length > 0) {
            const cards = generateSmartCards(mockUser, selectedPrinter, recentPrints);
            setSmartCards(cards);
        }
    }, [selectedPrinter, recentPrints]);

    const loadData = async () => {
        const [ads, printer, prints] = await Promise.all([
            fetchHomeConfig(),
            fetchLastUsedPrinter(),
            fetchRecentPrints(),
        ]);
        setAdConfig(ads);
        if (!selectedPrinter) setSelectedPrinter(printer);
        setRecentPrints(prints);
    };

    const handleUpload = () => {
        navigation.navigate('DocumentUpload', { printer: selectedPrinter });
    };

    const handleCardAction = (card: any) => {
        switch (card.action) {
            case 'view_locker':
                navigation.navigate('LockerMap', { lockerId: mockUser.lockerNumber });
                break;
            case 'add_money':
                navigation.navigate('Wallet', { autoAmount: 200 });
                break;
            case 'find_printer':
                navigation.navigate('PrinterSelection', { sortBy: 'availability' });
                break;
            case 'reprint':
                navigation.navigate('DocumentUpload', { document: card.data });
                break;
            case 'view_stats':
                navigation.navigate('Analytics');
                break;
            default:
                console.log('Card action:', card.action);
        }
    };

    const handleCarouselScroll = (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(offsetX / (SCREEN_WIDTH - 32));
        setCurrentCardIndex(index);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <AppHeader
                showLogo={true}
                showWallet={true}
                subtitle="Smart Printing Service"
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* 1. PRIMARY CTA - Upload & Print (With Printer Selection) */}
                <Card style={[styles.uploadCard, { backgroundColor: theme.colors.primary }]}>
                    <TouchableOpacity
                        onPress={handleUpload}
                        activeOpacity={0.9}
                        style={styles.uploadMain}
                    >
                        <View style={styles.uploadIconCircle}>
                            <Icon name="cloud-upload" size={32} color={theme.colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text variant="titleLarge" style={{ color: 'white', fontWeight: 'bold' }}>Upload & Print</Text>
                            <Text variant="bodySmall" style={{ color: 'rgba(255,255,255,0.9)' }}>
                                PDF, DOCX, PPT • Instant
                            </Text>
                        </View>
                        <Icon name="arrow-right-circle" size={32} color="white" />
                    </TouchableOpacity>

                    {/* Integrated Printer Selection */}
                    <View style={styles.printerSelector}>
                        <TouchableOpacity
                            style={styles.printerRow}
                            onPress={() => navigation.navigate('PrinterSelection')}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                                <Icon name="printer" size={16} color="rgba(255,255,255,0.8)" />
                                <View>
                                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>
                                        {selectedPrinter?.location || 'Select Printer'}
                                    </Text>
                                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>
                                        {selectedPrinter?.name || 'Tap to select'} • {selectedPrinter?.status || 'Offline'}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.changeButton}>
                                <Text style={{ color: theme.colors.primary, fontSize: 10, fontWeight: 'bold' }}>CHANGE</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </Card>

                {/* 3. Quick Actions (Subtle with Color) */}
                <View style={styles.quickActionRow}>
                    {QUICK_ACTIONS.map(action => (
                        <TouchableOpacity
                            key={action.id}
                            style={styles.quickActionItem}
                            onPress={() => {
                                if (action.id === 'scan') console.log('Scan');
                                if (action.id === 'history') navigation.navigate('JobStatus');
                                if (action.id === 'printers') navigation.navigate('PrinterSelection');
                                if (action.id === 'wallet') navigation.navigate('Wallet');
                            }}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.quickActionIcon, { backgroundColor: action.color + '15' }]}>
                                <Icon name={action.icon} size={20} color={action.color} />
                            </View>
                            <Text style={styles.quickActionLabel}>{action.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 4. Smart Carousel (Dynamic Content) */}
                {smartCards.length > 0 && (
                    <View style={styles.carouselSection}>
                        <FlatList
                            data={smartCards}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={handleCarouselScroll}
                            scrollEventThrottle={16}
                            snapToInterval={SCREEN_WIDTH - 32}
                            decelerationRate="fast"
                            contentContainerStyle={styles.carouselContainer}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.carouselCard}
                                    onPress={() => handleCardAction(item)}
                                    activeOpacity={0.85}
                                >
                                    <LinearGradient
                                        colors={item.gradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.carouselGradient}
                                    >
                                        <View style={styles.carouselIconCircle}>
                                            <Icon name={item.icon} size={24} color="white" />
                                        </View>
                                        <View style={styles.carouselTextBlock}>
                                            <Text style={styles.carouselTitle}>{item.title}</Text>
                                            <Text style={styles.carouselSubtitle}>{item.subtitle}</Text>
                                        </View>
                                        <View style={styles.carouselArrow}>
                                            <Icon name="chevron-right" size={20} color="rgba(255,255,255,0.9)" />
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        />

                        {/* Carousel Dots */}
                        {smartCards.length > 1 && (
                            <View style={styles.dotsContainer}>
                                {smartCards.map((_, index) => (
                                    <View
                                        key={index}
                                        style={[
                                            styles.dot,
                                            index === currentCardIndex && styles.dotActive
                                        ]}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {/* 5. Recent Prints */}
                <View style={styles.recentSection}>
                    <View style={styles.sectionHeader}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Recent Prints</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('JobStatus')}>
                            <Text variant="bodySmall" style={{ color: theme.colors.primary }}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {recentPrints.map((item, index) => (
                        <View key={item.id}>
                            <TouchableOpacity
                                style={styles.recentRow}
                                onPress={() => navigation.navigate('DocumentUpload', { document: item })}
                            >
                                <View style={styles.recentIconBox}>
                                    <Icon
                                        name={item.name.includes('.pdf') ? 'file-pdf-box' : 'file-document'}
                                        size={28}
                                        color="#E74C3C"
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text variant="bodyMedium" style={{ fontWeight: '600' }}>{item.name}</Text>
                                    <Text variant="bodySmall" style={{ color: '#888' }}>
                                        {item.pages}p • {item.colorMode === 'bw' ? 'B&W' : 'Color'} • {item.date}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.reprintBtn}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        navigation.navigate('DocumentUpload', { document: item });
                                    }}
                                >
                                    <Icon name="refresh" size={18} color={theme.colors.primary} />
                                </TouchableOpacity>
                            </TouchableOpacity>
                            {index < recentPrints.length - 1 && <View style={styles.divider} />}
                        </View>
                    ))}
                </View>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F5F9' },
    scrollContent: { paddingBottom: 30 },

    // 1. Status Strip (Compact)
    statusStrip: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E8E8E8',
    },
    statusLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 8,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 13,
        color: '#666',
        flex: 1,
    },
    statusBold: {
        fontWeight: 'bold',
        color: '#1A1A2E',
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

    // 2. HERO BUTTON (Dominates Screen)
    heroButton: {
        marginHorizontal: 16,
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

    // 3. Quick Actions
    quickActionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    quickActionItem: {
        alignItems: 'center',
        width: (SCREEN_WIDTH - 32 - 36) / 4,
    },
    quickActionIcon: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    quickActionLabel: {
        fontSize: 11,
        fontWeight: '600',
        color: '#1A1A2E',
        textAlign: 'center',
    },

    // 4. Smart Carousel
    carouselSection: {
        marginBottom: 20,
        paddingLeft: 16,
    },
    carouselContainer: {
        paddingRight: 16,
    },
    carouselCard: {
        width: SCREEN_WIDTH - 32,
        marginRight: 0,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    carouselGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        gap: 12,
    },
    carouselIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    carouselTextBlock: {
        flex: 1,
    },
    carouselTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 3,
    },
    carouselSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
    },
    carouselArrow: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Carousel Dots
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#D0D0D0',
    },
    dotActive: {
        width: 20,
        backgroundColor: '#FF6B35',
    },

    // 5. Recent Prints
    recentSection: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 16,
        elevation: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    recentRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    recentIconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#FFEBEE',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
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
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 12,
        marginLeft: 60,
    },
    // Missing Styles
    uploadCard: {
        marginHorizontal: 16,
        marginTop: 20,
        borderRadius: 20,
        marginBottom: 20,
        elevation: 6,
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        overflow: 'hidden',
    },
    uploadMain: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    uploadIconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    printerSelector: {
        backgroundColor: 'rgba(0,0,0,0.1)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    printerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    changeButton: {
        backgroundColor: 'white',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
});
