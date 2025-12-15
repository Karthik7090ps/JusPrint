import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const CustomTabBarButton = ({ children, onPress }: any) => {
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <View style={styles.button}>
                <Icon name="printer" size={32} color="white" />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        top: -24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FF6B35',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 8,
    },
    button: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#FF6B35',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#F4F5F9', // Matches background to create floating effect
    },
});
