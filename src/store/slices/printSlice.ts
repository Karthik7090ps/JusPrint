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
        updateJobStatus: (state, action: PayloadAction<{ jobId: string; status: 'paid' | 'queued' | 'printing' | 'ready' | 'completed' }>) => {
            if (state.activeJob && (state.activeJob.id == action.payload.jobId)) {
                state.activeJob.status = action.payload.status;
            }
        },
        updateJobProgress: (state, action: PayloadAction<{ jobId: string; progress: number }>) => {
            if (state.activeJob && (state.activeJob.id == action.payload.jobId)) {
                state.activeJob.progress = action.payload.progress;
                // If we receive progress, we are definitely printing
                if (state.activeJob.status !== 'ready' && state.activeJob.status !== 'completed') {
                    state.activeJob.status = 'printing';
                }
            }
        },
        setLockerCode: (state, action: PayloadAction<{ jobId: string; code: string }>) => {
            if (state.activeJob && (state.activeJob.id == action.payload.jobId)) {
                state.activeJob.lockerCode = action.payload.code;
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
