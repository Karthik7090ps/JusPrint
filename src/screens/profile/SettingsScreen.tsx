import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Text, Avatar, List, Divider, useTheme, Button, SegmentedButtons } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AppHeader } from '../../components/common/AppHeader';

export const SettingsScreen = ({ navigation }: { navigation: any }) => {
    const theme = useTheme();

    // Mock State for Settings
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);

    // Default Print Settings
    const [defaultColor, setDefaultColor] = useState('bw');
    const [defaultSides, setDefaultSides] = useState('single');

    return (
        <View style={[styles.container, isDarkMode && styles.containerDark]}>
            <AppHeader title="Settings" showBack={true} showWallet={false} />

            <ScrollView contentContainerStyle={styles.content}>

                {/* Profile Section */}
                <View style={[styles.profileHeader, isDarkMode && styles.cardDark]}>
                    <Avatar.Text size={64} label="JD" style={{ backgroundColor: theme.colors.primary }} />
                    <View style={styles.profileInfo}>
                        <Text variant="titleLarge" style={[{ fontWeight: 'bold' }, isDarkMode && styles.textDark]}>John Doe</Text>
                        <Text variant="bodyMedium" style={{ color: isDarkMode ? '#AAA' : '#666' }}>Student • ID: 2024001</Text>
                        <TouchableOpacity>
                            <Text style={{ color: theme.colors.primary, marginTop: 4, fontWeight: 'bold' }}>Edit Profile</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Section: App Settings */}
                <View style={[styles.section, isDarkMode && styles.cardDark]}>
                    <Text variant="titleSmall" style={styles.sectionTitle}>App Settings</Text>

                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <Icon name="theme-light-dark" size={24} color={isDarkMode ? 'white' : '#666'} />
                            <Text variant="bodyLarge" style={[styles.rowLabel, isDarkMode && styles.textDark]}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={isDarkMode}
                            onValueChange={setIsDarkMode}
                            trackColor={{ false: '#767577', true: theme.colors.primary }}
                            thumbColor={isDarkMode ? 'white' : '#f4f3f4'}
                        />
                    </View>

                    <Divider style={[styles.divider, isDarkMode && { backgroundColor: '#444' }]} />

                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <Icon name="bell-outline" size={24} color={isDarkMode ? 'white' : '#666'} />
                            <Text variant="bodyLarge" style={[styles.rowLabel, isDarkMode && styles.textDark]}>Notifications</Text>
                        </View>
                        <Switch
                            value={notifications}
                            onValueChange={setNotifications}
                            trackColor={{ false: '#767577', true: theme.colors.primary }}
                            thumbColor={notifications ? 'white' : '#f4f3f4'}
                        />
                    </View>
                </View>

                {/* Section: Print Defaults */}
                <View style={[styles.section, isDarkMode && styles.cardDark]}>
                    <Text variant="titleSmall" style={styles.sectionTitle}>System Defaults</Text>

                    <View style={styles.settingBlock}>
                        <Text variant="bodyMedium" style={{ marginBottom: 8, color: isDarkMode ? '#CCC' : '#444' }}>Default Color Mode</Text>
                        <SegmentedButtons
                            value={defaultColor}
                            onValueChange={setDefaultColor}
                            buttons={[
                                { value: 'bw', label: 'Black & White' },
                                { value: 'color', label: 'Color' },
                            ]}
                            density="small"
                        />
                    </View>

                    <View style={styles.settingBlock}>
                        <Text variant="bodyMedium" style={{ marginBottom: 8, color: isDarkMode ? '#CCC' : '#444' }}>Default Sides</Text>
                        <SegmentedButtons
                            value={defaultSides}
                            onValueChange={setDefaultSides}
                            buttons={[
                                { value: 'single', label: 'Single Sided' },
                                { value: 'double', label: 'Double Sided' },
                            ]}
                            density="small"
                        />
                    </View>

                    <TouchableOpacity style={styles.linkRow}>
                        <Text variant="bodyMedium" style={isDarkMode && styles.textDark}>Manage Favorite Printers</Text>
                        <Icon name="chevron-right" size={20} color="#999" />
                    </TouchableOpacity>
                </View>

                {/* Section: Support */}
                <View style={[styles.section, isDarkMode && styles.cardDark]}>
                    <Text variant="titleSmall" style={styles.sectionTitle}>Support</Text>
                    <List.Item
                        title="Help & FAQ"
                        titleStyle={isDarkMode && styles.textDark}
                        left={props => <List.Icon {...props} icon="help-circle-outline" color={isDarkMode ? 'white' : undefined} />}
                        right={props => <List.Icon {...props} icon="chevron-right" />}
                        onPress={() => { }}
                    />
                    <Divider style={isDarkMode && { backgroundColor: '#444' }} />
                    <List.Item
                        title="About JusPrint"
                        titleStyle={isDarkMode && styles.textDark}
                        left={props => <List.Icon {...props} icon="information-outline" color={isDarkMode ? 'white' : undefined} />}
                        right={props => <List.Icon {...props} icon="chevron-right" />}
                        onPress={() => { }}
                    />
                    <Divider style={isDarkMode && { backgroundColor: '#444' }} />
                    <List.Item
                        title="Log Out"
                        titleStyle={{ color: '#E74C3C' }}
                        left={props => <List.Icon {...props} icon="logout" color="#E74C3C" />}
                        onPress={() => { }}
                    />
                </View>

                <Text style={styles.versionText}>Version 1.0.2 (Build 45)</Text>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F5F9' },
    content: { padding: 16, paddingBottom: 40 },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 16,
        elevation: 2,
    },
    profileInfo: { marginLeft: 16 },
    section: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        elevation: 1,
    },
    sectionTitle: {
        color: '#888',
        marginBottom: 16,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontSize: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    rowLabel: {
        color: '#333',
    },
    divider: {
        marginVertical: 12,
    },
    settingBlock: {
        marginBottom: 16,
    },
    linkRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        marginTop: 8,
    },
    versionText: {
        textAlign: 'center',
        color: '#AAA',
        fontSize: 12,
    },
    // Dark Mode Styles
    containerDark: {
        backgroundColor: '#121212',
    },
    cardDark: {
        backgroundColor: '#1E1E1E',
    },
    textDark: {
        color: 'white',
    },
});
