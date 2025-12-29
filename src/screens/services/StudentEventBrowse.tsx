import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, Card, Searchbar, Chip, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppHeader } from '../../components/common/AppHeader';

type Event = {
    id: string;
    title: string;
    description: string;
    date: string;
    venue: string;
    organizer: string;
    category: string;
    fee: number;
    spotsLeft: number;
    totalCapacity: number;
};

export const StudentEventBrowse = ({ navigation }: { navigation: any }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Mock events
    const events: Event[] = [
        {
            id: '1',
            title: 'Tech Fest 2024 -  Hackathon',
            description: 'Join us for an exciting 24-hour hackathon. Build amazing projects and compete for prizes!',
            date: '2024-01-15',
            venue: 'Main Auditorium',
            organizer: 'Tech Club',
            category: 'Technical',
            fee: 50,
            spotsLeft: 44,
            totalCapacity: 200,
        },
        {
            id: '2',
            title: 'Cultural Night 2024',
            description: 'A night filled with music, dance, and entertainment. Dont miss out!',
            date: '2024-01-20',
            venue: 'Open Air Theatre',
            organizer: 'Cultural Committee',
            category: 'Cultural',
            fee: 0,
            spotsLeft: 112,
            totalCapacity: 500,
        },
        {
            id: '3',
            title: 'AI & Machine Learning Workshop',
            description: 'Learn the fundamentals of AI and ML from industry experts.',
            date: '2024-01-18',
            venue: 'CS Lab 301',
            organizer: 'AI Club',
            category: 'Workshop',
            fee: 100,
            spotsLeft: 5,
            totalCapacity: 50,
        },
    ];

    const categories = ['all', 'Technical', 'Cultural', 'Workshop', 'Sports', 'Seminar'];

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <View style={styles.container}>
            <AppHeader title="Campus Events" subtitle="Discover & Register" />

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Search Bar */}
                <View style={styles.searchSection}>
                    <Searchbar
                        placeholder="Search events..."
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        style={styles.searchBar}
                        icon="magnify"
                    />
                </View>

                {/* Category Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContainer}
                >
                    {categories.map((category) => (
                        <Chip
                            key={category}
                            selected={selectedCategory === category}
                            onPress={() => setSelectedCategory(category)}
                            style={[
                                styles.categoryChip,
                                selectedCategory === category && { backgroundColor: '#1A1A2E' }
                            ]}
                            textStyle={selectedCategory === category ? { color: 'white' } : {}}
                        >
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                        </Chip>
                    ))}
                </ScrollView>

                {/* Events Grid */}
                <View style={styles.eventsContainer}>
                    {filteredEvents.length === 0 ? (
                        <Card style={styles.emptyCard}>
                            <Card.Content style={{ alignItems: 'center', paddingVertical: 40 }}>
                                <Icon name="calendar-blank" size={64} color="#CCC" />
                                <Text style={styles.emptyTitle}>No events found</Text>
                                <Text style={styles.emptySubtitle}>
                                    Try adjusting your search or filters
                                </Text>
                            </Card.Content>
                        </Card>
                    ) : (
                        filteredEvents.map((event) => (
                            <Card key={event.id} style={styles.eventCard}>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('StudentEventRegister', { eventId: event.id })}
                                >
                                    <View style={styles.eventBanner}>
                                        <View style={styles.bannerOverlay}>
                                            <Chip
                                                icon="tag"
                                                style={styles.categoryBadge}
                                                textStyle={{ fontSize: 11, fontWeight: '600' }}
                                            >
                                                {event.category}
                                            </Chip>
                                        </View>
                                    </View>

                                    <Card.Content style={{ paddingTop: 16 }}>
                                        <Text style={styles.eventTitle} numberOfLines={2}>
                                            {event.title}
                                        </Text>

                                        <Text style={styles.eventOrganizer} numberOfLines={1}>
                                            by {event.organizer}
                                        </Text>

                                        <Text style={styles.eventDescription} numberOfLines={2}>
                                            {event.description}
                                        </Text>

                                        <View style={styles.eventDetails}>
                                            <View style={styles.eventDetail}>
                                                <Icon name="calendar" size={16} color="#666" />
                                                <Text style={styles.eventDetailText}>
                                                    {new Date(event.date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </Text>
                                            </View>
                                            <View style={styles.eventDetail}>
                                                <Icon name="map-marker" size={16} color="#666" />
                                                <Text style={styles.eventDetailText} numberOfLines={1}>
                                                    {event.venue}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.eventFooter}>
                                            <View style={{ flex: 1 }}>
                                                {event.fee > 0 ? (
                                                    <View style={styles.feeContainer}>
                                                        <Icon name="currency-inr" size={18} color="#10B981" />
                                                        <Text style={styles.feeText}>{event.fee}</Text>
                                                    </View>
                                                ) : (
                                                    <Chip
                                                        icon="check-circle"
                                                        style={{ backgroundColor: '#10B98115', alignSelf: 'flex-start' }}
                                                        textStyle={{ color: '#10B981', fontSize: 12, fontWeight: '600' }}
                                                    >
                                                        FREE
                                                    </Chip>
                                                )}
                                                <Text style={styles.spotsLeft}>
                                                    {event.spotsLeft < 20 && (
                                                        <Icon name="alert-circle" size={14} color="#F59E0B" />
                                                    )}
                                                    {' '}{event.spotsLeft} spots left
                                                </Text>
                                            </View>

                                            <Button
                                                mode="contained"
                                                onPress={() => navigation.navigate('StudentEventRegister', { eventId: event.id })}
                                                compact
                                                icon="arrow-right"
                                                contentStyle={{ flexDirection: 'row-reverse' }}
                                                buttonColor="#1A1A2E"
                                            >
                                                Register
                                            </Button>
                                        </View>
                                    </Card.Content>
                                </TouchableOpacity>
                            </Card>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F5F9',
    },
    searchSection: {
        padding: 16,
    },
    searchBar: {
        backgroundColor: 'white',
        elevation: 2,
    },
    categoriesContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        flexDirection: 'row',
        gap: 8,
    },
    categoryChip: {
        backgroundColor: 'white',
        marginRight: 8,
    },
    eventsContainer: {
        padding: 16,
    },
    eventCard: {
        marginBottom: 16,
        borderRadius: 16,
        backgroundColor: 'white',
        overflow: 'hidden',
    },
    eventBanner: {
        height: 140,
        backgroundColor: '#6366F1',
        position: 'relative',
    },
    bannerOverlay: {
        position: 'absolute',
        top: 12,
        right: 12,
    },
    categoryBadge: {
        backgroundColor: 'white',
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A2E',
        marginBottom: 4,
    },
    eventOrganizer: {
        fontSize: 13,
        color: '#6366F1',
        marginBottom: 8,
        fontWeight: '600',
    },
    eventDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 12,
    },
    eventDetails: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    eventDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    eventDetailText: {
        fontSize: 13,
        color: '#666',
    },
    eventFooter: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: 12,
    },
    feeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    feeText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#10B981',
        marginLeft: 2,
    },
    spotsLeft: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
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
});
