import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, Button, Card, useTheme, Chip, Divider, IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppHeader } from '../../components/common/AppHeader';
import { FadeInView } from '../../components/common/Animations';

// Mock Product Data
const PRODUCT = {
    id: 1,
    name: 'Arduino Mega 2560 + Sensor Kit Bundle',
    price: 1250,
    originalPrice: 1800,
    images: ['chip', 'memory', 'cog'],
    category: 'Electronics Kit',
    condition: 'New',
    description: 'Complete Arduino Mega 2560 R3 board with 37-in-1 sensor kit. Perfect for IoT projects, robotics, and embedded systems learning. All components tested and working.',
    features: [
        'Arduino Mega 2560 R3 (Original Clone)',
        '37 Different Sensors',
        'USB Cable Included',
        'Jumper Wires Pack'
    ],
    seller: {
        name: 'TechHub Store',
        rating: 4.8,
        sales: 156,
        verified: true,
        avatar: 'account-circle',
        responseTime: '~2 hrs',
    },
    postedTime: '2 days ago',
    views: 234,
    likes: 18,
};

export const ProductDetails = ({ navigation, route }: { navigation: any; route?: any }) => {
    const theme = useTheme();
    const product = route?.params?.product || PRODUCT;

    return (
        <View style={styles.container}>
            <AppHeader title="Product Details" subtitle="Marketplace" />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Image Gallery */}
                <FadeInView>
                    <View style={styles.imageGallery}>
                        <View style={styles.mainImage}>
                            <Icon name={product.images[0]} size={100} color={theme.colors.primary} />
                        </View>
                        <View style={styles.thumbnailRow}>
                            {product.images.map((img: string, i: number) => (
                                <TouchableOpacity key={i} style={[styles.thumbnail, i === 0 && styles.thumbnailActive]}>
                                    <Icon name={img} size={24} color="#666" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </FadeInView>

                {/* Product Info */}
                <FadeInView delay={100}>
                    <Card style={styles.card}>
                        <Card.Content>
                            <View style={styles.tagRow}>
                                <Chip compact style={{ backgroundColor: '#E8F5E9' }}>{product.condition}</Chip>
                                <Chip compact style={{ backgroundColor: '#FFF3E0' }}>{product.category}</Chip>
                            </View>

                            <Text variant="headlineSmall" style={styles.title}>{product.name}</Text>

                            <View style={styles.priceRow}>
                                <Text variant="headlineMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                                    ₹{product.price}
                                </Text>
                                <Text variant="bodyLarge" style={styles.originalPrice}>
                                    ₹{product.originalPrice}
                                </Text>
                                <Chip compact style={{ backgroundColor: '#FFEBEE' }} textStyle={{ color: '#E74C3C' }}>
                                    {Math.round((1 - product.price / product.originalPrice) * 100)}% off
                                </Chip>
                            </View>

                            <View style={styles.statsRow}>
                                <View style={styles.stat}>
                                    <Icon name="eye" size={16} color="#666" />
                                    <Text variant="bodySmall" style={{ marginLeft: 4, color: '#666' }}>{product.views} views</Text>
                                </View>
                                <View style={styles.stat}>
                                    <Icon name="heart" size={16} color="#E74C3C" />
                                    <Text variant="bodySmall" style={{ marginLeft: 4, color: '#666' }}>{product.likes} likes</Text>
                                </View>
                                <View style={styles.stat}>
                                    <Icon name="clock-outline" size={16} color="#666" />
                                    <Text variant="bodySmall" style={{ marginLeft: 4, color: '#666' }}>{product.postedTime}</Text>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>
                </FadeInView>

                {/* Description */}
                <FadeInView delay={200}>
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text variant="titleMedium" style={styles.sectionTitle}>Description</Text>
                            <Text variant="bodyMedium" style={{ color: '#444', lineHeight: 22 }}>
                                {product.description}
                            </Text>

                            <Text variant="titleMedium" style={[styles.sectionTitle, { marginTop: 16 }]}>What's Included</Text>
                            {product.features.map((feature: string, i: number) => (
                                <View key={i} style={styles.featureRow}>
                                    <Icon name="check-circle" size={18} color="#2ECC71" />
                                    <Text variant="bodyMedium" style={{ marginLeft: 8 }}>{feature}</Text>
                                </View>
                            ))}
                        </Card.Content>
                    </Card>
                </FadeInView>

                {/* Seller Info */}
                <FadeInView delay={300}>
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text variant="titleMedium" style={styles.sectionTitle}>Seller</Text>
                            <View style={styles.sellerRow}>
                                <View style={styles.sellerAvatar}>
                                    <Icon name={product.seller.avatar} size={40} color={theme.colors.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{product.seller.name}</Text>
                                        {product.seller.verified && (
                                            <Icon name="check-decagram" size={18} color="#3498DB" style={{ marginLeft: 6 }} />
                                        )}
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                        <Icon name="star" size={14} color="#F1C40F" />
                                        <Text variant="bodySmall" style={{ marginLeft: 4 }}>{product.seller.rating}</Text>
                                        <Text variant="bodySmall" style={{ marginLeft: 12, color: '#666' }}>
                                            {product.seller.sales} sales
                                        </Text>
                                        <Text variant="bodySmall" style={{ marginLeft: 12, color: '#666' }}>
                                            Responds {product.seller.responseTime}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.sellerActions}>
                                <Button mode="outlined" compact style={{ flex: 1, marginRight: 8 }} icon="chat">
                                    Chat
                                </Button>
                                <Button mode="outlined" compact style={{ flex: 1 }} icon="storefront">
                                    View Store
                                </Button>
                            </View>
                        </Card.Content>
                    </Card>
                </FadeInView>
            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.bottomBar}>
                <IconButton
                    icon="heart-outline"
                    mode="outlined"
                    size={24}
                    onPress={() => { }}
                />
                <IconButton
                    icon="share-variant-outline"
                    mode="outlined"
                    size={24}
                    onPress={() => { }}
                />
                <Button
                    mode="contained"
                    style={{ flex: 1, marginLeft: 12 }}
                    icon="cart"
                    onPress={() => { }}
                >
                    Add to Cart
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F5F9' },
    scrollContent: { padding: 16, paddingBottom: 100 },
    imageGallery: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    mainImage: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
    },
    thumbnailRow: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 8,
    },
    thumbnail: {
        width: 50,
        height: 50,
        borderRadius: 8,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    thumbnailActive: {
        borderWidth: 2,
        borderColor: '#FF6B35',
    },
    card: {
        marginBottom: 16,
        backgroundColor: 'white',
        borderRadius: 16,
    },
    tagRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 12,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    originalPrice: {
        textDecorationLine: 'line-through',
        color: '#999',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 20,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 12,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    sellerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sellerAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    sellerActions: {
        flexDirection: 'row',
        marginTop: 16,
    },
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
});
