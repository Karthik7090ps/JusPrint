import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, Searchbar, Card, Button, FAB, useTheme, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppHeader } from '../../components/common/AppHeader';

const PRODUCTS = [
    { id: 1, name: 'Casio fx-991EX', price: '₹800', condition: 'Like New', seller: 'Rahul (3rd Year)', image: 'calculator-variant' },
    { id: 2, name: 'Drafter + Scale', price: '₹400', condition: 'Good', seller: 'Sneha (4th Year)', image: 'ruler-square' },
    { id: 3, name: 'Arduino Kit', price: '₹1200', condition: 'Unused', seller: 'Amit (2nd Year)', image: 'chip' },
    { id: 4, name: 'Semester 3 Books', price: '₹600', condition: 'Fair', seller: 'Priya (Alumni)', image: 'book-open-variant' },
];

export const MarketplaceHome = ({ navigation }: { navigation: any }) => {
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = React.useState('');

    return (
        <View style={styles.container}>
            <AppHeader title="Marketplace" subtitle="Buy & Sell Campus Essentials" />
            <View style={styles.header}>
                <Searchbar
                    placeholder="Search calculators, books..."
                    onChangeText={setSearchQuery}
                    value={searchQuery}
                    style={styles.searchBar}
                    inputStyle={{ minHeight: 0 }}
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                    <Chip style={styles.chip} selected>All</Chip>
                    <Chip style={styles.chip}>Calculators</Chip>
                    <Chip style={styles.chip}>Drafters</Chip>
                    <Chip style={styles.chip}>Books</Chip>
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={styles.grid}>
                {PRODUCTS.map(product => (
                    <TouchableOpacity
                        key={product.id}
                        style={styles.productCard}
                        onPress={() => navigation.navigate('ProductDetails', { product })}
                        activeOpacity={0.9}
                    >
                        <Card style={{ flex: 1, backgroundColor: 'white', borderRadius: 16, overflow: 'hidden' }} mode="elevated">
                            <View style={styles.imagePlaceholder}>
                                <Icon name={product.image} size={48} color="#888" />
                            </View>
                            <Card.Content style={{ paddingVertical: 12 }}>
                                <Text variant="titleSmall" numberOfLines={1} style={{ fontWeight: 'bold' }}>{product.name}</Text>
                                <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>{product.price}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                    <Icon name="account-check" size={14} color="#27AE60" />
                                    <Text variant="bodySmall" style={{ color: '#666', marginLeft: 4 }} numberOfLines={1}>{product.seller}</Text>
                                </View>
                            </Card.Content>
                        </Card>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <FAB
                icon="camera-plus"
                label="Sell Item"
                style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                color="white"
                onPress={() => { }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F5F9' },
    header: {
        padding: 16,
        backgroundColor: 'white',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        elevation: 4,
    },
    searchBar: {
        backgroundColor: '#F0F2F5',
        borderRadius: 12,
        height: 48,
    },
    filterRow: {
        marginTop: 12,
    },
    chip: {
        marginRight: 8,
    },
    grid: {
        padding: 12,
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingBottom: 80,
    },
    productCard: {
        width: '47%',
        margin: '1.5%',
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
    },
    imagePlaceholder: {
        height: 120,
        backgroundColor: '#E1E1E1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    }
});
