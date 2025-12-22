import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { getSecureItem, setSecureItem, STORAGE_KEYS } from '../../utils/secureStorage';

interface Printer {
    id: string;
    name: string;
    status: {
        online: boolean;
        queue_count: number;
        status_message: string;
    };
    location: string;
    pricing: {
        bw: number;
        color: number;
    };
}

interface PrinterState {
    campusPrinters: Printer[];
    isLoading: boolean;
    error: string | null;
}

const initialState: PrinterState = {
    campusPrinters: [],
    isLoading: false,
    error: null,
};

// Async Thunk to load printers from cache
export const loadCachedPrinters = createAsyncThunk(
    'printer/loadCached',
    async () => {
        const cached = await getSecureItem('jusprint_printers_cache');
        if (cached) {
            return JSON.parse(cached) as Printer[];
        }
        return [];
    }
);

const printerSlice = createSlice({
    name: 'printer',
    initialState,
    reducers: {
        setPrinters: (state, action: PayloadAction<Printer[]>) => {
            state.campusPrinters = action.payload;
            // Cache them whenever set
            setSecureItem('jusprint_printers_cache', JSON.stringify(action.payload));
        },
        clearPrinters: (state) => {
            state.campusPrinters = [];
        }
    },
    extraReducers: (builder) => {
        builder.addCase(loadCachedPrinters.fulfilled, (state, action) => {
            if (action.payload.length > 0) {
                state.campusPrinters = action.payload;
            }
        });
    }
});

export const { setPrinters, clearPrinters } = printerSlice.actions;
export default printerSlice.reducer;
