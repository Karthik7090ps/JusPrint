import API_CONFIG from '../config/api';

export interface PaymentInitiateRequest {
    amount: number;
    payment_method: string;
    payment_provider: string;
    upi_id: string;
    print_job_id: string;
    description: string;
}

export interface PaymentResponse {
    success: boolean;
    transaction_id: string;
    status: string;
    amount: number;
    payment_method?: string;
    payment_provider?: string;
    gateway_payment_id?: string;
    payment_link?: string;
    qr_code?: string;
    initiated_at?: string;
    completed_at?: string;
    message: string;
    error?: string;
}

class PaymentService {
    private async getAuthHeader() {
        // This should probably come from a more central place or a store
        // For now, let's assume it's handled by some interceptor or we'll pass it if needed
        // Assuming there is some way to get the token
        return {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${token}` // This will be added by the caller or an interceptor
        };
    }

    async initiatePayment(data: PaymentInitiateRequest, token?: string): Promise<PaymentResponse> {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENT.INITIATE}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(data),
            });
            return await response.json();
        } catch (error) {
            console.error('Payment initiation failed:', error);
            return {
                success: false,
                transaction_id: '',
                status: 'failed',
                amount: data.amount,
                message: 'Failed to connect to payment gateway'
            };
        }
    }

    async processPayment(transactionId: string, token?: string): Promise<PaymentResponse> {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENT.PROCESS}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ transaction_id: transactionId }),
            });
            return await response.json();
        } catch (error) {
            console.error('Payment processing failed:', error);
            return {
                success: false,
                transaction_id: transactionId,
                status: 'failed',
                amount: 0,
                message: 'Failed to process payment status'
            };
        }
    }

    async verifyPayment(transactionId: string, token?: string): Promise<PaymentResponse> {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENT.VERIFY(transactionId)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                },
            });
            return await response.json();
        } catch (error) {
            console.error('Payment verification failed:', error);
            return {
                success: false,
                transaction_id: transactionId,
                status: 'error',
                amount: 0,
                message: 'Failed to verify payment'
            };
        }
    }

    async getPaymentHistory(limit: number = 10, token?: string): Promise<{ success: boolean; payments: any[]; total_count: number }> {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENT.HISTORY}?limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': token } : {}), // Header value per user request: authorization * string (header)
                },
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch payment history:', error);
            return {
                success: false,
                payments: [],
                total_count: 0
            };
        }
    }
}

export const paymentService = new PaymentService();
