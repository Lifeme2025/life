import React from 'react';
import { Terminal, RefreshCw, Download, Filter, Search, Trash2, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';
import { logController } from '../utils/logController';

interface Log {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  source?: string;
  details?: any;
}

export default function SistemLoglari() {
  const [logs, setLogs] = React.useState<Log[]>([]);
  const [autoScroll, setAutoScroll] = React.useState(true);
  const [levelFilter, setLevelFilter] = React.useState<string>('all');
  const [sourceFilter, setSourceFilter] = React.useState<string>('all');
  const [searchText, setSearchText] = React.useState('');
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const logContainerRef = React.useRef<HTMLDivElement>(null);
  const socketRef = React.useRef<any>(null);

  React.useEffect(() => {
    // Get initial logs from logController
    setLogs(logController.getLogs());

    // Connect to WebSocket
    const serverUrl = window.location.origin.replace('5173', '3001');
    socketRef.current = io(serverUrl, {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current.on('connect', () => {
      console.log('WebSocket bağlantısı kuruldu');
    });

    socketRef.current.on('connect_error', (error: Error) => {
      console.warn('WebSocket bağlantı hatası:', error);
    });

    socketRef.current.on('initialLogs', (initialLogs: Log[]) => {
      setLogs(initialLogs);
    });

    socketRef.current.on('clientLog', (log: Log) => {
      setLogs(prev => [log, ...prev].slice(0, 1000));
    });

    socketRef.current.on('logsCleared', () => {
      setLogs([]);
      toast.success('Loglar temizlendi');
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  React.useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [logs, autoScroll]);

  const filteredLogs = React.useMemo(() => {
    return logs.filter(log => {
      const levelMatch = levelFilter === 'all' || log.level === levelFilter;
      const sourceMatch = sourceFilter === 'all' || log.source === sourceFilter;
      const textMatch = !searchText || 
        log.message.toLowerCase().includes(searchText.toLowerCase()) ||
        (log.source && log.source.toLowerCase().includes(searchText.toLowerCase()));

      return levelMatch && sourceMatch && textMatch;
    });
  }, [logs, levelFilter, sourceFilter, searchText]);

  const sources = React.useMemo(() => {
    const uniqueSources = new Set(logs.map(log => log.source).filter(Boolean));
    return Array.from(uniqueSources);
  }, [logs]);

  const downloadLogs = () => {
    const logText = filteredLogs
      .map(log => `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.source ? `[${log.source}] ` : ''}${log.message}${log.details ? `\nDetails: ${JSON.stringify(log.details, null, 2)}` : ''}`)
      .join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const clearLogs = async () => {
    try {
      await fetch('http://localhost:3001/api/logs', { method: 'DELETE' });
      setLogs([]);
      toast.success('Loglar başarıyla temizlendi');
    } catch (error) {
      toast.error('Loglar temizlenirken bir hata oluştu');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      setLogs(logController.getLogs());
      toast.success('Loglar güncellendi');
    } catch (error) {
      toast.error('Loglar güncellenirken bir hata oluştu');
    } finally {
      setIsRefreshing(false);
    }
  };

  const LogIcon = ({ level }: { level: string }) => {
    switch (level) {
      case 'error':
        return <AlertTriangle className="text-error" size={16} />;
      case 'warn':
        return <AlertTriangle className="text-warning" size={16} />;
      case 'info':
        return <Info className="text-primary" size={16} />;
      default:
        return <CheckCircle className="text-success" size={16} />;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Sistem Logları
          </h1>
          <p className="text-gray-600 dark:text-dark-text-soft mt-1">
            Sistem olaylarını ve hataları izleyin
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="button-secondary"
          >
            <RefreshCw 
              size={20} 
              className={isRefreshing ? 'animate-spin' : ''} 
            />
          </button>

          <button
            onClick={downloadLogs}
            className="button-primary"
          >
            <Download size={20} className="mr-2" />
            İndir
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Loglarda ara..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="input pl-10 w-full"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="input"
              >
                <option value="all">Tüm Seviyeler</option>
                <option value="error">Hata</option>
                <option value="warn">Uyarı</option>
                <option value="info">Bilgi</option>
              </select>
            </div>

            {sources.length > 0 && (
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="input"
              >
                <option value="all">Tüm Kaynaklar</option>
                {sources.map((source) => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            )}

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
              />
              <span className="text-sm">Otomatik Kaydır</span>
            </label>
          </div>
        </div>
      </div>

      {/* Log List */}
      <div className="card">
        <div className="p-4 border-b dark:border-dark-surface flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Terminal size={20} className="text-primary" />
            <h2 className="font-semibold">Log Kayıtları</h2>
          </div>
          <button
            onClick={clearLogs}
            className="button-error"
          >
            <Trash2 size={18} className="mr-2" />
            Temizle
          </button>
        </div>

        <div
          ref={logContainerRef}
          className="h-[calc(100vh-24rem)] overflow-y-auto p-4 space-y-2"
        >
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8">
              <Terminal className="w-16 h-16 text-gray-400 dark:text-dark-text-soft mx-auto mb-4" />
              <p className="text-gray-500 dark:text-dark-text-soft">Log kaydı bulunamadı</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {filteredLogs.map((log, index) => (
                <motion.div
                  key={`${log.timestamp}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`
                    flex items-start gap-3 p-2 rounded-lg
                    ${log.level === 'error' ? 'bg-error/5 text-error' :
                      log.level === 'warn' ? 'bg-warning/5 text-warning' :
                      'bg-gray-50 dark:bg-dark-surface text-gray-600 dark:text-dark-text-soft'}
                  `}
                >
                  <LogIcon level={log.level} />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs opacity-75">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      {log.source && (
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-dark-surface-soft rounded text-xs">
                          {log.source}
                        </span>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap">{log.message}</p>
                    {log.details && (
                      <pre className="text-xs bg-black/5 dark:bg-white/5 p-2 rounded mt-2 overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}