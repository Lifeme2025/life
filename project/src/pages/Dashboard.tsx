import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bot, Users, MessageSquare, Activity, Clock, Shield, Database, Zap, BarChart2, ArrowUp, ArrowDown, Map, Globe, Calendar, Filter, Download, RefreshCw, Search, List, Grid, ChevronDown, Sparkles, Cpu, HardDrive, Wifi } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { logController } from '../utils/logController';
import { io } from 'socket.io-client';

const COLORS = ['#4F46E5', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

// Neon glow effect for cards
const neonGlow = {
  initial: { boxShadow: '0 0 0 rgba(79, 70, 229, 0)' },
  animate: {
    boxShadow: [
      '0 0 20px rgba(79, 70, 229, 0.3)',
      '0 0 30px rgba(79, 70, 229, 0.2)',
      '0 0 20px rgba(79, 70, 229, 0.3)'
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: 'reverse'
    }
  }
};

// Pulse animation for live indicators
const pulse = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.2, 1],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export default function Dashboard() {
  const [dateRange, setDateRange] = React.useState<[Date, Date]>([
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    new Date()
  ]);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [selectedMetric, setSelectedMetric] = React.useState('messages');
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);
  const [hoveredCard, setHoveredCard] = React.useState<string | null>(null);
  const socketRef = React.useRef<any>(null);

  // Real-time metrics için state
  const [realTimeMetrics, setRealTimeMetrics] = React.useState({
    cpuUsage: 0,
    memoryUsage: 0,
    networkLatency: 0,
    activeConnections: 0
  });

  // Socket.IO bağlantısını kur
  React.useEffect(() => {
    try {
      // Get the current URL and replace the port for the server
      const serverUrl = window.location.origin.replace('5173', '3001');
      
      // Create Socket.IO instance with secure configuration
      socketRef.current = io(serverUrl, {
        path: '/socket.io',
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        secure: true,
        rejectUnauthorized: false
      });

      // Socket event handlers
      socketRef.current.on('connect', () => {
        logController.addLog('info', 'Real-time metrics connection established', 'dashboard');
      });

      socketRef.current.on('metrics', (metrics) => {
        setRealTimeMetrics(metrics);
        logController.addLog('info', 'Real-time metrics updated', 'dashboard');
      });

      socketRef.current.on('connect_error', (error) => {
        logController.addLog('error', `Real-time metrics connection error: ${error.message}`, 'dashboard');
      });

      socketRef.current.on('disconnect', (reason) => {
        logController.addLog('warn', `Real-time metrics disconnected: ${reason}`, 'dashboard');
      });

      // Cleanup on unmount
      return () => {
        socketRef.current?.disconnect();
      };
    } catch (error: any) {
      logController.addLog('error', `Socket initialization error: ${error.message}`, 'dashboard');
    }
  }, []);

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['dashboard-stats', dateRange],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3001/api/istatistikler/dashboard', {
        params: {
          start_date: dateRange[0].toISOString(),
          end_date: dateRange[1].toISOString(),
          metric: selectedMetric
        }
      });
      return data;
    },
    refetchInterval: 30000,
    onError: (error: any) => {
      logController.addLog('error', 'Dashboard stats fetch error', 'dashboard', error);
    }
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success('Veriler güncellendi');
      logController.addLog('info', 'Dashboard manually refreshed', 'dashboard');
    } catch (error) {
      toast.error('Veriler güncellenirken hata oluştu');
      logController.addLog('error', 'Manual refresh error', 'dashboard', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num;
  };

  return (
    <div className="space-y-6">
      {/* Başlık ve Kontroller */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-3">
            <Sparkles className="text-primary" />
            Canlı Dashboard
          </h1>
          <p className="text-gray-600 dark:text-dark-text-soft mt-1">
            Telegram Bot Yönetim Paneli genel durumu
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Tarih Aralığı */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2"
          >
            <Calendar size={20} className="text-gray-400" />
            <select 
              className="input"
              onChange={(e) => {
                const days = parseInt(e.target.value);
                setDateRange([
                  new Date(Date.now() - days * 24 * 60 * 60 * 1000),
                  new Date()
                ]);
              }}
            >
              <option value="1">Son 24 Saat</option>
              <option value="7">Son 7 Gün</option>
              <option value="30">Son 30 Gün</option>
              <option value="90">Son 90 Gün</option>
            </select>
          </motion.div>

          {/* Görünüm Modu */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-dark-surface rounded-lg"
          >
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all duration-300 ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-dark-surface-soft shadow-lg shadow-primary/20'
                  : 'text-gray-500 dark:text-dark-text-soft'
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-300 ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-dark-surface-soft shadow-lg shadow-primary/20'
                  : 'text-gray-500 dark:text-dark-text-soft'
              }`}
            >
              <List size={20} />
            </button>
          </motion.div>

          {/* Filtreler */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setShowFilters(!showFilters)}
            className="button-secondary"
          >
            <Filter size={20} className="mr-2" />
            Filtreler
            <motion.div
              animate={{ rotate: showFilters ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={20} className="ml-2" />
            </motion.div>
          </motion.button>

          {/* Yenile */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="button-primary relative overflow-hidden"
          >
            <RefreshCw 
              size={20} 
              className={`mr-2 transition-transform duration-700 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            Yenile
            {isRefreshing && (
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Filtre Paneli */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="card p-6 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Metrik Seçimi */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Metrik
                </label>
                <select
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value)}
                  className="input w-full"
                >
                  <option value="messages">Mesajlar</option>
                  <option value="users">Kullanıcılar</option>
                  <option value="bots">Botlar</option>
                  <option value="performance">Performans</option>
                </select>
              </div>

              {/* Bot Filtresi */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Bot
                </label>
                <select className="input w-full">
                  <option value="">Tüm Botlar</option>
                  {stats?.botlar?.map((bot: any) => (
                    <option key={bot.id} value={bot.id}>{bot.isim}</option>
                  ))}
                </select>
              </div>

              {/* Arama */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Arama
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ara..."
                    className="input pl-10 w-full"
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          variants={neonGlow}
          initial="initial"
          animate="animate"
          whileHover={{ scale: 1.02 }}
          onHoverStart={() => setHoveredCard('cpu')}
          onHoverEnd={() => setHoveredCard(null)}
          className="card p-6 relative overflow-hidden group"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50" />
          
          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-primary/10 text-primary relative">
                <Cpu size={24} />
                <motion.div
                  variants={pulse}
                  initial="initial"
                  animate="animate"
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold">CPU Kullanımı</h3>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-primary">
                    {realTimeMetrics.cpuUsage}%
                  </p>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {realTimeMetrics.cpuUsage > 80 ? (
                      <ArrowUp className="text-error" size={20} />
                    ) : (
                      <ArrowDown className="text-success" size={20} />
                    )}
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="h-2 bg-gray-100 dark:bg-dark-surface rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-secondary"
                  initial={{ width: 0 }}
                  animate={{ width: `${realTimeMetrics.cpuUsage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Memory Usage */}
        <motion.div
          variants={neonGlow}
          initial="initial"
          animate="animate"
          whileHover={{ scale: 1.02 }}
          className="card p-6 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-primary/5 opacity-50" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-success/10 text-success relative">
                <HardDrive size={24} />
                <motion.div
                  variants={pulse}
                  initial="initial"
                  animate="animate"
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold">RAM Kullanımı</h3>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-success">
                    {realTimeMetrics.memoryUsage}%
                  </p>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {realTimeMetrics.memoryUsage > 80 ? (
                      <ArrowUp className="text-error" size={20} />
                    ) : (
                      <ArrowDown className="text-success" size={20} />
                    )}
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="h-2 bg-gray-100 dark:bg-dark-surface rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-success to-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${realTimeMetrics.memoryUsage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Network Latency */}
        <motion.div
          variants={neonGlow}
          initial="initial"
          animate="animate"
          whileHover={{ scale: 1.02 }}
          className="card p-6 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-success/5 opacity-50" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-accent/10 text-accent relative">
                <Wifi size={24} />
                <motion.div
                  variants={pulse}
                  initial="initial"
                  animate="animate"
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Ağ Gecikmesi</h3>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-accent">
                    {realTimeMetrics.networkLatency}ms
                  </p>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {realTimeMetrics.networkLatency > 100 ? (
                      <ArrowUp className="text-error" size={20} />
                    ) : (
                      <ArrowDown className="text-success" size={20} />
                    )}
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="h-2 bg-gray-100 dark:bg-dark-surface rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent to-success"
                  initial={{ width: 0 }}
                  animate={{ width: `${(realTimeMetrics.networkLatency / 200) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Active Connections */}
        <motion.div
          variants={neonGlow}
          initial="initial"
          animate="animate"
          whileHover={{ scale: 1.02 }}
          className="card p-6 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-accent/5 opacity-50" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-secondary/10 text-secondary relative">
                <Users size={24} />
                <motion.div
                  variants={pulse}
                  initial="initial"
                  animate="animate"
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Aktif Bağlantılar</h3>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-secondary">
                    {realTimeMetrics.activeConnections}
                  </p>
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {realTimeMetrics.activeConnections > 1000 ? (
                      <ArrowUp className="text-success" size={20} />
                    ) : (
                      <ArrowDown className="text-warning" size={20} />
                    )}
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="h-2 bg-gray-100 dark:bg-dark-surface rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-secondary to-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${(realTimeMetrics.activeConnections / 2000) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Ana Grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mesaj Trendi */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50" />
          
          <div className="relative z-10">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart2 className="text-primary" />
              Mesaj Trendi
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.mesaj_trendi || []}>
                  <defs>
                    <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="saat" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(23,23,23,0.9)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="mesaj_sayisi" 
                    stroke="#4F46E5"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorMessages)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Kullanıcı Dağılımı */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-primary/5 opacity-50" />
          
          <div className="relative z-10">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="text-success" />
              Kullanıcı Dağılımı
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.kullanici_dagilimi || []}
                    dataKey="deger"
                    nameKey="kategori"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {stats?.kullanici_dagilimi?.map((_: any, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(23,23,23,0.9)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Canlı Aktivite Akışı */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card p-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-secondary/5 opacity-50" />
        
        <div className="relative z-10">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="text-accent" />
            Canlı Aktivite
            <motion.div
              variants={pulse}
              initial="initial"
              animate="animate"
              className="w-2 h-2 bg-green-500 rounded-full"
            />
          </h3>
          
          <div className="space-y-4">
            {stats?.canli_aktivite?.map((aktivite: any, index: number) => (
              <motion.div
                key={aktivite.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-dark-surface rounded-xl hover:bg-gray-100 dark:hover:bg-dark-surface-soft transition-colors"
              >
                <div className={`
                  p-2 rounded-lg
                  ${aktivite.tip === 'mesaj' ? 'bg-primary/10 text-primary' :
                    aktivite.tip === 'kullanici' ? 'bg-success/10 text-success' :
                    aktivite.tip === 'bot' ? 'bg-accent/10 text-accent' :
                    'bg-gray-100 text-gray-600'}
                `}>
                  {aktivite.tip === 'mesaj' ? <MessageSquare size={20} /> :
                   aktivite.tip === 'kullanici' ? <Users size={20} /> :
                   aktivite.tip === 'bot' ? <Bot size={20} /> :
                   <Activity size={20} />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{aktivite.baslik}</p>
                  <p className="text-sm text-gray-500 dark:text-dark-text-soft">
                    {aktivite.aciklama}
                  </p>
                </div>
                <span className="text-sm text-gray-500 dark:text-dark-text-soft">
                  {new Date(aktivite.tarih).toLocaleTimeString()}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}