import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Button, FAB, Chip, Searchbar, Avatar, Menu } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppHeader } from '../../components/common/AppHeader';
import LinearGradient from 'react-native-linear-gradient';

type Event = {
    id: string;
    title: string;
    date: string;
    registrations: number;
    maxCapacity?: number;
    status: 'draft' | 'active' | 'closed';
    revenue: number;
    category: string;
};

export const CoordinatorDashboard = ({ navigation }: { navigation: any }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'active' | 'closed'>('all');
    const [menuVisible, setMenuVisible] = useState<string | null>(null);

    // Mock data - replace with API call
    const [events, setEvents] = useState<Event[]>([
        {
            id: '1',
            title: 'Tech Fest 2024 - Hackathon',
            date: '2024-01-15',
            registrations: 156,
            maxCapacity: 200,
            status: 'active',
            revenue: 156,
            category: 'Technical',
        },
        {
            id: '2',
            title: 'Cultural Night Registration',
            date: '2024-01-20',
            registrations: 89,
            status: 'active',
            revenue: 89,
            category: 'Cultural',
        },
        {
            id: '3',
            title: 'AI Workshop - Getting Started',
            date: '2024-01-10',
            registrations: 45,
            maxCapacity: 50,
            status: 'closed',
            revenue: 45,
            category: 'Workshop',
        },
    ]);

    const stats = {
        totalEvents: events.length,
        activeEvents: events.filter(e => e.status === 'active').length,
        totalRegistrations: events.reduce((sum, e) => sum + e.registrations, 0),
        revenue: events.reduce((sum, e) => sum + e.revenue, 0),
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return '#10B981';
            case 'draft': return '#F59E0B';
            case 'closed': return '#6B7280';
            default: return '#6B7280';
        }
    };

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || event.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <View style={styles.container}>
            <AppHeader title="Dashboard" subtitle="Manage your events" />

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Stats Section - Minimalist Redesign */}
                <View style={styles.statsContainer}>
                    <View style={styles.statsSummary}>
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>{stats.totalRegistrations}</Text>
                            <Text style={styles.statLabel}>Total Registrations</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statBox}>
                            <Text style={[styles.statValue, { color: '#10B981' }]}>₹{stats.revenue}</Text>
                            <Text style={styles.statLabel}>Total Revenue</Text>
                        </View>
                    </View>

                    <View style={styles.miniStatsRow}>
                        <View style={styles.miniStat}>
                            <Icon name="calendar-check" size={18} color="#666" />
                            <Text style={styles.miniStatText}>{stats.totalEvents} Events</Text>
                        </View>
                        <View style={styles.miniStat}>
                            <Icon name="chart-timeline-variant" size={18} color="#10B981" />
                            <Text style={styles.miniStatText}>{stats.activeEvents} Active</Text>
                        </View>
                    </View>
                </View>

                {/* Search and Filter */}
                <View style={styles.searchSection}>
                    <Searchbar
                        placeholder="Search events..."
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        style={styles.searchBar}
                        icon="magnify"
                    />

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
                        {['all', 'active', 'draft', 'closed'].map((status) => (
                            <Chip
                                key={status}
                                selected={filterStatus === status}
                                onPress={() => setFilterStatus(status as any)}
                                style={[
                                    styles.filterChip,
                                    filterStatus === status && { backgroundColor: '#1A1A2E' }
                                ]}
                                textStyle={filterStatus === status ? { color: 'white' } : {}}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Chip>
                        ))}
                    </ScrollView>
                </View>

                {/* Events List */}
                <View style={styles.eventsSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Your Events</Text>
                        <Button
                            mode="text"
                            onPress={() => navigation.navigate('CreateEvent')}
                            icon="plus"
                            compact
                        >
                            Create New
                        </Button>
                    </View>

                    {filteredEvents.length === 0 ? (
                        <Card style={styles.emptyCard}>
                            <Card.Content style={{ alignItems: 'center', paddingVertical: 40 }}>
                                <Icon name="calendar-blank" size={64} color="#CCC" />
                                <Text style={styles.emptyTitle}>No events found</Text>
                                <Text style={styles.emptySubtitle}>
                                    {searchQuery ? 'Try a different search term' : 'Create your first event to get started'}
                                </Text>
                                <Button
                                    mode="contained"
                                    onPress={() => navigation.navigate('CreateEvent')}
                                    style={{ marginTop: 16 }}
                                    icon="plus-circle"
                                >
                                    Create Event
                                </Button>
                            </Card.Content>
                        </Card>
                    ) : (
                        filteredEvents.map((event) => (
                            <Card key={event.id} style={styles.eventCard}>
                                <Card.Content>
                                    <View style={styles.eventHeader}>
                                        <View style={{ flex: 1 }}>
                                            <View style={styles.eventTitleRow}>
                                                <Text style={styles.eventTitle} numberOfLines={2}>
                                                    {event.title}
                                                </Text>
                                                <Menu
                                                    visible={menuVisible === event.id}
                                                    onDismiss={() => setMenuVisible(null)}
                                                    anchor={
                                                        <TouchableOpacity onPress={() => setMenuVisible(event.id)}>
                                                            <Icon name="dots-vertical" size={24} color="#666" />
                                                        </TouchableOpacity>
                                                    }
                                                >
                                                    <Menu.Item
                                                        onPress={() => {
                                                            setMenuVisible(null);
                                                            navigation.navigate('EventDetails', { eventId: event.id });
                                                        }}
                                                        leadingIcon="eye"
                                                        title="View Details"
                                                    />
                                                    <Menu.Item
                                                        onPress={() => {
                                                            setMenuVisible(null);
                                                            navigation.navigate('CreateEvent', { eventId: event.id });
                                                        }}
                                                        leadingIcon="pencil"
                                                        title="Edit Event"
                                                    />
                                                    <Menu.Item
                                                        onPress={() => {
                                                            setMenuVisible(null);
                                                            navigation.navigate('EventShare', { eventId: event.id });
                                                        }}
                                                        leadingIcon="share-variant"
                                                        title="Share Link"
                                                    />
                                                    <Menu.Item
                                                        onPress={() => setMenuVisible(null)}
                                                        leadingIcon="delete"
                                                        title="Delete"
                                                        titleStyle={{ color: '#EF4444' }}
                                                    />
                                                </Menu>
                                            </View>

                                            <View style={styles.eventMeta}>
                                                <Chip
                                                    icon="label"
                                                    style={[styles.statusChip, { backgroundColor: getStatusColor(event.status) + '20' }]}
                                                    textStyle={{ color: getStatusColor(event.status), fontSize: 11 }}
                                                >
                                                    {event.status.toUpperCase()}
                                                </Chip>
                                                <Chip icon="tag" style={styles.categoryChip} textStyle={{ fontSize: 11 }}>
                                                    {event.category}
                                                </Chip>
                                            </View>
                                        </View>
                                    </View>

                                    <View style={styles.eventStats}>
                                        <View style={styles.eventStat}>
                                            <Icon name="calendar" size={16} color="#666" />
                                            <Text style={styles.eventStatText}>
                                                {new Date(event.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </Text>
                                        </View>
                                        <View style={styles.eventStat}>
                                            <Icon name="account-multiple" size={16} color="#666" />
                                            <Text style={styles.eventStatText}>
                                                {event.registrations}{event.maxCapacity ? `/${event.maxCapacity}` : ''} registered
                                            </Text>
                                        </View>
                                        <View style={styles.eventStat}>
                                            <Icon name="currency-inr" size={16} color="#10B981" />
                                            <Text style={[styles.eventStatText, { color: '#10B981', fontWeight: '600' }]}>
                                                ₹{event.revenue}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.eventActions}>
                                        <Button
                                            mode="outlined"
                                            onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}
                                            style={{ flex: 1 }}
                                            compact
                                        >
                                            View Details
                                        </Button>
                                        <Button
                                            mode="contained"
                                            onPress={() => navigation.navigate('EventShare', { eventId: event.id })}
                                            style={{ flex: 1, marginLeft: 8 }}
                                            icon="share-variant"
                                            compact
                                        >
                                            Share
                                        </Button>
                                    </View>
                                </Card.Content>
                            </Card>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <FAB
                icon="plus"
                style={styles.fab}
                onPress={() => navigation.navigate('CreateEvent')}
                label="Create Event"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F5F9',
    },
    statsContainer: {
        margin: 16,
        padding: 20,
        borderRadius: 20,
        backgroundColor: 'white',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statsSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: '#E5E7EB',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A2E',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    miniStatsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    miniStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    miniStatText: {
        fontSize: 13,
        color: '#4B5563',
        fontWeight: '500',
    },
    searchSection: {
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    searchBar: {
        backgroundColor: 'white',
        elevation: 2,
    },
    filterChips: {
        marginTop: 12,
        flexDirection: 'row',
    },
    filterChip: {
        marginRight: 8,
        backgroundColor: 'white',
    },
    eventsSection: {
        padding: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A2E',
    },
    eventCard: {
        marginBottom: 16,
        borderRadius: 16,
        backgroundColor: 'white',
    },
    eventHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    eventTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A2E',
        flex: 1,
        marginRight: 8,
    },
    eventMeta: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    statusChip: {
        height: 24,
    },
    categoryChip: {
        height: 24,
        backgroundColor: '#F3F4F6',
    },
    eventStats: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 16,
    },
    eventStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    eventStatText: {
        fontSize: 13,
        color: '#666',
    },
    eventActions: {
        flexDirection: 'row',
        marginTop: 8,
    },
    emptyCard: {
        backgroundColor: 'white',
        borderRadius: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
        color: '#1A1A2E',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
        textAlign: 'center',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 80,
        backgroundColor: '#6366F1',
    },
});
