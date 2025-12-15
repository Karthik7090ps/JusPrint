import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput, Button, Card, useTheme, Chip, SegmentedButtons, Divider, RadioButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppHeader } from '../../components/common/AppHeader';
import { FadeInView } from '../../components/common/Animations';

const PRINT_TECH = [
    { value: 'fdm', label: 'FDM', desc: 'Fastest, affordable', price: '₹8/g' },
    { value: 'sla', label: 'SLA/Resin', desc: 'High detail, smooth', price: '₹15/g' },
];

const MATERIALS = [
    { value: 'pla', label: 'PLA', color: '#4ECDC4', desc: 'Standard, biodegradable' },
    { value: 'abs', label: 'ABS', color: '#FF6B6B', desc: 'Strong, heat resistant' },
    { value: 'petg', label: 'PETG', color: '#45B7D1', desc: 'Durable, flexible' },
    { value: 'tpu', label: 'TPU', color: '#96CEB4', desc: 'Flexible, rubber-like' },
];

const COLORS = ['white', 'black', 'red', 'blue', 'green', 'yellow', 'orange'];

export const Print3DScreen = ({ navigation }: { navigation: any }) => {
    const theme = useTheme();

    const [formData, setFormData] = useState({
        technology: 'fdm',
        material: 'pla',
        color: 'white',
        infill: 20,
        quantity: '1',
        hasModel: false,
    });

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleGetQuote = () => {
        Alert.alert(
            '🖨️ Quote Request Submitted',
            'We\'ll analyze your STL file and send pricing within 1-2 hours. Average turnaround: 2-3 days.',
            [{ text: 'OK' }]
        );
    };

    return (
        <View style={styles.container}>
            <AppHeader title="3D Printing" subtitle="Services" />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Upload Section */}
                <FadeInView>
                    <Card style={styles.uploadCard}>
                        <TouchableOpacity
                            style={styles.uploadArea}
                            onPress={() => updateField('hasModel', true)}
                        >
                            <Icon name="cube-outline" size={48} color={theme.colors.primary} />
                            <Text variant="titleMedium" style={{ fontWeight: 'bold', marginTop: 12 }}>
                                Upload 3D Model
                            </Text>
                            <Text variant="bodySmall" style={{ color: '#666', marginTop: 4 }}>
                                STL, OBJ, or 3MF files supported
                            </Text>
                            {formData.hasModel && (
                                <Chip icon="check" style={{ marginTop: 12, backgroundColor: '#E8F5E9' }}>
                                    model_v3.stl uploaded
                                </Chip>
                            )}
                        </TouchableOpacity>
                    </Card>
                </FadeInView>

                {/* Technology */}
                <FadeInView delay={100}>
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text variant="titleMedium" style={styles.sectionTitle}>Print Technology</Text>
                            <View style={styles.techRow}>
                                {PRINT_TECH.map(tech => (
                                    <TouchableOpacity
                                        key={tech.value}
                                        style={[
                                            styles.techCard,
                                            formData.technology === tech.value && {
                                                borderColor: theme.colors.primary,
                                                backgroundColor: theme.colors.primary + '10'
                                            }
                                        ]}
                                        onPress={() => updateField('technology', tech.value)}
                                    >
                                        <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>{tech.label}</Text>
                                        <Text variant="bodySmall" style={{ color: '#666' }}>{tech.desc}</Text>
                                        <Text variant="bodyMedium" style={{ color: theme.colors.primary, fontWeight: 'bold', marginTop: 8 }}>
                                            {tech.price}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </Card.Content>
                    </Card>
                </FadeInView>

                {/* Material */}
                <FadeInView delay={200}>
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text variant="titleMedium" style={styles.sectionTitle}>Material</Text>
                            <View style={styles.materialGrid}>
                                {MATERIALS.map(mat => (
                                    <TouchableOpacity
                                        key={mat.value}
                                        style={[
                                            styles.materialChip,
                                            { borderColor: mat.color },
                                            formData.material === mat.value && {
                                                backgroundColor: mat.color + '20',
                                                borderWidth: 2
                                            }
                                        ]}
                                        onPress={() => updateField('material', mat.value)}
                                    >
                                        <View style={[styles.materialDot, { backgroundColor: mat.color }]} />
                                        <Text variant="bodyMedium" style={{ fontWeight: '500' }}>{mat.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </Card.Content>
                    </Card>
                </FadeInView>

                {/* Color & Infill */}
                <FadeInView delay={300}>
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text variant="titleMedium" style={styles.sectionTitle}>Color</Text>
                            <View style={styles.colorRow}>
                                {COLORS.map(color => (
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

                            <Text variant="titleMedium" style={[styles.sectionTitle, { marginTop: 24 }]}>
                                Infill Density: {formData.infill}%
                            </Text>
                            <View style={styles.infillRow}>
                                <Text variant="bodySmall">Light</Text>
                                <View style={{ flex: 1, marginHorizontal: 12 }}>
                                    {/* Simple slider representation */}
                                    <View style={styles.sliderTrack}>
                                        <View style={[styles.sliderFill, { width: `${formData.infill}%` }]} />
                                    </View>
                                    <View style={styles.sliderButtons}>
                                        {[10, 20, 50, 80, 100].map(val => (
                                            <TouchableOpacity
                                                key={val}
                                                style={[
                                                    styles.infillButton,
                                                    formData.infill === val && { backgroundColor: theme.colors.primary }
                                                ]}
                                                onPress={() => updateField('infill', val)}
                                            >
                                                <Text style={{ color: formData.infill === val ? 'white' : '#666', fontSize: 10 }}>
                                                    {val}%
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                                <Text variant="bodySmall">Solid</Text>
                            </View>

                            <View style={[styles.row, { marginTop: 16 }]}>
                                <Text variant="bodyMedium">Quantity</Text>
                                <View style={styles.quantityControl}>
                                    <TouchableOpacity
                                        style={styles.qtyBtn}
                                        onPress={() => updateField('quantity', String(Math.max(1, Number(formData.quantity) - 1)))}
                                    >
                                        <Icon name="minus" size={20} color="#666" />
                                    </TouchableOpacity>
                                    <Text variant="titleMedium" style={{ fontWeight: 'bold', minWidth: 40, textAlign: 'center' }}>
                                        {formData.quantity}
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.qtyBtn}
                                        onPress={() => updateField('quantity', String(Number(formData.quantity) + 1))}
                                    >
                                        <Icon name="plus" size={20} color="#666" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Card.Content>
                    </Card>
                </FadeInView>

                {/* Estimate */}
                <Card style={[styles.card, { backgroundColor: theme.colors.primary + '10' }]}>
                    <Card.Content>
                        <View style={styles.priceRow}>
                            <Text variant="bodyMedium">Estimated Price</Text>
                            <Text variant="headlineSmall" style={{ fontWeight: 'bold', color: theme.colors.primary }}>
                                ₹320
                            </Text>
                        </View>
                        <Text variant="bodySmall" style={{ color: '#666' }}>
                            Exact price after model analysis. Based on PLA, 20% infill, ~40g estimated.
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
                    icon="printer-3d"
                >
                    Get Print Quote
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
    techRow: {
        flexDirection: 'row',
        gap: 12,
    },
    techCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        alignItems: 'center',
    },
    materialGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    materialChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        gap: 6,
    },
    materialDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
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
    infillRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sliderTrack: {
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
    },
    sliderFill: {
        height: '100%',
        backgroundColor: '#FF6B35',
        borderRadius: 3,
    },
    sliderButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    infillButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#F0F0F0',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    qtyBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
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
