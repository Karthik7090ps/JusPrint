import React from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { getInitials, getAvatarColor } from '../../utils/avatarUtils';

interface AppHeaderProps {
    showLogo?: boolean;
    title?: string;
    subtitle?: string;
    showBack?: boolean;
}

/**
 * AppHeader - Stylish header with JusPrint logo and safe area handling
 */
export const AppHeader = ({
    showLogo = true,
    title,
    subtitle,
    showBack = false,
}: AppHeaderProps) => {
    const theme = useTheme();
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { name, campusCode } = useSelector((state: RootState) => state.auth);

    const initials = getInitials(name);
    const avatarColor = getAvatarColor(name);

    return (
        <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
            <StatusBar barStyle="dark-content" backgroundColor="white" />
            <View style={styles.content}>
                <View style={styles.leftSection}>
                    {showBack && (
                        <IconButton
                            icon="arrow-left"
                            size={24}
                            onPress={() => navigation.goBack()}
                            style={{ marginRight: 4, marginLeft: -8 }}
                        />
                    )}

                    {showLogo ? (
                        <View style={styles.logoContainer}>
                            <View style={[styles.logoIcon, { backgroundColor: theme.colors.primary }]}>
                                <Icon name="printer" size={20} color="white" />
                            </View>
                            <View>
                                <Text style={styles.logoText}>
                                    <Text style={{ color: theme.colors.primary }}>Jus</Text>
                                    <Text style={{ color: '#FF9F43' }}>Print</Text>
                                </Text>
                                {subtitle && (
                                    <Text style={styles.subtitle}>{subtitle}</Text>
                                )}
                            </View>
                        </View>
                    ) : (
                        <View>
                            <Text variant="titleLarge" style={styles.title}>{title}</Text>
                            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                        </View>
                    )}
                </View>

                {/* Profile Section with Campus Code */}
                <View style={styles.rightSection}>
                    {campusCode && (
                        <View style={[styles.campusBadge, { backgroundColor: theme.colors.primary + '15' }]}>
                            <Text style={[styles.campusCode, { color: theme.colors.primary }]}>{campusCode}</Text>
                        </View>
                    )}
                    <TouchableOpacity
                        style={[styles.profileBtn, { backgroundColor: avatarColor }]}
                        onPress={() => navigation.navigate('Settings')}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>{initials}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    logoText: {
        fontSize: 22,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    title: {
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    profileBtn: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#9B59B6',
        borderRadius: 18,
        borderWidth: 2,
        borderColor: 'white',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    campusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    campusCode: {
        fontSize: 12,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
});
