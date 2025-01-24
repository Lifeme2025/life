import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Terminal, XCircle, RefreshCw, Download } from 'lucide-react';
import { getLogs } from '../api/logs';

export default function LogPanel() {
  const [autoScroll, setAutoScroll] = React.useState(true);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const logContainerRef = React.useRef<HTMLDivElement>(null);
  
  const { data: logs = [], refetch, isLoading } = useQuery({
    queryKey: ['logs'],
    queryFn: getLogs,
    refetchInterval: 2000 // Her 2 saniyede bir güncelle
  });

  React.useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const downloadLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `telegram-bot-logs-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className={`fixed right-4 z-40 transition-all duration-300 ${
      isExpanded ? 'bottom-4 w-[800px] h-[600px]' : 'bottom-4 w-[400px] h-[400px]'
    }`}>
      <div className="bg-gray-900 rounded-lg shadow-2xl h-full flex flex-col">
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
          <div className="flex items-center gap-2 text-gray-200">
            <Terminal size={20} />
            <h3 className="font-semibold">Sistem Logları</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="p-1 hover:bg-gray-700 rounded"
              title="Yenile"
            >
              <RefreshCw size={18} className="text-gray-400" />
            </button>
            <button
              onClick={downloadLogs}
              className="p-1 hover:bg-gray-700 rounded"
              title="Logları İndir"
            >
              <Download size={18} className="text-gray-400" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-700 rounded text-gray-400"
              title={isExpanded ? "Küçült" : "Büyüt"}
            >
              {isExpanded ? "[-]" : "[+]"}
            </button>
            <label className="flex items-center gap-1 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded"
              />
              Otomatik Kaydır
            </label>
          </div>
        </div>

        <div
          ref={logContainerRef}
          className="flex-1 overflow-auto p-4 font-mono text-sm"
        >
          {isLoading ? (
            <div className="text-gray-400">Loglar yükleniyor...</div>
          ) : logs.length === 0 ? (
            <div className="text-gray-400">Henüz log kaydı yok</div>
          ) : (
            logs.map((log, index) => (
              <div
                key={index}
                className={`mb-1 ${
                  log.level === 'error'
                    ? 'text-red-400'
                    : log.level === 'warn'
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              >
                <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                <span className="text-gray-400">[{log.level.toUpperCase()}]</span>{' '}
                {log.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}