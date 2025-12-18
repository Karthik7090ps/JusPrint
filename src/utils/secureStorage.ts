import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Secure Storage Utility
 * Wrapper for AsyncStorage to store persistent data.
 * For highly sensitive data in production, consider react-native-keychain.
 */

export interface SecureStorageResult {
    success: boolean;
    error?: string;
}

/**
 * Stores a value persistently
 * @param key - Identifier for the stored value
 * @param value - The data to store
 */
export const setSecureItem = async (key: string, value: string): Promise<SecureStorageResult> => {
    try {
        await AsyncStorage.setItem(key, value);
        console.log(`[SECURE_STORAGE] Stored item: ${key}`);
        return { success: true };
    } catch (error) {
        console.error(`[SECURE_STORAGE] Failed to store ${key}:`, error);
        return { success: false, error: String(error) };
    }
};

/**
 * Retrieves a persistently stored value
 * @param key - Identifier for the stored value
 * @returns The stored value or null if not found
 */
export const getSecureItem = async (key: string): Promise<string | null> => {
    try {
        const value = await AsyncStorage.getItem(key);
        return value;
    } catch (error) {
        console.error(`[SECURE_STORAGE] Failed to retrieve ${key}:`, error);
        return null;
    }
};

/**
 * Deletes a persistently stored value
 * @param key - Identifier for the stored value
 */
export const deleteSecureItem = async (key: string): Promise<SecureStorageResult> => {
    try {
        await AsyncStorage.removeItem(key);
        console.log(`[SECURE_STORAGE] Deleted item: ${key}`);
        return { success: true };
    } catch (error) {
        console.error(`[SECURE_STORAGE] Failed to delete ${key}:`, error);
        return { success: false, error: String(error) };
    }
};

/**
 * Clears all stored values (use with caution)
 */
export const clearAllSecureItems = async (): Promise<SecureStorageResult> => {
    try {
        await AsyncStorage.clear();
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
    USER_NAME: 'jusprint_user_name',
    SESSION_NONCE: 'jusprint_session_nonce',
} as const;
