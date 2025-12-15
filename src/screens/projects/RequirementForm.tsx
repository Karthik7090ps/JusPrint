import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput, Button, Card, useTheme, Chip, SegmentedButtons, IconButton, RadioButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppHeader } from '../../components/common/AppHeader';
import { FadeInView } from '../../components/common/Animations';

const CATEGORIES = [
    { value: 'electronics', label: 'Electronics', icon: 'chip' },
    { value: 'iot', label: 'IoT', icon: 'access-point-network' },
    { value: 'cs', label: 'Computer Science', icon: 'laptop-code' },
    { value: 'electrical', label: 'Electrical', icon: 'flash' },
    { value: 'mechanical', label: 'Mechanical', icon: 'cog' },
];

const COMPLEXITY_OPTIONS = [
    { value: 'basic', label: 'Basic', price: '₹2,000 - ₹5,000', time: '1-2 weeks' },
    { value: 'intermediate', label: 'Intermediate', price: '₹5,000 - ₹15,000', time: '2-4 weeks' },
    { value: 'advanced', label: 'Advanced', price: '₹15,000+', time: '4-8 weeks' },
];

export const RequirementForm = ({ navigation }: { navigation: any }) => {
    const theme = useTheme();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        category: '',
        title: '',
        description: '',
        complexity: 'intermediate',
        deadline: '',
        budget: '',
        hasAbstract: false,
    });

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        Alert.alert(
            '✅ Requirement Submitted!',
            'Our team will review your project and get back within 24 hours with a quote.',
            [
                { text: 'View Status', onPress: () => navigation.goBack() },
                { text: 'OK' }
            ]
        );
    };

    const isStep1Valid = formData.category && formData.title;
    const isStep2Valid = formData.description.length > 20;

    return (
        <View style={styles.container}>
            <AppHeader title="Submit Requirement" subtitle="Projects" />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Progress Indicator */}
                <View style={styles.progressContainer}>
                    {[1, 2, 3].map(s => (
                        <View key={s} style={styles.progressStep}>
                            <View style={[
                                styles.progressDot,
                                { backgroundColor: s <= step ? theme.colors.primary : '#E0E0E0' }
                            ]}>
                                {s < step ? (
                                    <Icon name="check" size={14} color="white" />
                                ) : (
                                    <Text style={{ color: s <= step ? 'white' : '#888', fontWeight: 'bold' }}>{s}</Text>
                                )}
                            </View>
                            <Text style={[styles.progressLabel, { color: s <= step ? theme.colors.primary : '#888' }]}>
                                {s === 1 ? 'Basics' : s === 2 ? 'Details' : 'Confirm'}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Step 1: Category & Title */}
                {step === 1 && (
                    <FadeInView>
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text variant="titleMedium" style={styles.sectionTitle}>Select Category</Text>
                                <View style={styles.categoryGrid}>
                                    {CATEGORIES.map(cat => (
                                        <TouchableOpacity
                                            key={cat.value}
                                            style={[
                                                styles.categoryChip,
                                                formData.category === cat.value && {
                                                    backgroundColor: theme.colors.primary + '20',
                                                    borderColor: theme.colors.primary
                                                }
                                            ]}
                                            onPress={() => updateField('category', cat.value)}
                                        >
                                            <Icon
                                                name={cat.icon}
                                                size={24}
                                                color={formData.category === cat.value ? theme.colors.primary : '#666'}
                                            />
                                            <Text style={[
                                                styles.categoryLabel,
                                                formData.category === cat.value && { color: theme.colors.primary }
                                            ]}>
                                                {cat.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text variant="titleMedium" style={[styles.sectionTitle, { marginTop: 24 }]}>Project Title</Text>
                                <TextInput
                                    mode="outlined"
                                    placeholder="e.g. Smart Attendance System using RFID"
                                    value={formData.title}
                                    onChangeText={(t) => updateField('title', t)}
                                    style={styles.input}
                                />
                            </Card.Content>
                        </Card>
                    </FadeInView>
                )}

                {/* Step 2: Description & Complexity */}
                {step === 2 && (
                    <FadeInView>
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text variant="titleMedium" style={styles.sectionTitle}>Project Description</Text>
                                <TextInput
                                    mode="outlined"
                                    placeholder="Describe your project requirements in detail..."
                                    value={formData.description}
                                    onChangeText={(t) => updateField('description', t)}
                                    multiline
                                    numberOfLines={5}
                                    style={[styles.input, { height: 120 }]}
                                />

                                <Text variant="titleMedium" style={[styles.sectionTitle, { marginTop: 24 }]}>Complexity Level</Text>
                                {COMPLEXITY_OPTIONS.map(opt => (
                                    <TouchableOpacity
                                        key={opt.value}
                                        style={[
                                            styles.complexityCard,
                                            formData.complexity === opt.value && {
                                                borderColor: theme.colors.primary,
                                                backgroundColor: theme.colors.primary + '10'
                                            }
                                        ]}
                                        onPress={() => updateField('complexity', opt.value)}
                                    >
                                        <View style={styles.complexityContent}>
                                            <RadioButton
                                                value={opt.value}
                                                status={formData.complexity === opt.value ? 'checked' : 'unchecked'}
                                            />
                                            <View style={{ flex: 1 }}>
                                                <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>{opt.label}</Text>
                                                <Text variant="bodySmall" style={{ color: '#666' }}>
                                                    {opt.price} • {opt.time}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </Card.Content>
                        </Card>
                    </FadeInView>
                )}

                {/* Step 3: Review & Submit */}
                {step === 3 && (
                    <FadeInView>
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text variant="titleMedium" style={styles.sectionTitle}>Review Your Requirement</Text>

                                <View style={styles.reviewRow}>
                                    <Text style={styles.reviewLabel}>Category</Text>
                                    <Chip compact>{CATEGORIES.find(c => c.value === formData.category)?.label}</Chip>
                                </View>

                                <View style={styles.reviewRow}>
                                    <Text style={styles.reviewLabel}>Project Title</Text>
                                    <Text style={styles.reviewValue}>{formData.title}</Text>
                                </View>

                                <View style={styles.reviewRow}>
                                    <Text style={styles.reviewLabel}>Complexity</Text>
                                    <Text style={styles.reviewValue}>
                                        {COMPLEXITY_OPTIONS.find(c => c.value === formData.complexity)?.label}
                                    </Text>
                                </View>

                                <View style={[styles.reviewRow, { flexDirection: 'column', alignItems: 'flex-start' }]}>
                                    <Text style={styles.reviewLabel}>Description</Text>
                                    <Text style={[styles.reviewValue, { marginTop: 8 }]} numberOfLines={3}>
                                        {formData.description}
                                    </Text>
                                </View>
                            </Card.Content>
                        </Card>

                        <Card style={[styles.card, { backgroundColor: theme.colors.primary + '10' }]}>
                            <Card.Content style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Icon name="clock-outline" size={24} color={theme.colors.primary} />
                                <View style={{ marginLeft: 12 }}>
                                    <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>Expected Response</Text>
                                    <Text variant="bodySmall" style={{ color: '#666' }}>
                                        Our team will send a detailed quote within 24 hours
                                    </Text>
                                </View>
                            </Card.Content>
                        </Card>
                    </FadeInView>
                )}
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomBar}>
                {step > 1 && (
                    <Button
                        mode="outlined"
                        onPress={() => setStep(s => s - 1)}
                        style={{ flex: 1, marginRight: 8 }}
                    >
                        Back
                    </Button>
                )}
                <Button
                    mode="contained"
                    onPress={() => step < 3 ? setStep(s => s + 1) : handleSubmit()}
                    disabled={step === 1 ? !isStep1Valid : step === 2 ? !isStep2Valid : false}
                    style={{ flex: 1 }}
                >
                    {step < 3 ? 'Continue' : 'Submit Requirement'}
                </Button>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F5F9' },
    scrollContent: { padding: 16, paddingBottom: 100 },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 24,
        gap: 32,
    },
    progressStep: { alignItems: 'center' },
    progressDot: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressLabel: { fontSize: 12, marginTop: 4 },
    card: {
        marginBottom: 16,
        backgroundColor: 'white',
        borderRadius: 16,
    },
    sectionTitle: { fontWeight: 'bold', marginBottom: 12 },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        gap: 8,
    },
    categoryLabel: { fontWeight: '500', color: '#666' },
    input: { backgroundColor: 'white' },
    complexityCard: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        marginBottom: 8,
        overflow: 'hidden',
    },
    complexityContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    reviewRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    reviewLabel: { color: '#666', fontSize: 14 },
    reviewValue: { fontWeight: '500', fontSize: 14, maxWidth: '60%', textAlign: 'right' },
    bottomBar: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
    },
});
