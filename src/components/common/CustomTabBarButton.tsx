import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const CustomTabBarButton = ({ children, onPress }: any) => {
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.85}
        >
            <View style={styles.button}>
                <Icon name="printer" size={26} color="white" />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        top: -12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    button: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#1A1A2E', // Neutral dark color instead of bright orange
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#F4F5F9',
    },
});
