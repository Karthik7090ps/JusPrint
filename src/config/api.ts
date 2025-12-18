// API Configuration with Network Error Handling
const API_CONFIG = {
    BASE_URL: __DEV__
        ? 'http://192.168.1.8:8000'
        : 'https://your-backend-domain.com',

    ENDPOINTS: {
        AUTH: {
            SEND_OTP: '/api/auth/send-otp',
            VERIFY_OTP: '/api/auth/verify-otp',
            REFRESH_TOKEN: '/api/auth/refresh',
            VERIFY_TOKEN: '/api/auth/verify-token',
        }
    },

    TIMEOUT: 30000, // 30 seconds
};

// Error Types for Better Error Handling
export enum ApiErrorType {
    NETWORK_ERROR = 'NETWORK_ERROR',
    TIMEOUT_ERROR = 'TIMEOUT_ERROR',
    SERVER_ERROR = 'SERVER_ERROR',
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface ApiError {
    type: ApiErrorType;
    message: string;
    userMessage: string; // User-friendly message
    technical?: string; // Technical details for debugging
}

export const getApiError = (error: any): ApiError => {
    // Network/Connection errors
    if (error.message === 'Network request failed' ||
        error.message?.includes('Failed to fetch') ||
        error.name === 'TypeError') {
        return {
            type: ApiErrorType.NETWORK_ERROR,
            message: 'Cannot connect to server',
            userMessage: '⚠️ Server unavailable. Please check your connection or try again later.',
            technical: error.message,
        };
    }

    // Timeout errors
    if (error.name === 'AbortError' ||
        error.message?.includes('timeout') ||
        error.message?.includes('timed out')) {
        return {
            type: ApiErrorType.TIMEOUT_ERROR,
            message: 'Request timeout',
            userMessage: '⏱️ Request timed out. Please try again.',
            technical: error.message,
        };
    }

    // Server errors (5xx)
    if (error.status >= 500) {
        return {
            type: ApiErrorType.SERVER_ERROR,
            message: 'Server error',
            userMessage: '🔧 Server is experiencing issues. Please try again in a few minutes.',
            technical: `${error.status}: ${error.message}`,
        };
    }

    // Validation errors (4xx)
    if (error.status >= 400 && error.status < 500) {
        return {
            type: ApiErrorType.VALIDATION_ERROR,
            message: error.message || 'Validation error',
            userMessage: error.message || '❌ Invalid request. Please check your input.',
            technical: `${error.status}: ${error.message}`,
        };
    }

    // Unknown errors
    return {
        type: ApiErrorType.UNKNOWN_ERROR,
        message: error.message || 'Unknown error',
        userMessage: '❌ Something went wrong. Please try again.',
        technical: error.message,
    };
};

export default API_CONFIG;
