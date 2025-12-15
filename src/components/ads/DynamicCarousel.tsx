import React, { useRef, useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { AdContent } from '../../types/ads';
import { safeOpenUrl } from '../../services/securityService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;
const AUTO_SCROLL_INTERVAL = 5000; // 5 seconds

interface Props {
    data: AdContent[];
    onPress?: (ad: AdContent) => void;
    autoScroll?: boolean;
}

export const DynamicCarousel = ({ data, onPress, autoScroll = true }: Props) => {
    const theme = useTheme();
    const scrollRef = useRef<ScrollView>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    // Sort by priority (higher first)
    const sortedData = [...data].sort((a, b) => b.priority - a.priority);

    // Auto-scroll effect
    useEffect(() => {
        if (!autoScroll || sortedData.length <= 1) return;

        const interval = setInterval(() => {
            setActiveIndex(prev => {
                const nextIndex = (prev + 1) % sortedData.length;
                scrollRef.current?.scrollTo({ x: nextIndex * (CARD_WIDTH + 16), animated: true });
                return nextIndex;
            });
        }, AUTO_SCROLL_INTERVAL);

        return () => clearInterval(interval);
    }, [autoScroll, sortedData.length]);

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const scrollPosition = event.nativeEvent.contentOffset.x;
        const index = Math.round(scrollPosition / (CARD_WIDTH + 16));
        setActiveIndex(index);
    };

    const handlePress = async (ad: AdContent) => {
        if (onPress) {
            onPress(ad);
            return;
        }
        if (ad.action_url) {
            // Use secure URL opening
            await safeOpenUrl(ad.action_url);
        }
    };

    if (!sortedData || sortedData.length === 0) return null;

    return (
        <View>
            <ScrollView
                ref={scrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.container}
                snapToInterval={CARD_WIDTH + 16}
                decelerationRate="fast"
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {sortedData.map((ad) => (
                    <TouchableOpacity
                        key={ad.id}
                        style={[styles.card, { backgroundColor: ad.bg_color || theme.colors.surface }]}
                        onPress={() => handlePress(ad)}
                        activeOpacity={0.9}
                    >
                        <Image source={{ uri: ad.image_url }} style={styles.image} resizeMode="cover" />
                        <View style={styles.overlay}>
                            <Text variant="titleMedium" style={styles.title} numberOfLines={2}>
                                {ad.title}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Pagination Dots */}
            {sortedData.length > 1 && (
                <View style={styles.pagination}>
                    {sortedData.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                {
                                    backgroundColor: index === activeIndex ? theme.colors.primary : '#D0D0D0',
                                    width: index === activeIndex ? 20 : 8,
                                }
                            ]}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 16,
    },
    card: {
        width: CARD_WIDTH,
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 12,
    },
    title: {
        color: 'white',
        fontWeight: 'bold',
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        gap: 6,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
});
