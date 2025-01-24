import { EventEmitter } from 'events';
import { io } from '../index';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  source?: string;
  details?: any;
}

class LogController extends EventEmitter {
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  constructor() {
    super();
    this.setMaxListeners(20);
  }

  addLog(level: LogEntry['level'], message: string, source?: string, details?: any) {
    const log: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      source,
      details
    };

    // Add to memory store
    this.logs.unshift(log);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Emit to all connected clients
    io.emit('clientLog', log);

    // Emit event for other server components
    this.emit('newLog', log);

    // Console output in development
    if (process.env.NODE_ENV === 'development') {
      const prefix = `[${log.timestamp}] [${level.toUpperCase()}]${source ? ` [${source}]` : ''}`;
      switch (level) {
        case 'error':
          console.error(prefix, message, details || '');
          break;
        case 'warn':
          console.warn(prefix, message, details || '');
          break;
        default:
          console.log(prefix, message, details || '');
      }
    }
  }

  getLogs(): LogEntry[] {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
    io.emit('logsCleared');
    this.emit('logsCleared');
  }
}

export const logController = new LogController();