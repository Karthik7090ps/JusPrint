export interface PrinterCapabilities {
    id: string;
    name: string;
    supports: {
        color: boolean;
        duplex: boolean;
        a3: boolean;
        staple: boolean;     // Not used in MVP but good to have
        copies: boolean;
    };
    rates: {
        bw: number;
        color: number;
        binding: number;
        a3Surcharge: number;
    };
}

export interface PrintSettings {
    pageRange: string; // "all" or "1-5"
    copies: number;
    color: boolean;
    duplex: boolean;
    paperSize: 'A4' | 'A3';
    nUp: 1 | 2 | 4;   // Pages per sheet
    orientation: 'auto' | 'portrait' | 'landscape';
    binding: boolean;
}

export const DEFAULT_CAPABILITIES: PrinterCapabilities = {
    id: 'printer_001',
    name: 'Smart Printer (Hall A)',
    supports: {
        color: true,
        duplex: true,
        a3: false,
        staple: false,
        copies: true
    },
    rates: {
        bw: 2, // Rs 2 per sheet
        color: 10,
        binding: 30,
        a3Surcharge: 5
    }
};
