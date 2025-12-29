import { useEffect, useState, useCallback } from 'react';
import { Vibration, Platform } from 'react-native';

export const useHaptics = () => {
    const [isEnabled, setIsEnabled] = useState(false);

    useEffect(() => {
        checkHapticsSupport();
    }, []);

    const checkHapticsSupport = () => {
        if (Platform.OS === 'web') {
            setIsEnabled(false);
            return;
        }

        if (Platform.OS === 'ios') {
            // iOS always supports haptics (no permission needed)
            setIsEnabled(true);
            return;
        }

        if (Platform.OS === 'android') {
            // Android VIBRATE is a "normal" permission - auto-granted via manifest
            // No runtime request needed, just enable it
            setIsEnabled(true);
            return;
        }
    };

    const triggerHaptic = useCallback((pattern: number | number[] = 10) => {
        if (!isEnabled) {
            return;
        }

        try {
            Vibration.vibrate(pattern);
        } catch (error) {
            console.warn('Haptic feedback failed:', error);
            // Silent fallback
        }
    }, [isEnabled]);

    const triggerLight = useCallback(() => triggerHaptic(10), [triggerHaptic]);
    const triggerMedium = useCallback(() => triggerHaptic(20), [triggerHaptic]);
    const triggerHeavy = useCallback(() => triggerHaptic(40), [triggerHaptic]);
    const triggerSuccess = useCallback(() => triggerHaptic([10, 50, 10]), [triggerHaptic]);
    const triggerError = useCallback(() => triggerHaptic([10, 100, 10, 100, 10]), [triggerHaptic]);

    return {
        isEnabled,
        triggerHaptic,
        triggerLight,
        triggerMedium,
        triggerHeavy,
        triggerSuccess,
        triggerError,
    };
};
