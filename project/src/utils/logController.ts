import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  source?: string;
  details?: any;
}

class LogController {
  private logs: LogEntry[] = [];
  private socket: any = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private isConnecting: boolean = false;

  constructor() {
    // Don't initialize socket in constructor
    // Let it be initialized on first log
    this.logs = [];
  }

  private async initializeSocket() {
    if (this.socket || this.isConnecting) return;
    
    this.isConnecting = true;

    try {
      // Get the current URL and replace the port
      const currentUrl = window.location.origin;
      const serverUrl = currentUrl.replace('5173', '3001');

      this.socket = io(serverUrl, {
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        transports: ['polling', 'websocket'] // Try polling first
      });

      this.setupSocketListeners();
    } catch (error) {
      console.error('Socket initialization error:', error);
      this.handleOfflineMode();
    } finally {
      this.isConnecting = false;
    }
  }

  private setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      if (this.reconnectAttempts > 0) {
        toast.success('Log sunucusuna yeniden bağlanıldı');
      }
      this.reconnectAttempts = 0;
      console.log('Log sunucusuna bağlanıldı');
    });

    this.socket.on('connect_error', (error: Error) => {
      this.reconnectAttempts++;
      console.warn('Log sunucusu bağlantı hatası:', error);
      
      if (this.reconnectAttempts === this.maxReconnectAttempts) {
        this.handleOfflineMode();
      }
    });

    this.socket.on('disconnect', (reason: string) => {
      console.warn('Log sunucusu bağlantısı kesildi:', reason);
      
      if (reason === 'io server disconnect') {
        this.socket?.connect();
      }
    });

    this.socket.on('error', (error: Error) => {
      console.error('Log sunucusu hatası:', error);
    });
  }

  private handleOfflineMode() {
    console.warn('Log sunucusuna bağlanılamadı, çevrimdışı modda çalışılıyor');
    this.socket = null;
    this.isConnecting = false;
  }

  addLog(level: LogEntry['level'], message: string, source?: string, details?: any) {
    const log: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      source,
      details
    };

    // Add to local logs array
    this.logs.unshift(log);
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(0, 1000);
    }

    // Try to initialize socket if not already done
    if (!this.socket && !this.isConnecting) {
      this.initializeSocket();
    }

    // Try to send via socket if connected
    if (this.socket?.connected) {
      this.socket.emit('clientLog', log);
    }

    // Always log to console in development
    if (process.env.NODE_ENV === 'development') {
      const style = this.getLogStyle(level);
      console.log(
        `%c[${log.timestamp}] [${level.toUpperCase()}] ${source ? `[${source}] ` : ''}${message}`,
        style
      );
      if (details) {
        console.log(details);
      }
    }

    // Show critical errors as toast notifications
    if (level === 'error') {
      toast.error(message);
    }
  }

  getLogs(): LogEntry[] {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
    this.socket?.emit('clearLogs');
  }

  private getLogStyle(level: string): string {
    switch (level) {
      case 'error':
        return 'color: #ef4444; font-weight: bold';
      case 'warn':
        return 'color: #f59e0b; font-weight: bold';
      case 'info':
        return 'color: #3b82f6; font-weight: bold';
      default:
        return 'color: inherit';
    }
  }
}

export const logController = new LogController();