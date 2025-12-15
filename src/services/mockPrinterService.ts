import { PrinterCapabilities, DEFAULT_CAPABILITIES } from '../types/printing';

// Simulator for backend capability check
export const getPrinterCapabilities = async (printerId: string): Promise<PrinterCapabilities> => {
    // In a real app, this would fetch from API
    // For now, we return the default mock, but we could switch based on ID
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(DEFAULT_CAPABILITIES);
        }, 500);
    });
};

// Pricing Calculator (Server logic simulated on client for UI transparency)
export const calculateEstimatedCost = (
    settings: any,
    capabilities: PrinterCapabilities,
    totalPages: number
): { totalCost: number, sheetsUsed: number } => {

    // 1. Calculate Pages to Print
    let pagesToPrint = totalPages;
    if (settings.pageRange !== 'all') {
        // simplified logic for MVP: parse range count
        // assumed to be valid for now
        pagesToPrint = estimatePageCountFromRange(settings.pageRange, totalPages);
    }

    // 2. Calculate Sheets Used
    // N-up reduction
    let logicalPages = Math.ceil(pagesToPrint / settings.nUp);

    // Duplex reduction
    let sheetsUsed = settings.duplex
        ? Math.ceil(logicalPages / 2)
        : logicalPages;

    // 3. Rate Calculation
    let perSheetRate = settings.color ? capabilities.rates.color : capabilities.rates.bw;

    if (settings.paperSize === 'A3') {
        perSheetRate += capabilities.rates.a3Surcharge;
    }

    let totalCost = (sheetsUsed * perSheetRate * settings.copies);

    if (settings.binding) {
        totalCost += capabilities.rates.binding;
    }

    return { totalCost, sheetsUsed };
};

const estimatePageCountFromRange = (range: string, max: number): number => {
    // Simple mock implementation
    // "1-5" -> 5, "1,3,5" -> 3
    if (!range) return max;
    // For MVP validation, let's just assume user enters valid ranges or we count commas/dashes
    // This is complex to do perfectly in frontend without a library, 
    // we will return a dummy value for the calculation preview if string is complex
    return max; // Fallback
};
