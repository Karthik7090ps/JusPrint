import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PrintJob {
    id: string;
    documentName: string;
    totalAmount: number;
    status: 'paid' | 'queued' | 'printing' | 'ready' | 'completed';
    progress: number; // 0 to 1
    lockerCode?: string;
    estimatedTime?: string;
}

interface PrintState {
    activeJob: PrintJob | null;
    isMinimized: boolean;
}

const initialState: PrintState = {
    activeJob: null,
    isMinimized: false,
};

const printSlice = createSlice({
    name: 'print',
    initialState,
    reducers: {
        startPrintJob: (state, action: PayloadAction<{ id: string; documentName: string; totalAmount: number }>) => {
            state.activeJob = {
                id: action.payload.id,
                documentName: action.payload.documentName,
                totalAmount: action.payload.totalAmount,
                status: 'paid',
                progress: 0,
                estimatedTime: '~3 min',
            };
            state.isMinimized = false; // Start full screen usually
        },
        updateJobStatus: (state, action: PayloadAction<'paid' | 'queued' | 'printing' | 'ready' | 'completed'>) => {
            if (state.activeJob) {
                state.activeJob.status = action.payload;
            }
        },
        updateJobProgress: (state, action: PayloadAction<number>) => {
            if (state.activeJob) {
                state.activeJob.progress = action.payload;
            }
        },
        setLockerCode: (state, action: PayloadAction<string>) => {
            if (state.activeJob) {
                state.activeJob.lockerCode = action.payload;
            }
        },
        minimizeJob: (state) => {
            state.isMinimized = true;
        },
        maximizeJob: (state) => {
            state.isMinimized = false;
        },
        clearJob: (state) => {
            state.activeJob = null;
            state.isMinimized = false;
        },
    },
});

export const {
    startPrintJob,
    updateJobStatus,
    updateJobProgress,
    setLockerCode,
    minimizeJob,
    maximizeJob,
    clearJob
} = printSlice.actions;

export default printSlice.reducer;
