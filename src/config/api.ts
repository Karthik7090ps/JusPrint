import NetInfo from '@react-native-community/netinfo';

// API Configuration with Network Error Handling
export const API_CONFIG = {
    BASE_URL: __DEV__
        // ? 'http://[2401:4900:8f4c:69b:6990:3f83:a7f1:f37c]:8000'
        // : 'http://[2401:4900:8f4c:69b:6990:3f83:a7f1:f37c]:8000',
        ? 'http://192.168.1.8:8000'
        : 'http://192.168.1.8:8000',

    ENDPOINTS: {
        AUTH: {
            SEND_OTP: '/api/auth/send-otp',
            VERIFY_OTP: '/api/auth/verify-otp',
            REFRESH_TOKEN: '/api/auth/refresh',
            VERIFY_TOKEN: '/api/auth/verify-token',
        },
        PRINTERS: {
            CAMPUSES: '/api/printers/campuses',
            CAMPUS_PRINTERS: (code: string) => `/api/printers/campus/${code}/printers`,
            PRINTER_DETAILS: (id: string) => `/api/printers/${id}`,
        },
        PAYMENT: {
            INITIATE: '/api/payment/initiate',
            PROCESS: '/api/payment/process',
            VERIFY: (id: string) => `/api/payment/verify/${id}`,
            HISTORY: '/api/payment/history',
        },
        PRINT: {
            UPLOAD: '/api/print/upload',
            SUBMIT: (jobId: string) => `/api/print/submit/${jobId}`,
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
    const errorMsg = String(error.message || '');
    if (error.name === 'AbortError' ||
        errorMsg.includes('timeout') ||
        errorMsg.includes('timed out') ||
        errorMsg.toLowerCase().includes('aborted')) {
        return {
            type: ApiErrorType.TIMEOUT_ERROR,
            message: 'Request timeout',
            userMessage: '⏱️ Request timed out. Please try again.',
            technical: errorMsg,
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

// Check network connectivity
export const checkNetworkConnection = async (): Promise<boolean> => {
    try {
        const netInfo = await NetInfo.fetch();
        return netInfo.isConnected === true;
    } catch (error) {
        console.warn('[Network Check] Failed to check connectivity:', error);
        return true; // Assume connected if check fails
    }
};

// HTTP Client Helper with Enhanced Error Handling
export const apiRequest = async <T>(
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

export default API_CONFIG;
