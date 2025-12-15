import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, Card, useTheme, Button, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppHeader } from '../../components/common/AppHeader';

export const ServicesHub = ({ navigation }: { navigation: any }) => {
    const theme = useTheme();

    const SERVICES = [
        {
            id: 'pcb',
            title: 'PCB Manufacturing',
            desc: 'Upload Gerber files. FR4, Aluminum, Rigid-Flex.',
            icon: 'expansion-card',
            color: '#2ECC71',
            badge: 'Instant Quote',
            route: 'PCBOrder',
        },
        {
            id: '3d',
            title: '3D Printing',
            desc: 'FDM & SLA. PLA, ABS, PETG materials available.',
            icon: 'printer-3d',
            color: '#FF9F43',
            badge: 'High Precision',
            route: 'Print3D',
        },
        {
            id: 'components',
            title: 'Components Store',
            desc: 'Sensors, Boards, Wires & More.',
            icon: 'resistor',
            color: '#54A0FF',
            badge: 'Fast Delivery',
            route: 'ComponentsStore',
        },
    ];

    return (
        <View style={styles.container}>
            <AppHeader title="Services" subtitle="Fab Lab & Manufacturing" />
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
                <Text variant="headlineMedium" style={styles.header}>Fab Lab Services</Text>
                <Text variant="bodyLarge" style={styles.subHeader}>Professional manufacturing for students.</Text>

                {SERVICES.map(service => (
                    <Card key={service.id} style={styles.serviceCard} mode="elevated">
                        <View style={styles.cardContent}>
                            <View style={[styles.iconBox, { backgroundColor: service.color + '15' }]}>
                                <Icon name={service.icon} size={40} color={service.color} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{service.title}</Text>
                                    <Chip textStyle={{ fontSize: 10, height: 16, lineHeight: 16 }} style={{ height: 24, backgroundColor: service.color + '20' }}>{service.badge}</Chip>
                                </View>
                                <Text variant="bodySmall" style={{ color: '#666', marginTop: 4 }}>{service.desc}</Text>
                                <Button
                                    mode="outlined"
                                    style={{ marginTop: 12, borderColor: service.color }}
                                    textColor={service.color}
                                    labelStyle={{ fontWeight: 'bold', fontSize: 12 }}
                                    compact
                                    onPress={() => service.route && navigation.navigate(service.route)}
                                    disabled={!service.route}
                                >
                                    {service.route ? 'Select Service' : 'Coming Soon'}
                                </Button>
                            </View>
                        </View>
                    </Card>
                ))}

                {/* Promo for Bulk Orders */}
                <Card style={styles.promoCard}>
                    <Card.Content>
                        <Icon name="factory" size={32} color="white" style={{ marginBottom: 8 }} />
                        <Text variant="titleMedium" style={{ color: 'white', fontWeight: 'bold' }}>Bulk Manufacturing?</Text>
                        <Text variant="bodyMedium" style={{ color: 'rgba(255,255,255,0.9)' }}>Get special discounts for college fests and large batch PCB orders.</Text>
                    </Card.Content>
                </Card>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F5F9' },
    header: { fontWeight: 'bold', marginBottom: 4 },
    subHeader: { color: '#666', marginBottom: 24 },
    serviceCard: {
        marginBottom: 16,
        backgroundColor: 'white',
        borderRadius: 16,
    },
    cardContent: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
    },
    iconBox: {
        width: 70,
        height: 70,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    promoCard: {
        marginTop: 8,
        backgroundColor: '#2C3A47',
        borderRadius: 16,
    }
});
