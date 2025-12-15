import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, ViewStyle } from 'react-native';

const { width } = Dimensions.get('window');

interface SkeletonProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
}

/**
 * Shimmer Skeleton Loader Component
 * Shows animated placeholder while content loads
 */
export const Skeleton = ({
    width: skeletonWidth = '100%',
    height = 20,
    borderRadius = 8,
    style
}: SkeletonProps) => {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const shimmer = Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        shimmer.start();
        return () => shimmer.stop();
    }, [shimmerAnim]);

    const opacity = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                styles.skeleton,
                {
                    width: skeletonWidth as any, // DimensionValue type
                    height,
                    borderRadius,
                    opacity,
                },
                style
            ]}
        />
    );
};

/**
 * Skeleton Card - For product/service cards
 */
export const SkeletonCard = () => (
    <View style={styles.card}>
        <Skeleton height={120} borderRadius={12} />
        <View style={styles.cardContent}>
            <Skeleton height={16} width="80%" style={{ marginBottom: 8 }} />
            <Skeleton height={14} width="50%" style={{ marginBottom: 8 }} />
            <Skeleton height={12} width="60%" />
        </View>
    </View>
);

/**
 * Skeleton for Carousel Banner
 */
export const SkeletonCarousel = () => (
    <View style={styles.carouselContainer}>
        <Skeleton height={160} width={width - 32} borderRadius={16} />
        <View style={styles.dotsContainer}>
            <Skeleton height={8} width={20} borderRadius={4} style={{ marginHorizontal: 3 }} />
            <Skeleton height={8} width={8} borderRadius={4} style={{ marginHorizontal: 3 }} />
            <Skeleton height={8} width={8} borderRadius={4} style={{ marginHorizontal: 3 }} />
        </View>
    </View>
);

/**
 * Skeleton for List Item (Forum topic, recent job, etc.)
 */
export const SkeletonListItem = () => (
    <View style={styles.listItem}>
        <Skeleton height={40} width={40} borderRadius={20} />
        <View style={styles.listContent}>
            <Skeleton height={14} width="70%" style={{ marginBottom: 6 }} />
            <Skeleton height={12} width="40%" />
        </View>
    </View>
);

const styles = StyleSheet.create({
    skeleton: {
        backgroundColor: '#E0E0E0',
    },
    card: {
        width: '47%',
        margin: '1.5%',
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
    },
    cardContent: {
        padding: 12,
    },
    carouselContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 12,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 8,
    },
    listContent: {
        flex: 1,
        marginLeft: 12,
    },
});
