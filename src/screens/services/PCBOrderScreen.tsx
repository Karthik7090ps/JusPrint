import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput, Button, Card, useTheme, Chip, SegmentedButtons, Divider, RadioButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppHeader } from '../../components/common/AppHeader';
import { FadeInView } from '../../components/common/Animations';

const PCB_TYPES = [
    { value: 'single', label: 'Single Layer', price: '₹150/board' },
    { value: 'double', label: 'Double Layer', price: '₹250/board' },
    { value: 'multi', label: 'Multi Layer (4+)', price: '₹500+/board' },
];

const MATERIALS = [
    { value: 'fr4', label: 'FR4 (Standard)', desc: 'Most common PCB material' },
    { value: 'aluminum', label: 'Aluminum', desc: 'For high power/LED boards' },
    { value: 'flex', label: 'Flexible PCB', desc: 'Bendable polyimide' },
];

export const PCBOrderScreen = ({ navigation }: { navigation: any }) => {
    const theme = useTheme();

    const [formData, setFormData] = useState({
        pcbType: 'double',
        material: 'fr4',
        quantity: '5',
        dimensions: '',
        thickness: '1.6mm',
        color: 'green',
        hasGerber: false,
    });

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleGetQuote = () => {
        Alert.alert(
            '📋 Quote Request Submitted',
            'Our PCB team will review your Gerber files and send a detailed quote within 2-4 hours.',
            [
                { text: 'Upload Gerber Files', onPress: () => { } },
                { text: 'OK' }
            ]
        );
    };

    return (
        <View style={styles.container}>
            <AppHeader title="PCB Manufacturing" subtitle="Services" />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Upload Section */}
                <FadeInView>
                    <Card style={styles.uploadCard}>
                        <TouchableOpacity
                            style={styles.uploadArea}
                            onPress={() => updateField('hasGerber', true)}
                        >
                            <Icon name="folder-zip-outline" size={48} color={theme.colors.primary} />
                            <Text variant="titleMedium" style={{ fontWeight: 'bold', marginTop: 12 }}>
                                Upload Gerber Files
                            </Text>
                            <Text variant="bodySmall" style={{ color: '#666', marginTop: 4 }}>
                                ZIP file containing .gbr, .drl files
                            </Text>
                            {formData.hasGerber && (
                                <Chip icon="check" style={{ marginTop: 12, backgroundColor: '#E8F5E9' }}>
                                    gerber_v2.zip uploaded
                                </Chip>
                            )}
                        </TouchableOpacity>
                    </Card>
                </FadeInView>

                {/* PCB Type */}
                <FadeInView delay={100}>
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text variant="titleMedium" style={styles.sectionTitle}>PCB Type</Text>
                            {PCB_TYPES.map(type => (
                                <TouchableOpacity
                                    key={type.value}
                                    style={[
                                        styles.optionRow,
                                        formData.pcbType === type.value && styles.optionRowSelected
                                    ]}
                                    onPress={() => updateField('pcbType', type.value)}
                                >
                                    <RadioButton
                                        value={type.value}
                                        status={formData.pcbType === type.value ? 'checked' : 'unchecked'}
                                    />
                                    <View style={{ flex: 1 }}>
                                        <Text variant="bodyLarge" style={{ fontWeight: '500' }}>{type.label}</Text>
                                    </View>
                                    <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: 'bold' }}>
                                        {type.price}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </Card.Content>
                    </Card>
                </FadeInView>

                {/* Material Selection */}
                <FadeInView delay={200}>
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text variant="titleMedium" style={styles.sectionTitle}>Material</Text>
                            {MATERIALS.map(mat => (
                                <TouchableOpacity
                                    key={mat.value}
                                    style={[
                                        styles.optionRow,
                                        formData.material === mat.value && styles.optionRowSelected
                                    ]}
                                    onPress={() => updateField('material', mat.value)}
                                >
                                    <RadioButton
                                        value={mat.value}
                                        status={formData.material === mat.value ? 'checked' : 'unchecked'}
                                    />
                                    <View style={{ flex: 1 }}>
                                        <Text variant="bodyLarge" style={{ fontWeight: '500' }}>{mat.label}</Text>
                                        <Text variant="bodySmall" style={{ color: '#666' }}>{mat.desc}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </Card.Content>
                    </Card>
                </FadeInView>

                {/* Quantity & Dimensions */}
                <FadeInView delay={300}>
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text variant="titleMedium" style={styles.sectionTitle}>Specifications</Text>
                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text variant="bodySmall" style={{ color: '#666', marginBottom: 4 }}>Quantity</Text>
                                    <TextInput
                                        mode="outlined"
                                        value={formData.quantity}
                                        onChangeText={(t) => updateField('quantity', t)}
                                        keyboardType="numeric"
                                        dense
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text variant="bodySmall" style={{ color: '#666', marginBottom: 4 }}>Dimensions (mm)</Text>
                                    <TextInput
                                        mode="outlined"
                                        placeholder="100x50"
                                        value={formData.dimensions}
                                        onChangeText={(t) => updateField('dimensions', t)}
                                        dense
                                    />
                                </View>
                            </View>

                            <Text variant="bodySmall" style={{ color: '#666', marginTop: 16, marginBottom: 4 }}>
                                Solder Mask Color
                            </Text>
                            <View style={styles.colorRow}>
                                {['green', 'blue', 'red', 'black', 'white'].map(color => (
                                    <TouchableOpacity
                                        key={color}
                                        style={[
                                            styles.colorChip,
                                            { backgroundColor: color === 'white' ? '#F5F5F5' : color },
                                            formData.color === color && { borderWidth: 3, borderColor: theme.colors.primary }
                                        ]}
                                        onPress={() => updateField('color', color)}
                                    />
                                ))}
                            </View>
                        </Card.Content>
                    </Card>
                </FadeInView>

                {/* Price Estimate */}
                <Card style={[styles.card, { backgroundColor: theme.colors.primary + '10' }]}>
                    <Card.Content>
                        <View style={styles.priceRow}>
                            <Text variant="bodyMedium">Estimated Price</Text>
                            <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                                ₹1,250
                            </Text>
                        </View>
                        <Text variant="bodySmall" style={{ color: '#666' }}>
                            Final quote after Gerber review. Includes 5 boards, double-layer FR4.
                        </Text>
                    </Card.Content>
                </Card>
            </ScrollView>

            {/* Bottom CTA */}
            <View style={styles.bottomBar}>
                <Button
                    mode="contained"
                    onPress={handleGetQuote}
                    style={{ flex: 1 }}
                    icon="send"
                >
                    Get Instant Quote
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F5F9' },
    scrollContent: { padding: 16, paddingBottom: 100 },
    uploadCard: {
        marginBottom: 16,
        backgroundColor: 'white',
        borderRadius: 16,
    },
    uploadArea: {
        padding: 24,
        alignItems: 'center',
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#E0E0E0',
        borderRadius: 12,
        margin: 12,
    },
    card: {
        marginBottom: 16,
        backgroundColor: 'white',
        borderRadius: 16,
    },
    sectionTitle: { fontWeight: 'bold', marginBottom: 12 },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderRadius: 8,
        marginBottom: 4,
    },
    optionRowSelected: {
        backgroundColor: '#FFF5F0',
    },
    row: {
        flexDirection: 'row',
    },
    colorRow: {
        flexDirection: 'row',
        gap: 12,
    },
    colorChip: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    bottomBar: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
});
