import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Share as RNShare, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Card, Button, Chip, Divider, Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppHeader } from '../../components/common/AppHeader';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

export const EventDetails = ({ navigation, route }: { navigation: any; route: any }) => {
    const { eventId } = route.params;

    // Mock data - replace with API call
    const event = {
        id: eventId,
        title: 'Tech Fest 2024 - Hackathon',
        description: 'Join us for an exciting 24-hour hackathon where innovation meets technology. Build amazing projects, network with peers, and compete for prizes!',
        date: '2024-01-15',
        time: '09:00 AM',
        venue: 'Main Auditorium, CSE Block',
        category: 'Technical',
        status: 'active',
        maxCapacity: 200,
        registrations: 156,
        revenue: 7800,
        registrationFee: 50,
        createdAt: '2024-01-01',
        shareLink: 'https://campusconnect.app/e/abc123',
    };

    const [selectedTab, setSelectedTab] = useState<'overview' | 'registrations'>('overview');

    // Mock registrations
    const registrations = [
        { id: '1', name: 'John Doe', email: 'john@example.com', phone: '9876543210', registeredAt: '2024-01-10', status: 'confirmed' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '9876543211', registeredAt: '2024-01-11', status: 'confirmed' },
        { id: '3', name: 'Mike Johnson', email: 'mike@example.com', phone: '9876543212', registeredAt: '2024-01-12', status: 'pending' },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return '#10B981';
            case 'draft': return '#F59E0B';
            case 'closed': return '#6B7280';
            default: return '#6B7280';
        }
    };

    const handleShare = async () => {
        try {
            await RNShare.share({
                message: `Register for ${event.title}!\n\n${event.description}\n\nDate: ${event.date}\nVenue: ${event.venue}\n\nRegister now: ${event.shareLink}`,
                url: event.shareLink,
                title: event.title,
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            <AppHeader
                title="Event Details"
                subtitle={event.title}
                showBack
            />

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Event Header - Minimalist */}
                <View style={[styles.eventHeader, { backgroundColor: '#1A1A2E' }]}>
                    <View style={styles.statusRow}>
                        <Chip
                            icon="label"
                            style={[styles.statusChip, { backgroundColor: getStatusColor(event.status) }]}
                            textStyle={{ color: 'white', fontSize: 11, fontWeight: 'bold' }}
                        >
                            {event.status.toUpperCase()}
                        </Chip>
                        <Chip
                            icon="tag"
                            style={styles.categoryChip}
                            textStyle={{ fontSize: 11 }}
                        >
                            {event.category}
                        </Chip>
                    </View>

                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventDescription}>{event.description}</Text>

                    <View style={styles.quickStats}>
                        <View style={styles.quickStat}>
                            <Icon name="account-multiple" size={20} color="white" />
                            <Text style={styles.quickStatValue}>{event.registrations}</Text>
                            <Text style={styles.quickStatLabel}>Registered</Text>
                        </View>
                        <View style={styles.quickStat}>
                            <Icon name="account-check" size={20} color="white" />
                            <Text style={styles.quickStatValue}>{event.maxCapacity - event.registrations}</Text>
                            <Text style={styles.quickStatLabel}>Spots Left</Text>
                        </View>
                        <View style={styles.quickStat}>
                            <Icon name="currency-inr" size={20} color="white" />
                            <Text style={styles.quickStatValue}>₹{event.revenue}</Text>
                            <Text style={styles.quickStatLabel}>Revenue</Text>
                        </View>
                    </View>
                </View>

                {/* Tab Selection */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, selectedTab === 'overview' && styles.activeTab]}
                        onPress={() => setSelectedTab('overview')}
                    >
                        <Text style={[styles.tabText, selectedTab === 'overview' && styles.activeTabText]}>
                            Overview
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, selectedTab === 'registrations' && styles.activeTab]}
                        onPress={() => setSelectedTab('registrations')}
                    >
                        <Text style={[styles.tabText, selectedTab === 'registrations' && styles.activeTabText]}>
                            Registrations ({event.registrations})
                        </Text>
                    </TouchableOpacity>
                </View>

                {selectedTab === 'overview' ? (
                    <View style={styles.content}>
                        {/* Event Info */}
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text style={styles.cardTitle}>Event Information</Text>

                                <View style={styles.infoRow}>
                                    <Icon name="calendar" size={20} color="#1A1A2E" />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.infoLabel}>Date & Time</Text>
                                        <Text style={styles.infoValue}>{event.date} at {event.time}</Text>
                                    </View>
                                </View>

                                <Divider style={{ marginVertical: 12 }} />

                                <View style={styles.infoRow}>
                                    <Icon name="map-marker" size={20} color="#1A1A2E" />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.infoLabel}>Venue</Text>
                                        <Text style={styles.infoValue}>{event.venue}</Text>
                                    </View>
                                </View>

                                <Divider style={{ marginVertical: 12 }} />

                                <View style={styles.infoRow}>
                                    <Icon name="account-multiple" size={20} color="#1A1A2E" />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.infoLabel}>Capacity</Text>
                                        <Text style={styles.infoValue}>{event.registrations}/{event.maxCapacity} registered</Text>
                                    </View>
                                </View>

                                <Divider style={{ marginVertical: 12 }} />

                                <View style={styles.infoRow}>
                                    <Icon name="currency-inr" size={20} color="#1A1A2E" />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.infoLabel}>Registration Fee</Text>
                                        <Text style={styles.infoValue}>₹{event.registrationFee} per person</Text>
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>

                        {/* Share Card */}
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text style={styles.cardTitle}>Share Event</Text>
                                <Text style={styles.cardSubtitle}>Share this link with students to collect registrations</Text>

                                <View style={styles.linkContainer}>
                                    <Text style={styles.shareLink} numberOfLines={1}>{event.shareLink}</Text>
                                    <Button
                                        mode="contained"
                                        onPress={handleShare}
                                        icon="share-variant"
                                        compact
                                    >
                                        Share
                                    </Button>
                                </View>

                                <Button
                                    mode="outlined"
                                    onPress={() => navigation.navigate('EventShare', { eventId })}
                                    icon="qrcode"
                                    style={{ marginTop: 12 }}
                                >
                                    View QR Code
                                </Button>
                            </Card.Content>
                        </Card>

                        {/* Analytics */}
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text style={styles.cardTitle}>Analytics</Text>

                                <View style={styles.analyticsGrid}>
                                    <View style={styles.analyticItem}>
                                        <Icon name="chart-line" size={32} color="#10B981" />
                                        <Text style={styles.analyticValue}>78%</Text>
                                        <Text style={styles.analyticLabel}>Capacity Filled</Text>
                                    </View>
                                    <View style={styles.analyticItem}>
                                        <Icon name="trending-up" size={32} color="#6366F1" />
                                        <Text style={styles.analyticValue}>12/day</Text>
                                        <Text style={styles.analyticLabel}>Avg. Registrations</Text>
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>

                        {/* Actions */}
                        <View style={styles.actions}>
                            <Button
                                mode="outlined"
                                onPress={() => navigation.navigate('CreateEvent', { eventId })}
                                icon="pencil"
                                style={{ flex: 1 }}
                            >
                                Edit Event
                            </Button>
                            <Button
                                mode="contained"
                                onPress={() => {/* TODO: Export data */ }}
                                icon="download"
                                style={{ flex: 1, marginLeft: 12 }}
                            >
                                Export Data
                            </Button>
                        </View>
                    </View>
                ) : (
                    <View style={styles.content}>
                        {/* Registrations List */}
                        {registrations.map((registration) => (
                            <Card key={registration.id} style={styles.registrationCard}>
                                <Card.Content>
                                    <View style={styles.registrationHeader}>
                                        <Avatar.Icon size={40} icon="account" style={{ backgroundColor: '#6366F1' }} />
                                        <View style={{ flex: 1, marginLeft: 12 }}>
                                            <Text style={styles.registrationName}>{registration.name}</Text>
                                            <Text style={styles.registrationEmail}>{registration.email}</Text>
                                        </View>
                                        <Chip
                                            style={{
                                                backgroundColor: registration.status === 'confirmed' ? '#10B98115' : '#F59E0B15'
                                            }}
                                            textStyle={{
                                                color: registration.status === 'confirmed' ? '#10B981' : '#F59E0B',
                                                fontSize: 11
                                            }}
                                        >
                                            {registration.status}
                                        </Chip>
                                    </View>

                                    <View style={styles.registrationMeta}>
                                        <View style={styles.registrationMetaItem}>
                                            <Icon name="phone" size={14} color="#666" />
                                            <Text style={styles.registrationMetaText}>{registration.phone}</Text>
                                        </View>
                                        <View style={styles.registrationMetaItem}>
                                            <Icon name="calendar-clock" size={14} color="#666" />
                                            <Text style={styles.registrationMetaText}>
                                                {new Date(registration.registeredAt).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    </View>
                                </Card.Content>
                            </Card>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F5F9',
    },
    eventHeader: {
        padding: 24,
    },
    statusRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    statusChip: {
        height: 24,
    },
    categoryChip: {
        height: 24,
        backgroundColor: 'white',
    },
    eventTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    eventDescription: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        lineHeight: 20,
        marginBottom: 24,
    },
    quickStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    quickStat: {
        alignItems: 'center',
    },
    quickStatValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 8,
    },
    quickStatLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#1A1A2E',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    activeTabText: {
        color: '#1A1A2E',
    },
    content: {
        padding: 16,
    },
    card: {
        marginBottom: 16,
        borderRadius: 16,
        backgroundColor: 'white',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#1A1A2E',
    },
    cardSubtitle: {
        fontSize: 13,
        color: '#666',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    infoLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A2E',
    },
    linkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 12,
    },
    shareLink: {
        flex: 1,
        fontSize: 13,
        color: '#6366F1',
        fontWeight: '600',
    },
    analyticsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    analyticItem: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
    },
    analyticValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 8,
        color: '#1A1A2E',
    },
    analyticLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
        textAlign: 'center',
    },
    actions: {
        flexDirection: 'row',
        marginTop: 8,
    },
    registrationCard: {
        marginBottom: 12,
        borderRadius: 12,
        backgroundColor: 'white',
    },
    registrationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    registrationName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A2E',
    },
    registrationEmail: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    registrationMeta: {
        flexDirection: 'row',
        gap: 16,
    },
    registrationMetaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    registrationMetaText: {
        fontSize: 12,
        color: '#666',
    },
});
