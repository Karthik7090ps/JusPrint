import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Card, Badge, useTheme, Button } from 'react-native-paper';

// Mock Data
const PRINTERS = [
    { id: '1', name: 'Library, 2nd Floor', status: 'Online', queue: 3, distance: '50m', waitTime: '2 mins' },
    { id: '2', name: 'Engineering Block A', status: 'Busy', queue: 12, distance: '200m', waitTime: '15 mins' },
    { id: '3', name: 'Hostel Block 4', status: 'Offline', queue: 0, distance: '500m', waitTime: '-' },
];

export const PrinterSelection = ({ navigation }: { navigation: any }) => {
    const theme = useTheme();

    const renderItem = ({ item }: { item: any }) => (
        <Card style={styles.card} onPress={() => navigation.navigate('PaymentScreen', { printerId: item.id })}>
            <Card.Content>
                <View style={styles.row}>
                    <View>
                        <Text variant="titleMedium" style={styles.printerName}>{item.name}</Text>
                        <Text variant="bodySmall">{item.distance} • ~{item.waitTime} wait</Text>
                    </View>
                    <Badge
                        style={{
                            backgroundColor: item.status === 'Online' ? theme.colors.primary :
                                item.status === 'Busy' ? (theme.colors as any).warning : theme.colors.error
                        }}
                    >
                        {item.status}
                    </Badge>
                </View>
                <View style={styles.detailsRow}>
                    <Text variant="bodySmall">Queue: {item.queue} jobs</Text>
                    {item.queue < 5 && item.status === 'Online' && <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Fastest</Text>}
                </View>
            </Card.Content>
        </Card>
    );

    return (
        <View style={styles.container}>
            {/* Map Placeholder */}
            <View style={styles.mapPlaceholder}>
                <Text>Map View Integrating...</Text>
                <Text variant="bodySmall">(Google Maps / Mapbox)</Text>
            </View>

            <View style={styles.listContainer}>
                <Text variant="titleMedium" style={styles.header}>Nearby Printers</Text>
                <FlatList
                    data={PRINTERS}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    mapPlaceholder: {
        height: 250,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        flex: 1,
        backgroundColor: 'white',
        marginTop: -20, // Overlap map slightly
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 20,
    },
    header: {
        paddingHorizontal: 16,
        marginBottom: 10,
        fontWeight: 'bold',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    card: {
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    printerName: {
        fontWeight: '600',
    },
    detailsRow: {
        marginTop: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
    }
});
