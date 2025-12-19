import API_CONFIG, { apiRequest } from '../config/api';

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
    }
};
