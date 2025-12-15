/**
 * Link Validator Utility
 * Central whitelist for deep links and external URLs
 */

// Allowed internal deep link schemes
const ALLOWED_SCHEMES = ['jusprint://'];

// Allowed external domains (for opening in browser)
const ALLOWED_EXTERNAL_DOMAINS = [
    'jusprint.com',
    'razorpay.com',
    'phonepe.com',
    'paytm.com',
    // Add trusted payment gateways
];

// Blocked patterns (security risk)
const BLOCKED_PATTERNS = [
    'javascript:',
    'data:',
    'file://',
    'about:',
];

export interface LinkValidationResult {
    isValid: boolean;
    type: 'internal' | 'external' | 'blocked';
    reason?: string;
    sanitizedUrl?: string;
}

/**
 * Validates a URL before opening
 * @param url - The URL to validate
 * @returns Validation result with type and sanitized URL
 */
export const validateLink = (url: string): LinkValidationResult => {
    if (!url || typeof url !== 'string') {
        return { isValid: false, type: 'blocked', reason: 'Empty or invalid URL' };
    }

    const trimmedUrl = url.trim().toLowerCase();

    // Check for blocked patterns first (highest priority)
    for (const pattern of BLOCKED_PATTERNS) {
        if (trimmedUrl.startsWith(pattern)) {
            console.warn(`[SECURITY] Blocked URL pattern: ${pattern}`);
            return { isValid: false, type: 'blocked', reason: `Blocked pattern: ${pattern}` };
        }
    }

    // Check if it's an internal deep link
    for (const scheme of ALLOWED_SCHEMES) {
        if (trimmedUrl.startsWith(scheme)) {
            return { isValid: true, type: 'internal', sanitizedUrl: url };
        }
    }

    // Check if it's a valid external URL
    if (trimmedUrl.startsWith('https://') || trimmedUrl.startsWith('http://')) {
        try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname.replace('www.', '');

            const isAllowed = ALLOWED_EXTERNAL_DOMAINS.some(
                allowed => domain === allowed || domain.endsWith('.' + allowed)
            );

            if (isAllowed) {
                return { isValid: true, type: 'external', sanitizedUrl: url };
            } else {
                console.warn(`[SECURITY] External domain not whitelisted: ${domain}`);
                return { isValid: false, type: 'blocked', reason: `Domain not whitelisted: ${domain}` };
            }
        } catch (e) {
            return { isValid: false, type: 'blocked', reason: 'Invalid URL format' };
        }
    }

    // Default: block unknown patterns
    return { isValid: false, type: 'blocked', reason: 'Unknown URL scheme' };
};

/**
 * Parses internal deep link to navigation params
 * Example: jusprint://print/upload -> { screen: 'print', action: 'upload' }
 */
export const parseDeepLink = (url: string): { screen: string; action?: string; params?: Record<string, string> } | null => {
    const validation = validateLink(url);
    if (!validation.isValid || validation.type !== 'internal') {
        return null;
    }

    try {
        // Remove scheme: jusprint://
        const path = url.replace('jusprint://', '');
        const [screen, action, ...rest] = path.split('/');

        return {
            screen: screen || 'home',
            action: action || undefined,
            params: {}
        };
    } catch (e) {
        console.error('[SECURITY] Failed to parse deep link:', e);
        return null;
    }
};
