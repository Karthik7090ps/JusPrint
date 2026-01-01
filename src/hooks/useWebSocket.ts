import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { websocketService } from '../services/websocketService';
import {
    updateJobStatus,
    updateJobProgress,
    setLockerCode,
    clearJob
} from '../store/slices/printSlice';

/**
 * Hook to manage WebSocket event listeners and update Redux state
 */
export const useWebSocket = () => {
    const dispatch = useAppDispatch();
    const activeJob = useAppSelector(state => state.print.activeJob);
    const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

    useEffect(() => {
        if (!isAuthenticated) return;

        console.log('[useWebSocket] Initializing stable listeners...');

        const handleJobQueued = (data: any) => {
            const jobId = data.job_id || data.id;
            console.log('[useWebSocket] Event: Queued', jobId);
            dispatch(updateJobStatus({ jobId, status: 'queued' }));
        };

        const handleJobPrinting = (data: any) => {
            const jobId = data.job_id || data.id;
            console.log('[useWebSocket] Event: Printing', jobId);
            dispatch(updateJobStatus({ jobId, status: 'printing' }));
        };

        const handleJobProgress = (data: any) => {
            const jobId = data.job_id || data.id;
            console.log(`[useWebSocket] Progress update for ${jobId}: ${data.progress}%`);
            // Progress 0-100 -> 0-1
            dispatch(updateJobProgress({ jobId, progress: data.progress / 100 }));
        };

        const handleJobReady = (data: any) => {
            const jobId = data.job_id || data.id;
            console.log('[useWebSocket] Event: Ready', jobId);
            dispatch(updateJobStatus({ jobId, status: 'ready' }));
            if (data.locker_code) {
                dispatch(setLockerCode({ jobId, code: data.locker_code }));
            }
        };

        const handleJobCompleted = (data: any) => {
            const jobId = data.job_id || data.id;
            console.log('[useWebSocket] Event: Completed', jobId);
            dispatch(updateJobStatus({ jobId, status: 'completed' }));
        };

        const handleJobFailed = (data: any) => {
            console.error('[useWebSocket] Event: Failed', data);
        };

        // Register once
        websocketService.on('job_queued', handleJobQueued);
        websocketService.on('job_printing', handleJobPrinting);
        websocketService.on('job_progress', handleJobProgress);
        websocketService.on('job_ready', handleJobReady);
        websocketService.on('job_completed', handleJobCompleted);
        websocketService.on('job_failed', handleJobFailed);

        return () => {
            websocketService.off('job_queued', handleJobQueued);
            websocketService.off('job_printing', handleJobPrinting);
            websocketService.off('job_progress', handleJobProgress);
            websocketService.off('job_ready', handleJobReady);
            websocketService.off('job_completed', handleJobCompleted);
            websocketService.off('job_failed', handleJobFailed);
        };
    }, [dispatch, isAuthenticated]); // Only re-run on auth change

    return { isConnected: websocketService.isConnected() };
};
