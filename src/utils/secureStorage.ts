/**
 * Secure Storage Utility
 * Wrapper for react-native-keychain to store sensitive data
 * 
 * NOTE: Requires `npm install react-native-keychain`
 * For this mock implementation, we use a simple fallback.
 * In production, replace with actual Keychain calls.
 */

// Mock implementation - Replace with actual react-native-keychain in production
// import * as Keychain from 'react-native-keychain';

// Temporary in-memory store for development (NOT SECURE - replace in production)
let memoryStore: Record<string, string> = {};

export interface SecureStorageResult {
    success: boolean;
    error?: string;
}

/**
 * Stores a value securely using the device Keychain/Keystore
 * @param key - Identifier for the stored value
 * @param value - The sensitive data to store
 */
export const setSecureItem = async (key: string, value: string): Promise<SecureStorageResult> => {
    try {
        // Production: Use react-native-keychain
        // await Keychain.setGenericPassword(key, value, { service: key });

        // Development fallback (NOT SECURE):
        memoryStore[key] = value;
        console.log(`[SECURE_STORAGE] Stored item: ${key}`);

        return { success: true };
    } catch (error) {
        console.error(`[SECURE_STORAGE] Failed to store ${key}:`, error);
        return { success: false, error: String(error) };
    }
};

/**
 * Retrieves a securely stored value
 * @param key - Identifier for the stored value
 * @returns The stored value or null if not found
 */
export const getSecureItem = async (key: string): Promise<string | null> => {
    try {
        // Production: Use react-native-keychain
        // const credentials = await Keychain.getGenericPassword({ service: key });
        // return credentials ? credentials.password : null;

        // Development fallback:
        const value = memoryStore[key];
        return value || null;
    } catch (error) {
        console.error(`[SECURE_STORAGE] Failed to retrieve ${key}:`, error);
        return null;
    }
};

/**
 * Deletes a securely stored value
 * @param key - Identifier for the stored value
 */
export const deleteSecureItem = async (key: string): Promise<SecureStorageResult> => {
    try {
        // Production: Use react-native-keychain
        // await Keychain.resetGenericPassword({ service: key });

        // Development fallback:
        delete memoryStore[key];
        console.log(`[SECURE_STORAGE] Deleted item: ${key}`);

        return { success: true };
    } catch (error) {
        console.error(`[SECURE_STORAGE] Failed to delete ${key}:`, error);
        return { success: false, error: String(error) };
    }
};

/**
 * Clears all securely stored values (use with caution)
 */
export const clearAllSecureItems = async (): Promise<SecureStorageResult> => {
    try {
        // Production: Iterate and clear all known keys
        memoryStore = {};
        console.log('[SECURE_STORAGE] Cleared all items');

        return { success: true };
    } catch (error) {
        console.error('[SECURE_STORAGE] Failed to clear:', error);
        return { success: false, error: String(error) };
    }
};

// Storage keys constants for type safety
export const STORAGE_KEYS = {
    REFRESH_TOKEN: 'jusprint_refresh_token',
    ACCESS_TOKEN: 'jusprint_access_token',
    USER_ID: 'jusprint_user_id',
    SESSION_NONCE: 'jusprint_session_nonce',
} as const;
