import { setSecureItem, STORAGE_KEYS } from '../utils/secureStorage';
import API_CONFIG, { apiRequest, ApiErrorType } from '../config/api';

export interface AuthResponse {
    success: boolean;
    token?: string;
    refreshToken?: string;
    userId?: string;
    name?: string;
    error?: string;
    errorType?: ApiErrorType;
}

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
    verifyToken: async (token: string): Promise<{ success: boolean; userId?: string; email?: string; name?: string; errorType?: ApiErrorType }> => {
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
            return { success: false, errorType: error.type };
        }
    },

    /**
     * Get list of all campuses
     */
    getCampuses: async (): Promise<{ success: boolean; campuses: any[] }> => {
        try {
            const response = await apiRequest<{ success: boolean; campuses: any[] }>(
                API_CONFIG.ENDPOINTS.PRINTERS.CAMPUSES,
                'GET'
            );
            return response;
        } catch (error: any) {
            console.error('[AUTH_SERVICE] Failed to fetch campuses:', error);
            return { success: false, campuses: [] };
        }
    },
};
