import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions, FlatList } from 'react-native';
import { Text, Card, useTheme, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppHeader } from '../../components/common/AppHeader';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { fetchHomeConfig } from '../../services/mockAdService';
import { Skeleton, SkeletonCarousel, SkeletonListItem } from '../../components/common/Skeleton';
import { getSecureItem, STORAGE_KEYS } from '../../utils/secureStorage';
import NetInfo from "@react-native-community/netinfo";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { PrintStatusWidget } from '../../components/printing/PrintStatusWidget';
import { printerService } from '../../services/printerService';
import { paymentService } from '../../services/paymentService';
import { setPrinters, loadCachedPrinters } from '../../store/slices/printerSlice';
import { cacheService } from '../../services/cacheService';
import { AppDispatch } from '../../store';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 64;
const CARD_SPACING = 12;

const fetchRecentPrints = async (token?: string) => {
    if (!token) return [];
    try {
        const res = await paymentService.getPaymentHistory(5, 0, token);
        if (res.success && res.payments) {
            return res.payments
                .filter(p => p.status === 'success')
                .map(p => {
                    // Extract filename from description "Print: filename.pdf"
                    let fileName = p.description || 'Document';
                    if (fileName.startsWith('Print: ')) {
                        fileName = fileName.replace('Print: ', '');
                    }

                    const dateObj = new Date(p.initiated_at);

                    // Format relative date or simple date
                    const now = new Date();
                    const diffMs = now.getTime() - dateObj.getTime();
                    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                    let dateStr = dateObj.toLocaleDateString();

                    if (diffHrs < 24) {
                        dateStr = diffHrs === 0 ? 'Just now' : `${diffHrs}h ago`;
                    } else if (diffHrs < 48) {
                        dateStr = 'Yesterday';
                    }

                    return {
                        id: p.transaction_id,
                        name: fileName,
                        pages: 1, // Defaulting to 1 as it's not in the payment root
                        date: dateStr,
                        colorMode: 'bw',
                        sides: 'single',
                        timestamp: dateObj.getTime()
                    };
                });
        }
        return [];
    } catch (e) {
        console.error('Failed to fetch real history:', e);
        return [];
    }
};

const QUICK_ACTIONS = [
    { id: 'scan', icon: 'qrcode-scan', label: 'Scan QR', color: '#4ECDC4' },
    { id: 'printers', icon: 'printer-search', label: 'Printers', color: '#9B59B6' },
    { id: 'history', icon: 'history', label: 'History', color: '#3498DB' },
    { id: 'help', icon: 'help-circle', label: 'Help', color: '#FF9F43' },
];

const generateSmartCards = (user: any, printer: any, recentPrints: any[]) => {
    const cards: any[] = [];

    // Always adding a "Welcome" card first for consistency if data is sparse, 
    // or just rely on the smart logic. 
    // User said "first carousel different". Maybe they mean the style.
    // The previous implementation had consistent styles. 
    // I will ensure all cards follow the exact same style structure.

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

    const hour = new Date().getHours();
    const queueCount = printer?.status?.queue_count || 0;
    if (queueCount > 5 && hour >= 9 && hour <= 17) {
        cards.push({
            id: 'traffic',
            type: 'alert',
            title: 'High Traffic Alert',
            subtitle: `${queueCount} jobs ahead • Try nearby printers`,
            icon: 'alert-circle',
            gradient: ['#FF9F43', '#EE8629'],
            action: 'find_printer',
        });
    }

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

    cards.push({
        id: 'offer',
        type: 'offer',
        title: '50% OFF Color Prints',
        subtitle: 'Valid till midnight • Use code COLOR50',
        icon: 'tag-multiple',
        gradient: ['#FF6B35', '#F7931E'],
        action: 'apply_offer',
    });

    cards.push({
        id: 'tip',
        type: 'tip',
        title: 'Pro Tip: Duplex',
        subtitle: 'Save 50% paper + get 20% discount',
        icon: 'lightbulb-on',
        gradient: ['#4ECDC4', '#44A9A3'],
        action: 'learn_more',
    });

    return cards.slice(0, 5);
};

export const PrintDashboard = ({ navigation, route }: { navigation: any; route: any }) => {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch<AppDispatch>();
    const { activeJob } = useSelector((state: RootState) => state.print);
    const { campusCode } = useSelector((state: RootState) => state.auth);
    const { campusPrinters } = useSelector((state: RootState) => state.printer);

    // Data states
    const [selectedPrinter, setSelectedPrinter] = useState<any>(null);
    const [recentPrints, setRecentPrints] = useState<any[]>([]);
    const [smartCards, setSmartCards] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Carousel states
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const scrollTimerRef = useRef<any | null>(null);

    const mockUser = { uncollectedPrints: 0, lockerNumber: 7, monthlyPages: 320 };

    useEffect(() => {
        dispatch(loadCachedPrinters());
        loadData();
    }, []);

    useEffect(() => {
        if (route.params?.selectedPrinter) {
            setSelectedPrinter(route.params.selectedPrinter);
        }
    }, [route.params?.selectedPrinter]);

    useEffect(() => {
        if (selectedPrinter) {
            const cards = generateSmartCards(mockUser, selectedPrinter, recentPrints);
            setSmartCards(cards);
        }
    }, [selectedPrinter, recentPrints]);

    // Auto-scroll logic
    useEffect(() => {
        if (smartCards.length > 1) {
            startAutoScroll();
        }
        return () => stopAutoScroll();
    }, [smartCards, currentCardIndex]);

    const startAutoScroll = () => {
        stopAutoScroll(); // Clear existing
        scrollTimerRef.current = setInterval(() => {
            if (flatListRef.current) {
                let nextIndex = currentCardIndex + 1;
                if (nextIndex >= smartCards.length) {
                    nextIndex = 0;
                }
                flatListRef.current.scrollToIndex({
                    index: nextIndex,
                    animated: true,
                    viewPosition: 0, // Aligns content start to viewport start
                    viewOffset: 0 // Optional offset
                });
                setCurrentCardIndex(nextIndex);
            }
        }, 4000); // 4 seconds
    };

    const stopAutoScroll = () => {
        if (scrollTimerRef.current) {
            clearInterval(scrollTimerRef.current);
            scrollTimerRef.current = null;
        }
    };

    const loadData = async () => {
        setIsLoading(true);
        try {
            const netInfo = await NetInfo.fetch();
            const token = await getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);

            // Load from cache first if offline
            if (!netInfo.isConnected) {
                console.log('[Dashboard] Offline mode detected');
                // loadRecentPrintsFromCache? For now use what we have
                const cachedDocs = await cacheService.getCachedFiles();
                if (cachedDocs.length > 0) {
                    setRecentPrints(cachedDocs.map(d => ({
                        id: d.localPath,
                        name: d.originalName,
                        date: new Date(d.addedAt).toLocaleDateString(),
                        timestamp: d.addedAt,
                        isCached: true
                    })));
                }
                setIsLoading(false);
                return;
            }

            const [ads, prints] = await Promise.all([
                fetchHomeConfig(),
                fetchRecentPrints(token || undefined),
            ]);

            setRecentPrints(prints);

            // Fetch real printers for the campus
            if (campusCode) {
                const res = await printerService.getPrintersByCampus(campusCode);
                if (res.success && res.printers.length > 0) {
                    dispatch(setPrinters(res.printers));
                    if (!selectedPrinter) setSelectedPrinter(res.printers[0]);
                }
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = () => {
        navigation.navigate('DocumentUpload', { selectedPrinter: selectedPrinter });
    };

    const handleCardAction = (card: any) => {
        switch (card.action) {
            case 'view_locker':
                console.log('Navigate to LockerMap');
                break;
            case 'find_printer':
                navigation.navigate('PrinterSelection', { sortBy: 'availability' });
                break;
            case 'reprint':
                navigation.navigate('DocumentUpload', { document: card.data });
                break;
            case 'view_stats':
                console.log('Navigate to Analytics');
                break;
            default:
                console.log('Card action:', card.action);
        }
    };

    // Handle manual scroll to update index and pause auto-scroll
    const handleScroll = (event: any) => {
        const offsetX = event.nativeEvent.contentOffset.x;
        // Logic to determine current index based on offset
        // Using approximate width including margin
        const cardFullWidth = CARD_WIDTH + (smartCards.length > 1 ? 12 : 0);
        const index = Math.round(offsetX / cardFullWidth);

        if (index !== currentCardIndex && index >= 0 && index < smartCards.length) {
            setCurrentCardIndex(index);
        }
    };

    return (
        <View style={styles.container}>
            <AppHeader
                showLogo={true}
                subtitle="Smart Printing Service"
            />

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* 1. PRIMARY CTA */}
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

                    {/* Printer Selection */}
                    {isLoading ? (
                        <View style={styles.printerSelector}>
                            <Skeleton height={40} borderRadius={8} />
                        </View>
                    ) : (
                        <View style={styles.printerSelector}>
                            <TouchableOpacity
                                style={styles.printerRow}
                                onPress={() => navigation.navigate('PrinterSelection', { returnRoute: 'Print' })}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                                    <Icon name="printer" size={16} color="rgba(255,255,255,0.8)" />
                                    <View>
                                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13 }}>
                                            {selectedPrinter?.location || 'Select Printer'}
                                        </Text>
                                        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11 }}>
                                            {selectedPrinter?.name || 'Tap to select'} • {selectedPrinter?.status?.status || 'Offline'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.changeButton}>
                                    <Text style={{ color: theme.colors.primary, fontSize: 10, fontWeight: 'bold' }}>CHANGE</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}
                </Card>

                {/* 2. Quick Actions */}
                <View style={styles.quickActionRow}>
                    {QUICK_ACTIONS.map(action => (
                        <TouchableOpacity
                            key={action.id}
                            style={styles.quickActionItem}
                            onPress={() => {
                                if (action.id === 'scan') console.log('Scan');
                                if (action.id === 'history') navigation.navigate('JobStatus');
                                if (action.id === 'printers') navigation.navigate('PrinterSelection', { returnRoute: 'Print' });
                                if (action.id === 'help') console.log('Help');
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

                {/* 3. Smart Carousel */}
                {isLoading ? (
                    <SkeletonCarousel />
                ) : smartCards.length > 0 && (
                    <View style={styles.carouselSection}>
                        <FlatList
                            ref={flatListRef}
                            data={smartCards}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            onScroll={handleScroll}
                            onScrollBeginDrag={stopAutoScroll}
                            onScrollEndDrag={startAutoScroll}
                            scrollEventThrottle={16}
                            snapToInterval={CARD_WIDTH + 12} // Width + margin
                            decelerationRate="fast"
                            contentContainerStyle={styles.carouselContainer}
                            keyExtractor={(item) => item.id}
                            getItemLayout={(data, index) => ({
                                length: CARD_WIDTH + 12,
                                offset: (CARD_WIDTH + 12) * index,
                                index,
                            })}
                            renderItem={({ item, index }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.carouselCard,
                                        { marginRight: index === smartCards.length - 1 ? 24 : 12 }
                                    ]}
                                    onPress={() => handleCardAction(item)}
                                    activeOpacity={0.9}
                                >
                                    <LinearGradient
                                        colors={item.gradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.carouselGradient}
                                    >
                                        <View style={styles.carouselDecor1} />
                                        <View style={styles.carouselDecor2} />

                                        <View style={styles.carouselContent}>
                                            <View style={styles.carouselIconCircle}>
                                                <Icon name={item.icon} size={28} color="white" />
                                            </View>
                                            <View style={styles.carouselTextBlock}>
                                                <Text style={styles.carouselTitle}>{item.title}</Text>
                                                <Text style={styles.carouselSubtitle} numberOfLines={2}>{item.subtitle}</Text>
                                            </View>
                                            <View style={styles.carouselArrow}>
                                                <Icon name="arrow-right" size={18} color="white" />
                                            </View>
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        />

                        {/* Dots */}
                        {smartCards.length > 1 && (
                            <View style={styles.dotsContainer}>
                                {smartCards.map((_, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => {
                                            flatListRef.current?.scrollToIndex({ index, animated: true });
                                            setCurrentCardIndex(index);
                                        }}
                                    >
                                        <View
                                            style={[
                                                styles.dot,
                                                index === currentCardIndex && styles.dotActive
                                            ]}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {/* 4. Recent Prints */}
                <View style={styles.recentSection}>
                    <View style={styles.sectionHeader}>
                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Recent Prints</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('JobStatus')}>
                            <Text variant="bodySmall" style={{ color: theme.colors.primary }}>View All</Text>
                        </TouchableOpacity>
                    </View>

                    {isLoading ? (
                        <>
                            <SkeletonListItem />
                            <SkeletonListItem />
                        </>
                    ) : (
                        recentPrints.map((item, index) => (
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
                        ))
                    )}
                </View>

            </ScrollView>

            {/* Zomato-style Floating Widget */}
            <PrintStatusWidget navigation={navigation} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F5F9' },
    scrollContent: { paddingBottom: 30 },
    // ... existing styles ...
    uploadCard: {
        marginHorizontal: 16,
        marginTop: 16,
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
    carouselSection: {
        marginBottom: 24,
    },
    carouselContainer: {
        paddingLeft: 16,
        paddingRight: 4, // Compensation for margin
    },
    carouselCard: {
        width: CARD_WIDTH,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        height: 120, // Enforce height
    },
    carouselGradient: {
        paddingVertical: 24,
        paddingHorizontal: 20,
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        justifyContent: 'center',
    },
    carouselContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        zIndex: 1,
    },
    carouselDecor1: {
        position: 'absolute',
        top: -30,
        right: -30,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    carouselDecor2: {
        position: 'absolute',
        bottom: -40,
        left: -20,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    carouselIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    carouselTextBlock: {
        flex: 1,
    },
    carouselTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
        letterSpacing: 0.3,
    },
    carouselSubtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 18,
    },
    carouselArrow: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 14,
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#D0D0D0',
    },
    dotActive: {
        width: 24,
        backgroundColor: '#1A1A2E',
        borderRadius: 4,
    },
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
});
