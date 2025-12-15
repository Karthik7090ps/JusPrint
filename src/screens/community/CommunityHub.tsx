import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Card, useTheme, Button, Chip, Avatar, Searchbar, FAB, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppHeader } from '../../components/common/AppHeader';

const { width } = Dimensions.get('window');

// Mock Vending Machine Data
const VENDING_ITEMS = [
    { id: 1, name: 'Maggi', stock: 12, maxStock: 20, price: '₹15', icon: 'noodles', color: '#FF9F43' },
    { id: 2, name: 'Chips', stock: 5, maxStock: 15, price: '₹20', icon: 'food-outline', color: '#54A0FF' },
    { id: 3, name: 'Cold Coffee', stock: 0, maxStock: 10, price: '₹40', icon: 'coffee', color: '#5F27CD' },
    { id: 4, name: 'Biscuits', stock: 18, maxStock: 25, price: '₹10', icon: 'cookie', color: '#FF6B6B' },
    { id: 5, name: 'Energy Bar', stock: 8, maxStock: 12, price: '₹50', icon: 'food-apple', color: '#2ECC71' },
];

// Mock Forum Topics
const FORUM_TOPICS = [
    { id: 1, title: 'Best canteen food options?', replies: 24, time: '2h ago', hot: true },
    { id: 2, title: 'Lost: Blue water bottle near library', replies: 8, time: '5h ago', hot: false },
    { id: 3, title: 'Tips for semester 4 exams', replies: 56, time: '1d ago', hot: true },
    { id: 4, title: 'Anyone selling graphics calculator?', replies: 12, time: '2d ago', hot: false },
];

export const CommunityHub = ({ navigation }: { navigation?: any }) => {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState<'vending' | 'forum'>('vending');

    const getStockColor = (stock: number, max: number) => {
        const ratio = stock / max;
        if (ratio === 0) return '#E74C3C';
        if (ratio < 0.3) return '#F39C12';
        return '#2ECC71';
    };

    return (
        <View style={styles.container}>
            <AppHeader title="Community" subtitle="Campus Life Hub" />

            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'vending' && styles.activeTab]}
                    onPress={() => setActiveTab('vending')}
                >
                    <Icon name="fridge-outline" size={20} color={activeTab === 'vending' ? theme.colors.primary : '#888'} />
                    <Text style={[styles.tabText, activeTab === 'vending' && { color: theme.colors.primary }]}>Vending</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'forum' && styles.activeTab]}
                    onPress={() => setActiveTab('forum')}
                >
                    <Icon name="forum-outline" size={20} color={activeTab === 'forum' ? theme.colors.primary : '#888'} />
                    <Text style={[styles.tabText, activeTab === 'forum' && { color: theme.colors.primary }]}>Forum</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {activeTab === 'vending' ? (
                    <>
                        {/* Vending Machine Status Header */}
                        <View style={styles.sectionHeader}>
                            <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>Hostel A Vending</Text>
                            <Chip icon="refresh" compact onPress={() => { }}>Live</Chip>
                        </View>

                        {/* Stock Grid */}
                        <View style={styles.vendingGrid}>
                            {VENDING_ITEMS.map(item => (
                                <Card key={item.id} style={styles.vendingCard}>
                                    <View style={styles.vendingCardContent}>
                                        <View style={[styles.vendingIcon, { backgroundColor: item.color + '20' }]}>
                                            <Icon name={item.icon} size={28} color={item.color} />
                                        </View>
                                        <Text variant="titleSmall" style={{ fontWeight: 'bold', marginTop: 8 }}>{item.name}</Text>
                                        <Text variant="bodySmall" style={{ color: '#666' }}>{item.price}</Text>
                                        <View style={styles.stockBar}>
                                            <View style={[styles.stockFill, {
                                                width: `${(item.stock / item.maxStock) * 100}%`,
                                                backgroundColor: getStockColor(item.stock, item.maxStock)
                                            }]} />
                                        </View>
                                        <Text variant="labelSmall" style={{ color: getStockColor(item.stock, item.maxStock) }}>
                                            {item.stock === 0 ? 'Out of Stock' : `${item.stock} left`}
                                        </Text>
                                    </View>
                                </Card>
                            ))}
                        </View>

                        {/* Notify Me CTA */}
                        <Card style={styles.notifyCard}>
                            <Card.Content style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Icon name="bell-ring-outline" size={32} color={theme.colors.primary} />
                                <View style={{ flex: 1, marginLeft: 16 }}>
                                    <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>Out of your favorite?</Text>
                                    <Text variant="bodySmall" style={{ color: '#666' }}>Get notified when it's restocked</Text>
                                </View>
                                <Button mode="contained" compact>Notify</Button>
                            </Card.Content>
                        </Card>
                    </>
                ) : (
                    <>
                        {/* Forum Feed */}
                        <View style={styles.sectionHeader}>
                            <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>Anonymous Forum</Text>
                            <Chip icon="shield-check" compact>Safe Space</Chip>
                        </View>

                        {FORUM_TOPICS.map(topic => (
                            <TouchableOpacity key={topic.id}>
                                <Card style={styles.forumCard}>
                                    <Card.Content>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Avatar.Icon size={36} icon="account" style={{ backgroundColor: '#E0E0E0' }} color="#888" />
                                            <View style={{ flex: 1, marginLeft: 12 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Text variant="titleSmall" style={{ fontWeight: 'bold', flex: 1 }}>{topic.title}</Text>
                                                    {topic.hot && <Chip compact style={{ backgroundColor: '#FFE4E1' }} textStyle={{ color: '#E74C3C', fontSize: 10 }}>🔥 Hot</Chip>}
                                                </View>
                                                <View style={{ flexDirection: 'row', marginTop: 4 }}>
                                                    <Text variant="bodySmall" style={{ color: '#888' }}>{topic.replies} replies</Text>
                                                    <Text variant="bodySmall" style={{ color: '#BBB', marginLeft: 12 }}>• {topic.time}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </Card.Content>
                                </Card>
                            </TouchableOpacity>
                        ))}
                    </>
                )}
            </ScrollView>

            {/* FAB for Forum */}
            {activeTab === 'forum' && (
                <FAB
                    icon="plus"
                    label="New Post"
                    style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                    color="white"
                    onPress={() => { }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F5F9' },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginTop: 8,
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 10,
        gap: 8,
    },
    activeTab: {
        backgroundColor: '#FFF5F0',
    },
    tabText: {
        fontWeight: '600',
        color: '#888',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    vendingGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
    },
    vendingCard: {
        width: (width - 44) / 2,
        margin: 6,
        backgroundColor: 'white',
        borderRadius: 16,
    },
    vendingCardContent: {
        padding: 16,
        alignItems: 'center',
    },
    vendingIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stockBar: {
        width: '100%',
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        marginTop: 8,
        marginBottom: 4,
        overflow: 'hidden',
    },
    stockFill: {
        height: '100%',
        borderRadius: 3,
    },
    notifyCard: {
        marginTop: 16,
        backgroundColor: 'white',
        borderRadius: 16,
    },
    forumCard: {
        marginBottom: 12,
        backgroundColor: 'white',
        borderRadius: 16,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});
