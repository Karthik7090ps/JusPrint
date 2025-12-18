import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Text, Card, useTheme, Button, Searchbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppHeader } from '../../components/common/AppHeader';
import { FadeInView } from '../../components/common/Animations';

const SCREEN_WIDTH = Dimensions.get('window').width;

const CATEGORIES = [
    { id: 1, name: 'Electronics', icon: 'chip', color: '#FF6B35' },
    { id: 2, name: 'IoT', icon: 'access-point-network', color: '#4ECDC4' },
    { id: 3, name: 'Computer Sc.', icon: 'laptop-code', color: '#FF9F1C' },
    { id: 4, name: 'Electrical', icon: 'flash', color: '#FFEE32' },
    { id: 5, name: 'Civil', icon: 'bridge', color: '#1A535C' },
    { id: 6, name: 'Mechanical', icon: 'cog', color: '#D7263D' },
];

export const ProjectsDashboard = ({ navigation }: { navigation: any }) => {
    const theme = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: '#F4F5F9' }]}>
            <AppHeader title="Projects" subtitle="Innovation Hub" />
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>

                {/* Hero Section */}
                <FadeInView delay={0}>
                    <View style={styles.heroContainer}>
                        <View style={[styles.heroImage, { backgroundColor: '#1A1A2E' }]}>
                            <View style={{ position: 'absolute', top: 20, left: 20 }}>
                                <Text variant="headlineMedium" style={{ color: 'white', fontWeight: 'bold', width: '70%' }}>
                                    Build Your Dream Project
                                </Text>
                                <Text variant="bodyMedium" style={{ color: '#AAA', marginTop: 8 }}>
                                    Get expert help for IoT, Coding, and Hardware.
                                </Text>
                                <Button mode="contained" style={styles.heroBtn} labelStyle={{ fontWeight: 'bold' }}>
                                    Start Now
                                </Button>
                            </View>
                            <Icon name="rocket" size={120} color="rgba(255,255,255,0.1)" style={{ position: 'absolute', right: -20, bottom: -20 }} />
                        </View>
                    </View>
                </FadeInView>

                {/* Categories Grid */}
                <FadeInView delay={200}>
                    <Text variant="titleLarge" style={styles.sectionTitle}>Browse Categories</Text>
                </FadeInView>
                <View style={styles.grid}>
                    {CATEGORIES.map((cat, index) => (
                        <FadeInView key={cat.id} delay={300 + (index * 100)} style={styles.catCardContainer}>
                            <TouchableOpacity>
                                <Card style={styles.catCard}>
                                    <View style={[styles.iconCircle, { backgroundColor: cat.color + '20' }]}>
                                        <Icon name={cat.icon} size={32} color={cat.color} />
                                    </View>
                                    <Text variant="titleMedium" style={{ fontWeight: '600', marginTop: 12 }}>{cat.name}</Text>
                                </Card>
                            </TouchableOpacity>
                        </FadeInView>
                    ))}
                </View>

                {/* Submit Requirement CTA */}
                <Card style={styles.ctaCard}>
                    <Card.Content style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                            <Text variant="titleMedium" style={{ fontWeight: 'bold', color: 'white' }}>Have a custom requirement?</Text>
                            <Text variant="bodySmall" style={{ color: 'rgba(255,255,255,0.8)' }}>Submit your abstract and get a quote.</Text>
                        </View>
                        <Button
                            mode="contained"
                            buttonColor="white"
                            textColor={theme.colors.primary}
                            onPress={() => navigation.navigate('RequirementForm')}
                        >
                            Upload
                        </Button>
                    </Card.Content>
                </Card>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    heroContainer: {
        height: 220,
        margin: 16,
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 8,
    },
    heroImage: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    heroBtn: {
        marginTop: 16,
        alignSelf: 'flex-start',
        backgroundColor: '#FF6B35',
    },
    sectionTitle: {
        marginLeft: 20,
        marginBottom: 16,
        fontWeight: 'bold',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 12,
    },
    catCardContainer: {
        width: '50%',
        padding: 6,
    },
    catCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        height: 140,
        justifyContent: 'center',
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ctaCard: {
        margin: 16,
        backgroundColor: '#004E89', // Trust Blue
        borderRadius: 16,
    }
});
