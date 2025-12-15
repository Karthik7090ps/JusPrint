import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Text, Card, useTheme, Button, Chip, Searchbar, Badge, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppHeader } from '../../components/common/AppHeader';
import { FadeInView } from '../../components/common/Animations';

const CATEGORIES = [
    { id: 'all', name: 'All', icon: 'view-grid' },
    { id: 'sensors', name: 'Sensors', icon: 'gauge' },
    { id: 'boards', name: 'Boards', icon: 'chip' },
    { id: 'modules', name: 'Modules', icon: 'memory' },
    { id: 'wires', name: 'Wires', icon: 'cable-data' },
];

const COMPONENTS = [
    { id: 1, name: 'Arduino Uno R3', price: 450, stock: 12, category: 'boards', image: 'chip' },
    { id: 2, name: 'DHT11 Temp Sensor', price: 80, stock: 25, category: 'sensors', image: 'thermometer' },
    { id: 3, name: 'HC-SR04 Ultrasonic', price: 65, stock: 18, category: 'sensors', image: 'radar' },
    { id: 4, name: 'ESP8266 NodeMCU', price: 320, stock: 8, category: 'boards', image: 'wifi' },
    { id: 5, name: 'Jumper Wires (40pc)', price: 50, stock: 50, category: 'wires', image: 'cable-data' },
    { id: 6, name: 'L298N Motor Driver', price: 150, stock: 15, category: 'modules', image: 'car-cog' },
    { id: 7, name: 'Servo Motor SG90', price: 120, stock: 20, category: 'modules', image: 'sync' },
    { id: 8, name: 'IR Sensor Module', price: 40, stock: 30, category: 'sensors', image: 'remote' },
    { id: 9, name: 'Raspberry Pi Pico', price: 380, stock: 5, category: 'boards', image: 'raspberry-pi' },
    { id: 10, name: 'Breadboard 830pt', price: 85, stock: 22, category: 'wires', image: 'grid' },
];

export const ComponentsStore = ({ navigation }: { navigation: any }) => {
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [cart, setCart] = useState<Record<number, number>>({});

    const filteredComponents = COMPONENTS.filter(comp => {
        const matchesSearch = comp.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || comp.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const addToCart = (id: number) => {
        setCart(prev => ({
            ...prev,
            [id]: (prev[id] || 0) + 1
        }));
    };

    const removeFromCart = (id: number) => {
        setCart(prev => {
            const newCart = { ...prev };
            if (newCart[id] > 1) {
                newCart[id]--;
            } else {
                delete newCart[id];
            }
            return newCart;
        });
    };

    const cartItemCount = Object.values(cart).reduce((a, b) => a + b, 0);
    const cartTotal = Object.entries(cart).reduce((total, [id, qty]) => {
        const item = COMPONENTS.find(c => c.id === Number(id));
        return total + (item ? item.price * qty : 0);
    }, 0);

    return (
        <View style={styles.container}>
            <AppHeader title="Components" subtitle="Services" />

            {/* Search */}
            <View style={styles.searchContainer}>
                <Searchbar
                    placeholder="Search components..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    style={styles.searchBar}
                    inputStyle={{ minHeight: 0 }}
                />
            </View>

            {/* Categories */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {CATEGORIES.map(cat => (
                    <TouchableOpacity
                        key={cat.id}
                        style={[
                            styles.categoryChip,
                            selectedCategory === cat.id && { backgroundColor: theme.colors.primary }
                        ]}
                        onPress={() => setSelectedCategory(cat.id)}
                    >
                        <Icon
                            name={cat.icon}
                            size={18}
                            color={selectedCategory === cat.id ? 'white' : '#666'}
                        />
                        <Text style={{
                            marginLeft: 6,
                            fontWeight: '500',
                            color: selectedCategory === cat.id ? 'white' : '#666'
                        }}>
                            {cat.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Product Grid */}
            <FlatList
                data={filteredComponents}
                numColumns={2}
                contentContainerStyle={styles.grid}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item, index }) => (
                    <FadeInView delay={index * 50} style={styles.cardContainer}>
                        <Card style={styles.productCard}>
                            <View style={styles.imageContainer}>
                                <Icon name={item.image} size={40} color={theme.colors.primary} />
                                {item.stock < 10 && (
                                    <Chip compact style={styles.stockBadge} textStyle={{ fontSize: 10, color: '#E74C3C' }}>
                                        {item.stock} left
                                    </Chip>
                                )}
                            </View>
                            <Card.Content style={{ paddingBottom: 8 }}>
                                <Text variant="bodyMedium" numberOfLines={2} style={{ fontWeight: '600', minHeight: 40 }}>
                                    {item.name}
                                </Text>
                                <Text variant="titleMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                                    ₹{item.price}
                                </Text>
                            </Card.Content>
                            <View style={styles.cardActions}>
                                {cart[item.id] ? (
                                    <View style={styles.qtyControl}>
                                        <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.qtyBtn}>
                                            <Icon name="minus" size={16} color={theme.colors.primary} />
                                        </TouchableOpacity>
                                        <Text style={{ fontWeight: 'bold', minWidth: 24, textAlign: 'center' }}>
                                            {cart[item.id]}
                                        </Text>
                                        <TouchableOpacity onPress={() => addToCart(item.id)} style={styles.qtyBtn}>
                                            <Icon name="plus" size={16} color={theme.colors.primary} />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <Button
                                        mode="contained"
                                        compact
                                        onPress={() => addToCart(item.id)}
                                        style={{ flex: 1 }}
                                        labelStyle={{ fontSize: 12 }}
                                    >
                                        Add
                                    </Button>
                                )}
                            </View>
                        </Card>
                    </FadeInView>
                )}
            />

            {/* Cart Footer */}
            {cartItemCount > 0 && (
                <View style={styles.cartBar}>
                    <View>
                        <Text variant="bodySmall" style={{ color: '#666' }}>{cartItemCount} items</Text>
                        <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>₹{cartTotal}</Text>
                    </View>
                    <Button mode="contained" icon="cart" onPress={() => { }}>
                        View Cart
                    </Button>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F5F9' },
    searchContainer: { padding: 16, paddingBottom: 8 },
    searchBar: { backgroundColor: 'white', borderRadius: 12, height: 48 },
    categoryScroll: { paddingLeft: 16, maxHeight: 50 },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'white',
        marginRight: 8,
    },
    grid: { padding: 8, paddingBottom: 100 },
    cardContainer: { width: '50%', padding: 8 },
    productCard: { backgroundColor: 'white', borderRadius: 16 },
    imageContainer: {
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        position: 'relative',
    },
    stockBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#FFEBEE',
        height: 20,
    },
    cardActions: { paddingHorizontal: 12, paddingBottom: 12 },
    qtyControl: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF5F0',
        borderRadius: 20,
        paddingVertical: 6,
    },
    qtyBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
});
