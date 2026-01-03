import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Card, Badge, useTheme, Button } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { printerService, Printer } from '../../services/printerService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const PrinterSelection = ({ navigation, route }: { navigation: any, route: any }) => {
    const theme = useTheme();
    const returnRoute = route.params?.returnRoute;
    const { campusCode, campusName } = useSelector((state: RootState) => state.auth);
    const [printers, setPrinters] = useState<Printer[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (campusCode) {
            fetchPrinters();
        } else {
            setIsLoading(false);
        }
    }, [campusCode]);

    const fetchPrinters = async () => {
        setIsLoading(true);
        try {
            const result = await printerService.getPrintersByCampus(campusCode!);
            if (result.success) {
                setPrinters(result.printers);
            }
        } catch (error) {
            console.error('Failed to load printers');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectPrinter = (item: Printer) => {
        if (returnRoute === 'Print') {
            // Fix nested navigation for MainTabs
            navigation.navigate('MainTabs', {
                screen: 'Print',
                params: { selectedPrinter: item }
            });
        } else if (returnRoute) {
            // Pass back document and settings if they were provided
            navigation.navigate(returnRoute, { 
                selectedPrinter: item,
                document: route.params?.document,
                presetSettings: route.params?.presetSettings
            });
        } else {
            // Default flow: If no return route, go to Document Upload with this printer
            navigation.navigate('DocumentUpload', { selectedPrinter: item });
        }
    };

    const renderItem = ({ item }: { item: Printer }) => (
        <Card
            style={styles.card}
            onPress={() => handleSelectPrinter(item)}
        >
            <Card.Content>
                <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                        <Text variant="titleMedium" style={styles.printerName}>{item.name}</Text>
                        <Text variant="bodySmall" style={{ color: '#666' }}>{item.location} • {item.model}</Text>
                        <View style={styles.statusRow}>
                            <Icon name="clock-outline" size={14} color="#888" />
                            <Text variant="bodySmall" style={styles.waitTime}>
                                ~{item.status.estimated_wait_minutes} mins wait
                            </Text>
                        </View>
                    </View>
                    <Badge
                        style={[
                            styles.badge,
                            {
                                backgroundColor: item.status.is_available ? '#2ECC71' : theme.colors.error
                            }
                        ]}
                    >
                        {item.status.status}
                    </Badge>
                </View>
                <Divider style={{ marginVertical: 10 }} />
                <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                        <Icon name="tray-full" size={16} color={theme.colors.primary} />
                        <Text variant="bodySmall">Queue: {item.status.queue_count}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Icon name="cash" size={16} color="#4CAF50" />
                        <Text variant="bodySmall">₹{item.pricing.price_bw_single}/pg (B&W)</Text>
                    </View>
                </View>
            </Card.Content>
        </Card>
    );

    if (!campusCode) {
        return (
            <View style={styles.emptyContainer}>
                <Icon name="map-marker-off" size={64} color="#DDD" />
                <Text variant="titleMedium" style={{ marginTop: 16, color: '#666' }}>No Campus Selected</Text>
                <Button mode="contained" onPress={() => navigation.navigate('Settings')} style={{ marginTop: 16 }}>
                    Select Campus in Settings
                </Button>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Campus Info Header */}
            <View style={[styles.campusHeader, { backgroundColor: theme.colors.primary }]}>
                <View>
                    <Text style={styles.campusLabel}>Current Campus</Text>
                    <Text style={styles.campusValue}>{campusName}</Text>
                </View>
                <IconButton
                    icon="refresh"
                    iconColor="white"
                    onPress={fetchPrinters}
                    disabled={isLoading}
                />
            </View>

            <View style={styles.listContainer}>
                <Text variant="titleMedium" style={styles.header}>Available Printers</Text>
                {isLoading ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
                ) : (
                    <FlatList
                        data={printers}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyList}>
                                <Text>No printers found for this campus.</Text>
                            </View>
                        }
                    />
                )}
            </View>
        </View>
    );
};

// Adding missing Paper imports
import { Divider, IconButton } from 'react-native-paper';

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    campusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingBottom: 40,
    },
    campusLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, textTransform: 'uppercase', fontWeight: 'bold' },
    campusValue: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    listContainer: {
        flex: 1, backgroundColor: 'white',
        marginTop: -20, borderTopLeftRadius: 20, borderTopRightRadius: 20,
        paddingTop: 20,
    },
    header: { paddingHorizontal: 16, marginBottom: 12, fontWeight: 'bold' },
    listContent: { paddingHorizontal: 16, paddingBottom: 20 },
    card: { marginBottom: 12, elevation: 1, borderRadius: 12 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    printerName: { fontWeight: 'bold' },
    badge: { paddingHorizontal: 8, height: 24, fontSize: 10, alignSelf: 'center' },
    statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
    waitTime: { color: '#888' },
    detailsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    emptyList: { alignItems: 'center', marginTop: 40 },
});
