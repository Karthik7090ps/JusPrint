import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Portal, Modal, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ConfirmationDialogProps {
    visible: boolean;
    onDismiss: () => void;
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
    icon?: string;
    type?: 'primary' | 'destructive' | 'warning';
}

/**
 * A premium confirmation dialog for critical actions
 */
export const ConfirmationDialog = ({
    visible,
    onDismiss,
    title,
    description,
    confirmLabel,
    onConfirm,
    icon = 'help-circle-outline',
    type = 'primary'
}: ConfirmationDialogProps) => {
    const theme = useTheme();

    // Choose color based on type
    const getAccentColor = () => {
        switch (type) {
            case 'destructive': return '#E74C3C';
            case 'warning': return '#F39C12';
            case 'primary':
            default: return theme.colors.primary;
        }
    };

    const accentColor = getAccentColor();
    const isDark = theme.dark;

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={[
                    styles.modalContainer,
                    { backgroundColor: isDark ? '#1E1E1E' : 'white' }
                ]}
            >
                <View style={styles.iconContainer}>
                    <View style={[styles.iconBox, { backgroundColor: accentColor + '15' }]}>
                        <Icon name={icon} size={32} color={accentColor} />
                    </View>
                </View>

                <Text
                    variant="headlineSmall"
                    style={[styles.title, { color: isDark ? 'white' : '#1A1A2E' }]}
                >
                    {title}
                </Text>
                <Text
                    variant="bodyMedium"
                    style={[styles.description, { color: isDark ? '#AAA' : '#666' }]}
                >
                    {description}
                </Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            styles.cancelButton,
                            { backgroundColor: isDark ? '#333' : '#F5F5F7' }
                        ]}
                        onPress={onDismiss}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.cancelButtonText, { color: isDark ? '#AAA' : '#666' }]}>
                            Cancel
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: accentColor }]}
                        onPress={() => {
                            onConfirm();
                            onDismiss();
                        }}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.confirmButtonText}>{confirmLabel}</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        padding: 24,
        margin: 20,
        borderRadius: 24,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: 20,
    },
    iconBox: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    description: {
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 22,
        paddingHorizontal: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    button: {
        flex: 1,
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 0,
    },
    cancelButton: {
    },
    cancelButtonText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    confirmButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
