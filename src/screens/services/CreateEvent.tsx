import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput, Button, Card, Chip, Switch, IconButton, Menu } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppHeader } from '../../components/common/AppHeader';

type FormField = {
    id: string;
    label: string;
    type: 'text' | 'email' | 'phone' | 'number' | 'dropdown' | 'checkbox' | 'date';
    required: boolean;
    options?: string[];
};

export const CreateEvent = ({ navigation, route }: { navigation: any; route: any }) => {
    const isEditing = !!route?.params?.eventId;

    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        venue: '',
        category: '',
        maxCapacity: '',
        registrationFee: '',
        coverImage: '',
    });

    const [formFields, setFormFields] = useState<FormField[]>([
        { id: '1', label: 'Full Name', type: 'text', required: true },
        { id: '2', label: 'Email Address', type: 'email', required: true },
        { id: '3', label: 'Phone Number', type: 'phone', required: true },
    ]);

    const [newFieldMenu, setNewFieldMenu] = useState(false);
    const [collectFee, setCollectFee] = useState(false);
    const [loading, setLoading] = useState(false);

    const fieldTypes: Array<{ type: FormField['type']; label: string; icon: string }> = [
        { type: 'text', label: 'Short Answer', icon: 'text-short' },
        { type: 'email', label: 'Email', icon: 'email' },
        { type: 'phone', label: 'Phone Number', icon: 'phone' },
        { type: 'number', label: 'Number', icon: 'numeric' },
        { type: 'dropdown', label: 'Dropdown', icon: 'menu-down' },
        { type: 'checkbox', label: 'Checkbox', icon: 'checkbox-marked' },
        { type: 'date', label: 'Date', icon: 'calendar' },
    ];

    const addFormField = (type: FormField['type']) => {
        const newField: FormField = {
            id: Date.now().toString(),
            label: `New ${type} field`,
            type,
            required: false,
            options: type === 'dropdown' ? ['Option 1', 'Option 2'] : undefined,
        };
        setFormFields([...formFields, newField]);
        setNewFieldMenu(false);
    };

    const updateField = (id: string, updates: Partial<FormField>) => {
        setFormFields(formFields.map(field =>
            field.id === id ? { ...field, ...updates } : field
        ));
    };

    const removeField = (id: string) => {
        Alert.alert(
            'Remove Field',
            'Are you sure you want to remove this field?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', onPress: () => setFormFields(formFields.filter(f => f.id !== id)), style: 'destructive' },
            ]
        );
    };

    const handleSave = async (status: 'draft' | 'active') => {
        setLoading(true);
        // TODO: API call to save event
        setTimeout(() => {
            setLoading(false);
            navigation.goBack();
        }, 1500);
    };

    return (
        <View style={styles.container}>
            <AppHeader
                title={isEditing ? 'Edit Event' : 'Create Event'}
                subtitle="Design your registration form"
                showBack
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Basic Information */}
                <Card style={styles.sectionCard}>
                    <Card.Content>
                        <Text style={styles.sectionTitle}>Event Information</Text>

                        <TextInput
                            label="Event Title *"
                            value={eventData.title}
                            onChangeText={(text) => setEventData({ ...eventData, title: text })}
                            style={styles.input}
                            mode="outlined"
                            placeholder="e.g., Tech Fest 2024 - Hackathon"
                        />

                        <TextInput
                            label="Description *"
                            value={eventData.description}
                            onChangeText={(text) => setEventData({ ...eventData, description: text })}
                            style={styles.input}
                            mode="outlined"
                            multiline
                            numberOfLines={4}
                            placeholder="Describe your event..."
                        />

                        <View style={styles.row}>
                            <TextInput
                                label="Date *"
                                value={eventData.date}
                                onChangeText={(text) => setEventData({ ...eventData, date: text })}
                                style={[styles.input, styles.halfInput]}
                                mode="outlined"
                                placeholder="YYYY-MM-DD"
                                right={<TextInput.Icon icon="calendar" />}
                            />
                            <TextInput
                                label="Time *"
                                value={eventData.time}
                                onChangeText={(text) => setEventData({ ...eventData, time: text })}
                                style={[styles.input, styles.halfInput]}
                                mode="outlined"
                                placeholder="HH:MM"
                                right={<TextInput.Icon icon="clock" />}
                            />
                        </View>

                        <TextInput
                            label="Venue *"
                            value={eventData.venue}
                            onChangeText={(text) => setEventData({ ...eventData, venue: text })}
                            style={styles.input}
                            mode="outlined"
                            placeholder="e.g., Main Auditorium"
                            left={<TextInput.Icon icon="map-marker" />}
                        />

                        <View style={styles.row}>
                            <TextInput
                                label="Category"
                                value={eventData.category}
                                onChangeText={(text) => setEventData({ ...eventData, category: text })}
                                style={[styles.input, styles.halfInput]}
                                mode="outlined"
                                placeholder="Technical"
                            />
                            <TextInput
                                label="Max Capacity"
                                value={eventData.maxCapacity}
                                onChangeText={(text) => setEventData({ ...eventData, maxCapacity: text })}
                                style={[styles.input, styles.halfInput]}
                                mode="outlined"
                                keyboardType="number-pad"
                                placeholder="Optional"
                            />
                        </View>
                    </Card.Content>
                </Card>

                {/* Registration Fee */}
                <Card style={styles.sectionCard}>
                    <Card.Content>
                        <View style={styles.switchRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.switchLabel}>Collect Registration Fee</Text>
                                <Text style={styles.switchSubtext}>
                                    Charge students for event registration
                                </Text>
                            </View>
                            <Switch value={collectFee} onValueChange={setCollectFee} />
                        </View>

                        {collectFee && (
                            <TextInput
                                label="Registration Fee (₹)"
                                value={eventData.registrationFee}
                                onChangeText={(text) => setEventData({ ...eventData, registrationFee: text })}
                                style={styles.input}
                                mode="outlined"
                                keyboardType="number-pad"
                                placeholder="50"
                                left={<TextInput.Icon icon="currency-inr" />}
                            />
                        )}

                        {collectFee && (
                            <View style={styles.feeInfo}>
                                <Icon name="information" size={20} color="#6366F1" />
                                <Text style={styles.feeInfoText}>
                                    Platform fee: ₹1 per registration will be deducted
                                </Text>
                            </View>
                        )}
                    </Card.Content>
                </Card>

                {/* Registration Form Builder */}
                <Card style={styles.sectionCard}>
                    <Card.Content>
                        <View style={styles.formBuilderHeader}>
                            <Text style={styles.sectionTitle}>Registration Form</Text>
                            <Menu
                                visible={newFieldMenu}
                                onDismiss={() => setNewFieldMenu(false)}
                                anchor={
                                    <Button
                                        mode="contained"
                                        onPress={() => setNewFieldMenu(true)}
                                        icon="plus"
                                        compact
                                    >
                                        Add Field
                                    </Button>
                                }
                            >
                                {fieldTypes.map((fieldType) => (
                                    <Menu.Item
                                        key={fieldType.type}
                                        leadingIcon={fieldType.icon}
                                        onPress={() => addFormField(fieldType.type)}
                                        title={fieldType.label}
                                    />
                                ))}
                            </Menu>
                        </View>

                        {formFields.map((field, index) => (
                            <Card key={field.id} style={styles.fieldCard}>
                                <Card.Content>
                                    <View style={styles.fieldHeader}>
                                        <Icon
                                            name={fieldTypes.find(ft => ft.type === field.type)?.icon || 'text'}
                                            size={20}
                                            color="#6366F1"
                                        />
                                        <Text style={styles.fieldType}>
                                            {fieldTypes.find(ft => ft.type === field.type)?.label}
                                        </Text>
                                        <View style={{ flex: 1 }} />
                                        <Switch
                                            value={field.required}
                                            onValueChange={(value) => updateField(field.id, { required: value })}
                                        />
                                        <IconButton
                                            icon="delete"
                                            size={20}
                                            onPress={() => removeField(field.id)}
                                            disabled={index < 3} // Can't delete name, email, phone
                                        />
                                    </View>

                                    <TextInput
                                        label="Field Label"
                                        value={field.label}
                                        onChangeText={(text) => updateField(field.id, { label: text })}
                                        style={styles.input}
                                        mode="outlined"
                                        disabled={index < 3}
                                    />

                                    {field.type === 'dropdown' && (
                                        <View style={styles.optionsContainer}>
                                            <Text style={styles.optionsLabel}>Options:</Text>
                                            {field.options?.map((option, optIndex) => (
                                                <View key={optIndex} style={styles.optionRow}>
                                                    <TextInput
                                                        value={option}
                                                        onChangeText={(text) => {
                                                            const newOptions = [...(field.options || [])];
                                                            newOptions[optIndex] = text;
                                                            updateField(field.id, { options: newOptions });
                                                        }}
                                                        style={[styles.input, { flex: 1 }]}
                                                        mode="outlined"
                                                        dense
                                                    />
                                                    <IconButton
                                                        icon="close"
                                                        size={20}
                                                        onPress={() => {
                                                            const newOptions = field.options?.filter((_, i) => i !== optIndex);
                                                            updateField(field.id, { options: newOptions });
                                                        }}
                                                    />
                                                </View>
                                            ))}
                                            <Button
                                                mode="outlined"
                                                onPress={() => {
                                                    const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
                                                    updateField(field.id, { options: newOptions });
                                                }}
                                                icon="plus"
                                                compact
                                                style={{ marginTop: 8 }}
                                            >
                                                Add Option
                                            </Button>
                                        </View>
                                    )}

                                    {field.required && (
                                        <Chip icon="asterisk" style={styles.requiredChip} textStyle={{ fontSize: 11 }}>
                                            Required
                                        </Chip>
                                    )}
                                </Card.Content>
                            </Card>
                        ))}
                    </Card.Content>
                </Card>

                {/* Save Buttons */}
                <View style={styles.actions}>
                    <Button
                        mode="outlined"
                        onPress={() => handleSave('draft')}
                        style={styles.actionButton}
                        loading={loading}
                        disabled={loading}
                    >
                        Save as Draft
                    </Button>
                    <Button
                        mode="contained"
                        onPress={() => handleSave('active')}
                        style={styles.actionButton}
                        loading={loading}
                        disabled={loading}
                        icon="check"
                    >
                        Publish Event
                    </Button>
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
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    sectionCard: {
        marginBottom: 16,
        borderRadius: 16,
        backgroundColor: 'white',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#1A1A2E',
    },
    input: {
        marginBottom: 16,
        backgroundColor: 'white',
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfInput: {
        flex: 1,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A2E',
    },
    switchSubtext: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    feeInfo: {
        flexDirection: 'row',
        backgroundColor: '#6366F115',
        padding: 12,
        borderRadius: 12,
        gap: 8,
        marginTop: 8,
    },
    feeInfoText: {
        flex: 1,
        fontSize: 13,
        color: '#666',
    },
    formBuilderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    fieldCard: {
        marginBottom: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
    },
    fieldHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    fieldType: {
        fontSize: 13,
        color: '#666',
        fontWeight: '600',
    },
    optionsContainer: {
        marginTop: 8,
    },
    optionsLabel: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
        color: '#666',
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    requiredChip: {
        backgroundColor: '#EF444415',
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 6,
    },
});
