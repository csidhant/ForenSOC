import { io, Socket } from 'socket.io-client';
import { toast } from 'react-toastify';

class SocketService {
  private socket: Socket | null = null;
  // In production: VITE_API_URL = https://forensoc-backend.onrender.com
  // In local dev: falls back to same origin (proxied by Vite)
  private url: string = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
