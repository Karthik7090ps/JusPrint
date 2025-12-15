import React from 'react';
import { TouchableOpacity, Image, StyleSheet, Linking, View } from 'react-native';
import { AdContent } from '../../types/ads';

interface Props {
    ad: AdContent;
    style?: any;
}

export const DynamicBanner = ({ ad, style }: Props) => {
    if (!ad) return null;

    const handlePress = () => {
        if (ad.action_url) {
            Linking.openURL(ad.action_url).catch(err => console.error("Couldn't load page", err));
        }
    };

    return (
        <TouchableOpacity
            style={[styles.container, style]}
            onPress={handlePress}
            activeOpacity={0.9}
        >
            <Image source={{ uri: ad.image_url }} style={styles.image} resizeMode="cover" />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 100,
        borderRadius: 12,
        overflow: 'hidden',
        marginVertical: 12,
    },
    image: {
        width: '100%',
        height: '100%',
    }
});
