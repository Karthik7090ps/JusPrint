import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Chip, Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppHeader } from '../../components/common/AppHeader';
import LinearGradient from 'react-native-linear-gradient';

export const CampusConnect = ({ navigation }: { navigation: any }) => {
    const stats = {
        totalEvents: 0,
        activeEvents: 0,
        totalRegistrations: 0,
        revenue: 0,
    };

    const features = [
        {
            icon: 'calendar-plus',
            title: 'Create Events',
            description: 'Design custom registration forms',
            color: '#6366F1',
        },
        {
            icon: 'share-variant',
            title: 'Share Links',
            description: 'QR codes & shareable URLs',
            color: '#EC4899',
        },
        {
            icon: 'chart-line',
            title: 'Track Analytics',
            description: 'Monitor registrations in real-time',
            color: '#10B981',
        },
        {
            icon: 'cash-multiple',
            title: 'Collect Fees',
            description: 'Integrated payment processing',
            color: '#F59E0B',
        },
    ];

    return (
        <View style={styles.container}>
            <AppHeader title="CampusConnect" subtitle="Event Management for Colleges" />
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>

                {/* Hero Section - Minimalist Redesign */}
                <View style={styles.heroSection}>
                    <View style={styles.heroIconBox}>
                        <Icon name="calendar-star" size={42} color="white" />
                    </View>
                    <Text style={styles.heroTitle}>Manage Your Campus Events</Text>
                    <Text style={styles.heroSubtitle}>
                        Everything from registration to fee collection in one place.
                    </Text>

                    <View style={styles.ctaRow}>
                        <Button
                            mode="contained"
                            style={styles.mainCta}
                            labelStyle={{ fontWeight: 'bold' }}
                            onPress={() => navigation.navigate('CoordinatorAuth')}
                        >
                            Coordinator Portal
                        </Button>
                        <Button
                            mode="outlined"
                            style={styles.secondaryCta}
                            onPress={() => navigation.navigate('StudentEventBrowse')}
                        >
                            Browse Events
                        </Button>
                    </View>
                </View>

                {/* Stats Section - Only show if coordinator is logged in */}
                {stats.totalEvents > 0 && (
                    <View style={styles.statsContainer}>
                        <Text style={styles.sectionTitle}>Your Stats</Text>
                        <View style={styles.statsGrid}>
                            <Card style={styles.statCard}>
                                <Card.Content style={styles.statContent}>
                                    <Icon name="calendar-check" size={28} color="#6366F1" />
                                    <Text style={styles.statValue}>{stats.totalEvents}</Text>
                                    <Text style={styles.statLabel}>Total Events</Text>
                                </Card.Content>
                            </Card>
                            <Card style={styles.statCard}>
                                <Card.Content style={styles.statContent}>
                                    <Icon name="account-multiple" size={28} color="#EC4899" />
                                    <Text style={styles.statValue}>{stats.totalRegistrations}</Text>
                                    <Text style={styles.statLabel}>Registrations</Text>
                                </Card.Content>
                            </Card>
                            <Card style={styles.statCard}>
                                <Card.Content style={styles.statContent}>
                                    <Icon name="chart-timeline-variant" size={28} color="#10B981" />
                                    <Text style={styles.statValue}>{stats.activeEvents}</Text>
                                    <Text style={styles.statLabel}>Active Now</Text>
                                </Card.Content>
                            </Card>
                            <Card style={styles.statCard}>
                                <Card.Content style={styles.statContent}>
                                    <Icon name="currency-inr" size={28} color="#F59E0B" />
                                    <Text style={styles.statValue}>₹{stats.revenue}</Text>
                                    <Text style={styles.statLabel}>Revenue</Text>
                                </Card.Content>
                            </Card>
                        </View>
                    </View>
                )}

                {/* Features Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Platform Features</Text>
                    <Text style={styles.sectionSubtitle}>Everything you need to manage campus events</Text>

                    {features.map((feature, index) => (
                        <Card key={index} style={styles.featureCard}>
                            <View style={styles.featureContent}>
                                <View style={[styles.featureIcon, { backgroundColor: feature.color + '15' }]}>
                                    <Icon name={feature.icon} size={32} color={feature.color} />
                                </View>
                                <View style={styles.featureText}>
                                    <Text style={styles.featureTitle}>{feature.title}</Text>
                                    <Text style={styles.featureDescription}>{feature.description}</Text>
                                </View>
                            </View>
                        </Card>
                    ))}
                </View>

                {/* Pricing Info */}
                <Card style={styles.pricingCard}>
                    <Card.Content>
                        <View style={styles.pricingHeader}>
                            <Icon name="tag-multiple" size={32} color="#10B981" />
                            <Text style={styles.pricingTitle}>Simple Pricing</Text>
                        </View>
                        <Text style={styles.pricingText}>
                            <Text style={styles.pricingAmount}>₹1</Text> per registration
                        </Text>
                        <Text style={styles.pricingSubtext}>
                            • No setup fees{'\n'}
                            • No monthly charges{'\n'}
                            • Pay only for successful registrations{'\n'}
                            • Instant payouts
                        </Text>
                        <Chip icon="check-circle" style={styles.pricingChip} textStyle={{ color: '#10B981' }}>
                            First 100 registrations FREE
                        </Chip>
                    </Card.Content>
                </Card>

                {/* How It Works */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>How It Works</Text>

                    <View style={styles.stepContainer}>
                        <Avatar.Icon size={48} icon="numeric-1-circle" style={{ backgroundColor: '#6366F1' }} />
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Create Your Event</Text>
                            <Text style={styles.stepDescription}>
                                Design a custom registration form with the fields you need
                            </Text>
                        </View>
                    </View>

                    <View style={styles.stepContainer}>
                        <Avatar.Icon size={48} icon="numeric-2-circle" style={{ backgroundColor: '#8B5CF6' }} />
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Share the Link</Text>
                            <Text style={styles.stepDescription}>
                                Get a unique shareable link and QR code for your event
                            </Text>
                        </View>
                    </View>

                    <View style={styles.stepContainer}>
                        <Avatar.Icon size={48} icon="numeric-3-circle" style={{ backgroundColor: '#EC4899' }} />
                        <View style={styles.stepContent}>
                            <Text style={styles.stepTitle}>Manage Registrations</Text>
                            <Text style={styles.stepDescription}>
                                Track registrations in real-time and export data anytime
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Use Cases */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Perfect For</Text>
                    <View style={styles.useCasesGrid}>
                        {['Tech Fests', 'Cultural Events', 'Workshops', 'Hackathons', 'Seminars', 'Sports Events'].map((useCase, index) => (
                            <Chip
                                key={index}
                                style={styles.useCaseChip}
                                icon="check"
                                textStyle={{ fontSize: 13, fontWeight: '600' }}
                            >
                                {useCase}
                            </Chip>
                        ))}
                    </View>
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
    heroSection: {
        margin: 16,
        padding: 24,
        borderRadius: 20,
        backgroundColor: 'white',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    heroIconBox: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#1A1A2E',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A2E',
        textAlign: 'center',
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    ctaRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    mainCta: {
        flex: 1,
        borderRadius: 12,
        backgroundColor: '#1A1A2E',
    },
    secondaryCta: {
        flex: 1,
        borderRadius: 12,
        borderColor: '#1A1A2E',
    },
    statsContainer: {
        padding: 16,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statCard: {
        width: '48%',
        marginBottom: 12,
        borderRadius: 16,
        backgroundColor: 'white',
    },
    statContent: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 8,
        color: '#1A1A2E',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#1A1A2E',
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    featureCard: {
        marginBottom: 12,
        borderRadius: 16,
        backgroundColor: 'white',
    },
    featureContent: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
    },
    featureIcon: {
        width: 64,
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    featureText: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#1A1A2E',
    },
    featureDescription: {
        fontSize: 13,
        color: '#666',
    },
    pricingCard: {
        margin: 16,
        borderRadius: 20,
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#10B981',
    },
    pricingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    pricingTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 12,
        color: '#1A1A2E',
    },
    pricingText: {
        fontSize: 16,
        marginBottom: 16,
        color: '#666',
    },
    pricingAmount: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#10B981',
    },
    pricingSubtext: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
        marginBottom: 16,
    },
    pricingChip: {
        backgroundColor: '#10B98115',
        alignSelf: 'flex-start',
    },
    stepContainer: {
        flexDirection: 'row',
        marginBottom: 24,
        alignItems: 'flex-start',
    },
    stepContent: {
        flex: 1,
        marginLeft: 16,
    },
    stepTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#1A1A2E',
    },
    stepDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    useCasesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    useCaseChip: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
});
