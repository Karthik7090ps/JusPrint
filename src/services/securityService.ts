/**
 * Security Service
 * Handles secure operations: link validation, nonce generation, origin checks
 */

import { Linking, Alert } from 'react-native';
import { validateLink, parseDeepLink } from '../utils/linkValidator';

/**
 * Safely opens a URL after validation
 * Blocks malicious URLs and logs security events
 */
export const safeOpenUrl = async (url: string): Promise<boolean> => {
    const validation = validateLink(url);

    if (!validation.isValid) {
        console.error(`[SECURITY] Blocked URL: ${url} - ${validation.reason}`);
        // Optionally show user feedback
        // Alert.alert('Link Blocked', 'This link cannot be opened for security reasons.');
        return false;
    }

    try {
        const canOpen = await Linking.canOpenURL(validation.sanitizedUrl!);
        if (canOpen) {
            await Linking.openURL(validation.sanitizedUrl!);
            return true;
        } else {
            console.warn(`[SECURITY] Cannot open URL: ${url}`);
            return false;
        }
    } catch (error) {
        console.error(`[SECURITY] Error opening URL: ${url}`, error);
        return false;
    }
};

/**
 * Handles internal deep link navigation
 * Returns navigation params or null if invalid
 */
export const handleDeepLink = (url: string, navigation: any): boolean => {
    const parsed = parseDeepLink(url);

    if (!parsed) {
        console.warn(`[SECURITY] Invalid deep link: ${url}`);
        return false;
    }

    // Map deep link routes to navigation screens
    const routeMap: Record<string, string> = {
        'print': 'DocumentUpload',
        'projects': 'Projects',
        'services': 'Services',
        'market': 'Market',
        'community': 'Community',
        'home': 'MainTabs',
    };

    const screenName = routeMap[parsed.screen];
    if (screenName && navigation) {
        navigation.navigate(screenName, parsed.params);
        return true;
    }

    console.warn(`[SECURITY] Unknown deep link route: ${parsed.screen}`);
    return false;
};

/**
 * Generates a cryptographic nonce for request signing
 * Used for CSRF-like protection on sensitive API calls
 */
export const generateNonce = (): string => {
    const array = new Uint8Array(16);
    // In React Native, use a polyfill or native module for crypto
    // For now, using a timestamp-based fallback
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random}`;
};

/**
 * Validates that a response comes from a trusted origin
 * Used for webhook/callback verification
 */
export const isSecureOrigin = (url: string): boolean => {
    const trustedOrigins = [
        'https://api.jusprint.com',
        'https://payments.razorpay.com',
    ];

    try {
        const urlObj = new URL(url);
        return trustedOrigins.some(origin => url.startsWith(origin));
    } catch {
        return false;
    }
};

/**
 * Logs security events (for monitoring/alerting)
 * In production, send these to your logging service
 */
export const logSecurityEvent = (event: string, details: Record<string, any>) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        event,
        ...details,
    };

    // In production: send to backend logging service
    console.log('[SECURITY_LOG]', JSON.stringify(logEntry));
};
