import API_CONFIG, { apiRequest } from '../config/api';
import ReactNativeBlobUtil from 'react-native-blob-util';

export interface PrinterPricing {
    price_bw_single: number;
    price_bw_duplex: number;
    price_color_single: number;
    price_color_duplex: number;
}

export interface PrinterCapabilities {
    supports_color: boolean;
    supports_duplex: boolean;
    supports_stapling: boolean;
    supports_binding: boolean;
    supported_paper_sizes: string[];
}

export interface PrinterStatus {
    status: string;
    is_available: boolean;
    queue_count: number;
    estimated_wait_minutes: number;
    paper_level: number;
    ink_level_bw: number;
    ink_level_color: number;
}

export interface Printer {
    id: string;
    campus_id: string;
    name: string;
    model: string;
    location: string;
    capabilities: PrinterCapabilities;
    pricing: PrinterPricing;
    status: PrinterStatus;
    has_locker: boolean;
    locker_location?: string;
    speed_bw: number;
    speed_color: number;
    last_online: string;
}

export const printerService = {
    /**
     * Get all printers for a specific campus
     */
    getPrintersByCampus: async (campusCode: string): Promise<{ success: boolean; printers: Printer[]; total_count: number }> => {
        try {
            const response = await apiRequest<{ success: boolean; printers: Printer[]; total_count: number }>(
                API_CONFIG.ENDPOINTS.PRINTERS.CAMPUS_PRINTERS(campusCode),
                'GET'
            );
            return response;
        } catch (error: any) {
            console.error('[PRINTER_SERVICE] Failed to fetch printers:', error);
            return { success: false, printers: [], total_count: 0 };
        }
    },

    /**
     * Get detailed info for a single printer
     */
    getPrinterDetails: async (printerId: string): Promise<{ success: boolean; printer: Printer | null }> => {
        try {
            const response = await apiRequest<{ success: boolean; printer: Printer }>(
                API_CONFIG.ENDPOINTS.PRINTERS.PRINTER_DETAILS(printerId),
                'GET'
            );
            return response;
        } catch (error: any) {
            console.error('[PRINTER_SERVICE] Failed to fetch printer details:', error);
            return { success: false, printer: null };
        }
    },

    /**
     * Upload document for printing
     */
    uploadDocument: async (
        printerId: string,
        fileUri: string,
        fileName: string,
        fileType: string,
        settings: any,
        token?: string
    ): Promise<{ success: boolean; job_id?: string; error?: string }> => {
        try {
            const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRINT.UPLOAD}`;
            console.log(`[PRINTER_SERVICE] Attempting Native Upload to: ${url}`);

            const cleanPath = fileUri.replace('file://', '');

            // Verify file exists
            const exists = await ReactNativeBlobUtil.fs.exists(cleanPath);
            if (!exists) {
                return { success: false, error: 'File not found locally' };
            }

            // Pass token in 3 ways because the backend /upload endpoint 
            // is missing the Header() decorator for it.
            const authToken = token ? `Bearer ${token}` : '';
            const uploadUrl = `${url}${token ? `?authorization=${encodeURIComponent(authToken)}` : ''}`;

            const response = await ReactNativeBlobUtil.fetch(
                'POST',
                uploadUrl,
                {
                    'Authorization': authToken,
                    'authorization': authToken, // Redundancy for backends that might be case-sensitive
                    'Content-Type': 'multipart/form-data',
                },
                [
                    { name: 'printer_id', data: printerId },
                    { name: 'copies', data: String(settings.copies || 1) },
                    { name: 'color_mode', data: settings.colorMode || 'bw' },
                    { name: 'sides', data: settings.sides || 'single' },
                    { name: 'orientation', data: settings.orientation || 'portrait' },
                    { name: 'page_size', data: settings.pageSize || 'A4' },
                    // Backend schema uses 'page_range' (string) 
                    { name: 'page_range', data: settings.pageRange || `1-${settings.totalPages || 1}` },
                    {
                        name: 'file',
                        filename: fileName || 'document.pdf',
                        type: fileType || 'application/pdf',
                        data: ReactNativeBlobUtil.wrap(cleanPath),
                    },
                ]
            );

            const status = response.respInfo.status;
            const rawData = await response.text();
            console.log('[PRINTER_SERVICE] Raw Response:', rawData);

            let data;
            try {
                data = JSON.parse(rawData);
            } catch (e) {
                console.error('[PRINTER_SERVICE] Server returned non-JSON response. Check backend logs.');
                throw new Error(`Server Error (${status}): ${rawData.substring(0, 100)}...`);
            }

            console.log('[PRINTER_SERVICE] Native Upload Response:', status, data);

            if (status >= 400) {
                throw new Error(data.detail || data.error || `Server error ${status}`);
            }

            return { success: true, job_id: data.id || data.job_id };
        } catch (error: any) {
            console.error('[PRINTER_SERVICE] Native Upload Error:', error);
            return { success: false, error: error.message || 'Upload failed' };
        }
    },

    /**
     * Submit job after successful payment
     */
    submitPrintJob: async (jobId: string, paymentId: string, token?: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const authToken = token ? `Bearer ${token}` : '';
            const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRINT.SUBMIT(jobId)}?payment_id=${paymentId}${token ? `&authorization=${encodeURIComponent(authToken)}` : ''}`;

            console.log('[PRINTER_SERVICE] Attempting Job Submission to:', url);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': authToken,
                    'Content-Type': 'application/json'
                }
            });

            const status = response.status;
            const rawData = await response.text();
            console.log('[PRINTER_SERVICE] Submit Raw Response:', rawData);

            let data;
            try {
                data = JSON.parse(rawData);
            } catch (e) {
                console.error('[PRINTER_SERVICE] Server returned non-JSON during submit. Status:', status);
                throw new Error(`Server Error (${status}) during submission: ${rawData.substring(0, 100)}...`);
            }

            if (status >= 400) {
                throw new Error(data.detail || data.error || data.message || `Submission failed (${status})`);
            }

            return { success: true, ...data };
        } catch (error: any) {
            console.error('[PRINTER_SERVICE] Job submission failed:', error);
            return { success: false, error: error.message || 'Failed to submit print job' };
        }
    },

    /**
     * Get print job history
     */
    getPrintHistory: async (limit: number = 10, skip: number = 0, token?: string): Promise<{ success: boolean; jobs: any[]; total_count: number }> => {
        try {
            const response = await apiRequest<{ success: boolean; jobs: any[]; total_count: number }>(
                `${API_CONFIG.ENDPOINTS.PRINT.HISTORY}?limit=${limit}&skip=${skip}`,
                'GET',
                undefined,
                token
            );
            return response;
        } catch (error: any) {
            console.error('[PRINTER_SERVICE] Failed to fetch print history:', error);
            return { success: false, jobs: [], total_count: 0 };
        }
    },

    /**
     * Get print stats (pages today, this week, etc.)
     */
    getPrintStats: async (token?: string): Promise<{ success: boolean; stats: any }> => {
        try {
            const response = await apiRequest<{ success: boolean; stats: any }>(
                API_CONFIG.ENDPOINTS.PRINT.STATS,
                'GET',
                undefined,
                token
            );
            return response;
        } catch (error: any) {
            console.error('[PRINTER_SERVICE] Failed to fetch print stats:', error);
            return { success: false, stats: null };
        }
    }
};
