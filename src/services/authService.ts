import { setSecureItem, STORAGE_KEYS } from '../utils/secureStorage';
import API_CONFIG, { getApiError, ApiError, ApiErrorType } from '../config/api';
import NetInfo from '@react-native-community/netinfo';

export interface AuthResponse {
    success: boolean;
    token?: string;
    refreshToken?: string;
    userId?: string;
    name?: string;
    error?: string;
    errorType?: ApiErrorType;
}

// Check network connectivity
const checkNetworkConnection = async (): Promise<boolean> => {
    try {
        const netInfo = await NetInfo.fetch();
        return netInfo.isConnected === true;
    } catch (error) {
        console.warn('[Network Check] Failed to check connectivity:', error);
        return true; // Assume connected if check fails
    }
};

// HTTP Client Helper with Enhanced Error Handling
const apiRequest = async <T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    body?: any,
    token?: string
): Promise<T> => {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;

    // Pre-flight network check
    const isConnected = await checkNetworkConnection();
    if (!isConnected) {
        throw {
            type: ApiErrorType.NETWORK_ERROR,
            message: 'No internet connection',
            userMessage: '📡 No internet connection. Please check your network.',
        };
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        console.log(`[API] ${method} ${url}`);

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

        const response = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const data = await response.json();

        if (!response.ok) {
            throw {
                status: response.status,
                message: data.detail || data.error || 'Request failed',
            };
        }

        return data as T;
    } catch (error: any) {
        console.error(`[API Error] ${method} ${url}:`, error);

        // Convert to ApiError
        const apiError = getApiError(error);
        throw apiError;
    }
};

// Retry configuration
const RETRY_CONFIG = {
    maxRetries: 3,
    retryDelay: 1000, // 1 second
    retryableErrors: [ApiErrorType.NETWORK_ERROR, ApiErrorType.TIMEOUT_ERROR],
};

// Retry wrapper
const withRetry = async <T>(
    fn: () => Promise<T>,
    retries = RETRY_CONFIG.maxRetries
): Promise<T> => {
    try {
        return await fn();
    } catch (error: any) {
        if (retries > 0 && RETRY_CONFIG.retryableErrors.includes(error.type)) {
            console.log(`[Retry] Retrying... (${RETRY_CONFIG.maxRetries - retries + 1}/${RETRY_CONFIG.maxRetries})`);
            await new Promise(resolve => setTimeout(() => resolve(null), RETRY_CONFIG.retryDelay));
            return withRetry(fn, retries - 1);
        }
        throw error;
    }
};

export const authService = {
    /**
     * Send OTP to the provided email
     */
    sendOTP: async (email: string): Promise<AuthResponse> => {
        return withRetry(async () => {
            console.log('[AUTH_SERVICE] Sending OTP to:', email);

            try {
                const response = await apiRequest<{ success: boolean; message: string; error?: string }>(
                    API_CONFIG.ENDPOINTS.AUTH.SEND_OTP,
                    'POST',
                    { email: email.toLowerCase() }
                );

                return {
                    success: response.success,
                    error: response.error,
                };
            } catch (error: any) {
                return {
                    success: false,
                    error: error.userMessage || 'Failed to send OTP',
                    errorType: error.type,
                };
            }
        });
    },

    /**
     * Verify OTP and log the user in
     */
    verifyOTP: async (
        email: string,
        otp: string,
        name?: string
    ): Promise<AuthResponse> => {
        return withRetry(async () => {
            console.log('[AUTH_SERVICE] Verifying OTP:', otp, 'for:', email);

            try {
                const response = await apiRequest<AuthResponse>(
                    API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP,
                    'POST',
                    {
                        email: email.toLowerCase(),
                        otp: otp.trim(),
                        name: name?.trim() || email.split('@')[0],
                    }
                );

                return {
                    success: response.success,
                    userId: response.userId,
                    token: response.token,
                    refreshToken: response.refreshToken,
                    name: response.name,
                    error: response.error,
                };
            } catch (error: any) {
                return {
                    success: false,
                    error: error.userMessage || 'Invalid OTP',
                    errorType: error.type,
                };
            }
        });
    },

    /**
     * Refresh access token using refresh token
     */
    refreshAccessToken: async (refreshToken: string): Promise<AuthResponse> => {
        console.log('[AUTH_SERVICE] Refreshing access token');

        try {
            const response = await apiRequest<{ success: boolean; token?: string; error?: string }>(
                API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN,
                'POST',
                { refreshToken }
            );

            return {
                success: response.success,
                token: response.token,
                error: response.error,
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.userMessage || 'Failed to refresh token',
                errorType: error.type,
            };
        }
    },

    /**
     * Verify if current access token is valid
     * Note: This doesn't retry to avoid login delays
     */
    verifyToken: async (token: string): Promise<{ success: boolean; userId?: string; email?: string; name?: string }> => {
        try {
            const response = await apiRequest<{
                success: boolean;
                userId?: string;
                email?: string;
                name?: string;
            }>(
                API_CONFIG.ENDPOINTS.AUTH.VERIFY_TOKEN,
                'GET',
                undefined,
                token
            );

            return response;
        } catch (error: any) {
            console.log('[AUTH_SERVICE] Token verification failed:', error.message || 'Unknown error');
            return { success: false };
        }
    },
};
