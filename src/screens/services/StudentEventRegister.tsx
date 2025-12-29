import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, Card, Button, TextInput, Checkbox, HelperText, ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppHeader } from '../../components/common/AppHeader';

// Types based on the form builder
type FormField = {
    id: string;
    label: string;
    type: 'text' | 'email' | 'phone' | 'number' | 'dropdown' | 'checkbox' | 'date';
    required: boolean;
    options?: string[];
};

export const StudentEventRegister = ({ navigation, route }: { navigation: any; route: any }) => {
    const { eventId } = route.params || {};
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Mock event and form data - in production this would be fetched via API
    const event = {
        id: eventId,
        title: 'Tech Fest 2024 - Hackathon',
        fee: 50,
        organizer: 'Tech Club',
    };

    const formFields: FormField[] = [
        { id: '1', label: 'Full Name', type: 'text', required: true },
        { id: '2', label: 'Email Address', type: 'email', required: true },
        { id: '3', label: 'Phone Number', type: 'phone', required: true },
        { id: '4', label: 'College ID Number', type: 'text', required: true },
        { id: '5', label: 'Year of Study', type: 'dropdown', required: true, options: ['1st Year', '2nd Year', '3rd Year', '4th Year'] },
        { id: '6', label: 'I agree to the event terms and conditions', type: 'checkbox', required: true },
    ];

    // State to hold form responses
    const [responses, setResponses] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (fieldId: string, value: any) => {
        setResponses(prev => ({ ...prev, [fieldId]: value }));
        // Clear error when user types
        if (errors[fieldId]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldId];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        formFields.forEach(field => {
            if (field.required && !responses[field.id]) {
                newErrors[field.id] = 'This field is required';
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            Alert.alert('Incomplete Form', 'Please fill in all required fields.');
            return;
        }

        setSubmitting(true);
        // Simulate API call and payment
        try {
            await new Promise(resolve => setTimeout(() => resolve(null), 2000));
            
            if (event.fee > 0) {
                // In production, navigate to payment gateway
                Alert.alert(
                    'Payment Successful',
                    `Registration for ${event.title} is confirmed. A receipt has been sent to your email.`,
                    [{ text: 'OK', onPress: () => navigation.popToTop() }]
                );
            } else {
                Alert.alert(
                    'Registration Confirmed',
                    `You have successfully registered for ${event.title}.`,
                    [{ text: 'OK', onPress: () => navigation.popToTop() }]
                );
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderField = (field: FormField) => {
        switch (field.type) {
            case 'text':
            case 'email':
            case 'phone':
            case 'number':
                return (
                    <View key={field.id} style={styles.fieldContainer}>
                        <TextInput
                            label={`${field.label}${field.required ? ' *' : ''}`}
                            value={responses[field.id] || ''}
                            onChangeText={(text) => handleInputChange(field.id, text)}
                            mode="outlined"
                            keyboardType={
                                field.type === 'email' ? 'email-address' :
                                field.type === 'phone' ? 'phone-pad' :
                                field.type === 'number' ? 'numeric' : 'default'
                            }
                            error={!!errors[field.id]}
                            style={styles.input}
                        />
                        {errors[field.id] && <HelperText type="error">{errors[field.id]}</HelperText>}
                    </View>
                );

            case 'checkbox':
                return (
                    <View key={field.id} style={styles.checkboxContainer}>
                        <Checkbox.Item
                            label={`${field.label}${field.required ? ' *' : ''}`}
                            status={responses[field.id] ? 'checked' : 'unchecked'}
                            onPress={() => handleInputChange(field.id, !responses[field.id])}
                            mode="android"
                            position="leading"
                            labelStyle={styles.checkboxLabel}
                        />
                        {errors[field.id] && <HelperText type="error" style={{ marginLeft: 36 }}>{errors[field.id]}</HelperText>}
                    </View>
                );

            // Other types would be implemented similarly
            default:
                return (
                    <View key={field.id} style={styles.fieldContainer}>
                        <TextInput
                            label={`${field.label}${field.required ? ' *' : ''} (${field.type})`}
                            value={responses[field.id] || ''}
                            onChangeText={(text) => handleInputChange(field.id, text)}
                            mode="outlined"
                            style={styles.input}
                        />
                    </View>
                );
        }
    };

    return (
        <View style={styles.container}>
            <AppHeader title="Event Registration" showBack />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Event Brief */}
                    <Card style={styles.briefCard}>
                        <Card.Content>
                            <Text style={styles.eventTitle}>{event.title}</Text>
                            <View style={styles.organizerRow}>
                                <Icon name="account-group" size={16} color="#666" />
                                <Text style={styles.organizerText}>Organized by {event.organizer}</Text>
                            </View>
                            {event.fee > 0 && (
                                <View style={styles.feeRow}>
                                    <Icon name="currency-inr" size={18} color="#10B981" />
                                    <Text style={styles.feeText}>{event.fee} Registration Fee</Text>
                                </View>
                            )}
                        </Card.Content>
                    </Card>

                    <Text style={styles.sectionTitle}>Registration Details</Text>
                    <View style={styles.formContainer}>
                        {formFields.map(renderField)}
                    </View>

                    <Button
                        mode="contained"
                        onPress={handleSubmit}
                        loading={submitting}
                        disabled={submitting}
                        style={styles.submitButton}
                        buttonColor="#1A1A2E"
                        labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
                        contentStyle={{ paddingVertical: 8 }}
                    >
                        {event.fee > 0 ? `Pay ₹${event.fee} & Register` : 'Register for Free'}
                    </Button>

                    <Text style={styles.disclaimer}>
                        By registering, you agree to follow the campus code of conduct and event-specific rules.
                    </Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F5F9',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    briefCard: {
        marginBottom: 24,
        borderRadius: 16,
        backgroundColor: 'white',
        borderLeftWidth: 4,
        borderLeftColor: '#1A1A2E',
    },
    eventTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A2E',
        marginBottom: 8,
    },
    organizerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    organizerText: {
        fontSize: 14,
        color: '#666',
    },
    feeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
    },
    feeText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#10B981',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A2E',
        marginBottom: 16,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    formContainer: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
    },
    fieldContainer: {
        marginBottom: 12,
    },
    input: {
        backgroundColor: 'white',
    },
    checkboxContainer: {
        marginLeft: -16,
        marginBottom: 8,
    },
    checkboxLabel: {
        fontSize: 14,
        color: '#444',
        textAlign: 'left',
    },
    submitButton: {
        borderRadius: 12,
        marginBottom: 16,
    },
    disclaimer: {
        fontSize: 12,
        color: '#AAA',
        textAlign: 'center',
        lineHeight: 18,
    },
});
