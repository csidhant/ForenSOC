import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';

class SocketService {
  private socket: Socket | null = null;

  /**
   * Resolve the WebSocket server URL from environment variables.
   * Priority:
   *   1. VITE_SOCKET_URL          — explicit override (e.g. https://forensoc-backend.onrender.com)
   *   2. VITE_API_BASE_URL        — strip /api suffix  (e.g. /api → '' for Vite proxy)
   *   3. '' (empty string)        — connect to same origin, Vite dev proxy handles /socket.io
   */
  private get url(): string {
    if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
    const apiBase: string = import.meta.env.VITE_API_BASE_URL || '';
    // If apiBase is a full URL (starts with http), strip /api to get the server root
    if (apiBase.startsWith('http')) return apiBase.replace(/\/api\/?$/, '');
    // Otherwise (relative /api), connect to same origin — Vite proxy or nginx handles it
    return '';
  }

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(this.url, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.info('[ForenSOC] WebSocket connected');
    });

    this.socket.on('new_alert', (data: any) => {
      console.info('[ForenSOC] Real-time alert:', data);

      // Show toast notification
      toast.error(`🚨 ${data.title || 'New Security Alert'}`, {
        position: 'top-right',
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Dispatch custom event so any component can react
      window.dispatchEvent(new CustomEvent('forensoc-alert', { detail: data }));
    });

    this.socket.on('connect_error', (err) => {
      console.warn('[ForenSOC] WebSocket connection failed:', err.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.info('[ForenSOC] WebSocket disconnected:', reason);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (data: any) => void) {
    this.socket?.off(event, callback);
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
