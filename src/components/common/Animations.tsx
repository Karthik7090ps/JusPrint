import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface FadeInViewProps {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    style?: ViewStyle;
}

/**
 * FadeIn Animation Wrapper
 * Animates children with fade + slide up effect
 */
export const FadeInView = ({
    children,
    delay = 0,
    duration = 400,
    style
}: FadeInViewProps) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, [delay, duration, fadeAnim, translateY]);

    return (
        <Animated.View
            style={[
                style,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY }],
                }
            ]}
        >
            {children}
        </Animated.View>
    );
};

interface StaggeredListProps {
    children: React.ReactNode[];
    staggerDelay?: number;
    duration?: number;
}

/**
 * Staggered List Animation
 * Wraps each child with a FadeInView with increasing delay
 */
export const StaggeredList = ({
    children,
    staggerDelay = 100,
    duration = 400
}: StaggeredListProps) => {
    return (
        <>
            {React.Children.map(children, (child, index) => (
                <FadeInView key={index} delay={index * staggerDelay} duration={duration}>
                    {child}
                </FadeInView>
            ))}
        </>
    );
};

interface ScaleOnPressProps {
    children: React.ReactNode;
    style?: ViewStyle;
    onPress?: () => void;
}

/**
 * Scale on Press Animation
 * Provides haptic-like feedback with scale animation
 */
export const ScaleOnPress = ({ children, style, onPress }: ScaleOnPressProps) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
        }).start();
        onPress?.();
    };

    return (
        <Animated.View
            style={[style, { transform: [{ scale: scaleAnim }] }]}
        // Note: This needs to be wrapped in a Pressable/TouchableOpacity in actual usage
        >
            {children}
        </Animated.View>
    );
};
