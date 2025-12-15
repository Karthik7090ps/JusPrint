import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, Card, useTheme, IconButton } from 'react-native-paper';
import { colors } from '../../theme/colors';

export const PrintingWalletCard = () => {
    const theme = useTheme();

    return (
        <Card style={styles.card}>
            <View style={styles.gradientContainer}>
                <View style={styles.row}>
                    <View>
                        <Text variant="bodyMedium" style={styles.label}>Jusprint Balance</Text>
                        <Text variant="displaySmall" style={styles.balance}>₹ 450.00</Text>
                    </View>
                    <IconButton icon="wallet" iconColor="white" size={32} style={styles.iconBg} />
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.actionBtn}>
                        <Text style={styles.actionText}>+ Add Money</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.secondaryBtn]}>
                        <Text style={styles.actionText}>History</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        margin: 16,
        borderRadius: 24,
        elevation: 8, // Soft shadow
        shadowColor: colors.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        backgroundColor: colors.secondary, // Fallback / Base color
        overflow: 'hidden',
    },
    gradientContainer: {
        padding: 24,
        backgroundColor: colors.secondary, // In a real app, use LinearGradient here
        // Mocking a gradient-like feel with simple background for now
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    label: {
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontSize: 12,
    },
    balance: {
        color: 'white',
        fontWeight: '700',
    },
    iconBg: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        margin: 0,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        backgroundColor: colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    secondaryBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    actionText: {
        color: 'white',
        fontWeight: '600',
    }
});
