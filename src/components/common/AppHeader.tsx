import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface AppHeaderProps {
    showLogo?: boolean;
    title?: string;
    subtitle?: string;
    showBack?: boolean;
    showWallet?: boolean;
    walletBalance?: number;
}

/**
 * AppHeader - Stylish header with JusPrint logo
 */
export const AppHeader = ({
    showLogo = true,
    title,
    subtitle,
    showBack = false,
    showWallet = true,
    walletBalance = 450,
}: AppHeaderProps) => {
    const theme = useTheme();
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.leftSection}>
                {showBack && (
                    <IconButton
                        icon="arrow-left"
                        size={24}
                        onPress={() => navigation.goBack()}
                        style={{ marginRight: 4 }}
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

            {showWallet && (
                <TouchableOpacity style={styles.walletBadge}>
                    <Icon name="wallet" size={18} color={theme.colors.primary} />
                    <Text style={[styles.walletText, { color: theme.colors.primary }]}>
                        ₹{walletBalance}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: 'white',
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
    walletBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF5F0',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
    },
    walletText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
});
