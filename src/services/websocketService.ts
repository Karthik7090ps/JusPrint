import io, { Socket } from 'socket.io-client';
import { getSecureItem, STORAGE_KEYS } from '../utils/secureStorage';
import API_CONFIG from '../config/api';

class WebSocketService {
    private socket: Socket | null = null;
    private userId: string | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    // Event listeners
    private listeners: Map<string, Set<Function>> = new Map();

    /**
     * Connect to WebSocket server
     */
    async connect(userId: string) {
        if (this.socket?.connected) {
            console.log('[WS] Already connected');
            return;
        }

        this.userId = userId;

        try {
            console.log('[WS] Connecting to server...');

            this.socket = io(API_CONFIG.BASE_URL, {
                transports: ['websocket', 'polling'],
                reconnection: true,
                reconnectionAttempts: this.maxReconnectAttempts,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 10000
            });

            this.setupEventHandlers();

            // Register as client
            const token = await getSecureItem(STORAGE_KEYS.ACCESS_TOKEN);
            this.socket.emit('register_client', {
                user_id: userId,
                auth_token: token
            });

        } catch (error) {
            console.error('[WS] Connection error:', error);
        }
    }

    /**
     * Disconnect from server
     */
    disconnect() {
        if (this.socket) {
            console.log('[WS] Disconnecting...');
            this.socket.disconnect();
            this.socket = null;
            this.listeners.clear();
        }
    }

    /**
     * Setup event handlers
     */
    private setupEventHandlers() {
        if (!this.socket) return;

        // Connection events
        this.socket.on('connect', () => {
            console.log('✅ [WS] Connected');
            this.reconnectAttempts = 0;
            this.emit('connected', {});
        });

        this.socket.on('disconnect', (reason: string) => {
            console.log(`⚠️ [WS] Disconnected: ${reason}`);
            this.emit('disconnected', { reason });
        });

        this.socket.on('connect_error', (error: Error) => {
            console.error('[WS] Connection error:', error);
            this.reconnectAttempts++;

            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                this.emit('connection_failed', { error: 'Max reconnection attempts reached' });
            }
        });

        // Registration
        this.socket.on('registered', (data: any) => {
            console.log('[WS] Registered:', data);
            this.emit('registered', data);
        });

        // Print job events
        this.socket.on('job_queued', (data: any) => {
            console.log('[WS] Job queued:', data);
            this.emit('job_queued', data);
        });

        this.socket.on('job_printing', (data: any) => {
            console.log('[WS] Job printing:', data);
            this.emit('job_printing', data);
        });

        this.socket.on('job_progress', (data: any) => {
            console.log(`[WS] Job progress: ${data.progress}%`);
            this.emit('job_progress', data);
        });

        this.socket.on('job_completed', (data: any) => {
            console.log('[WS] Job completed:', data);
            this.emit('job_completed', data);
        });

        this.socket.on('job_ready', (data: any) => {
            console.log('[WS] Job ready for pickup:', data);
            this.emit('job_ready', data);
        });

        this.socket.on('job_failed', (data: any) => {
            console.error('[WS] Job failed:', data);
            this.emit('job_failed', data);
        });

        // Errors
        this.socket.on('error', (data: any) => {
            console.error('[WS] Server error:', data);
            this.emit('error', data);
        });
    }

    /**
     * Subscribe to events
     */
    on(event: string, callback: Function) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(callback);
    }

    /**
     * Unsubscribe from events
     */
    off(event: string, callback: Function) {
        if (this.listeners.has(event)) {
            this.listeners.get(event)!.delete(callback);
        }
    }

    /**
     * Emit event to listeners
     */
    private emit(event: string, data: any) {
        if (this.listeners.has(event)) {
            this.listeners.get(event)!.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[WS] Listener error for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Check connection status
     */
    isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

// Export singleton instance
export const websocketService = new WebSocketService();
