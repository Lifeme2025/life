import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart2, Users, MessageSquare, Activity, Download, Filter, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function Analizler() {
  const [selectedBot, setSelectedBot] = React.useState<string>('');
  const [dateRange, setDateRange] = React.useState<[Date, Date]>([
    new Date(Date.now() - 24 * 60 * 60 * 1000),
    new Date()
  ]);

  const { data: botlar = [] } = useQuery({
    queryKey: ['botlar'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3001/api/bots');
      return data;
    }
  });

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', selectedBot, dateRange],
    queryFn: async () => {
      const [start, end] = dateRange;
      const { data } = await axios.get(`http://localhost:3001/api/analytics`, {
        params: {
          bot_id: selectedBot,
          start_date: start.toISOString(),
          end_date: end.toISOString()
        }
      });
      return data;
    },
    enabled: !!selectedBot,
    refetchInterval: 5000 // Her 5 saniyede bir güncelle
  });

  const downloadReport = async () => {
    try {
      const { data } = await axios.get(`http://localhost:3001/api/analytics/export`, {
        params: {
          bot_id: selectedBot,
          start_date: dateRange[0].toISOString(),
          end_date: dateRange[1].toISOString()
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-report-${new Date().toISOString()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error('Rapor indirilemedi');
    }
  };

  return (
    <div className="space-y-6">
      {/* Başlık ve Filtreler */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Detaylı Analizler</h1>
          <p className="text-gray-600">Bot performansını ve kullanıcı davranışlarını analiz edin</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {/* Bot Seçimi */}
          <select
            value={selectedBot}
            onChange={(e) => setSelectedBot(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">Bot Seçin</option>
            {botlar.map((bot: any) => (
              <option key={bot.id} value={bot.id}>{bot.isim}</option>
            ))}
          </select>

          {/* Tarih Aralığı */}
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-gray-400" />
            <input
              type="date"
              value={dateRange[0].toISOString().split('T')[0]}
              onChange={(e) => setDateRange([new Date(e.target.value), dateRange[1]])}
              className="px-4 py-2 border rounded-lg"
            />
            <span>-</span>
            <input
              type="date"
              value={dateRange[1].toISOString().split('T')[0]}
              onChange={(e) => setDateRange([dateRange[0], new Date(e.target.value)])}
              className="px-4 py-2 border rounded-lg"
            />
          </div>

          {/* Rapor İndirme */}
          <button
            onClick={downloadReport}
            disabled={!selectedBot}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Download size={20} />
            Rapor İndir
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Veriler yükleniyor...</p>
        </div>
      ) : !selectedBot ? (
        <div className="text-center py-8">
          <BarChart2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Bot Seçin
          </h2>
          <p className="text-gray-500">
            Analiz verilerini görüntülemek için bir bot seçin
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Real-time Metrikler */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Aktif Kullanıcılar</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {analytics?.realtimeMetrics?.activeUsers || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <MessageSquare className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Mesaj Sayısı</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {analytics?.realtimeMetrics?.messageCount || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Activity className="text-purple-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Etkileşim Oranı</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {((analytics?.realtimeMetrics?.interactionRate || 0) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Filter className="text-orange-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Komut Kullanımı</h3>
                  <p className="text-2xl font-bold text-orange-600">
                    {analytics?.realtimeMetrics?.commandCount || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Grafikler */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Saatlik Aktivite */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Saatlik Aktivite</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.hourlyDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Platform Dağılımı */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Platform Dağılımı</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics?.platformDistribution}
                      dataKey="_count"
                      nameKey="metadata.platform"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {analytics?.platformDistribution.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Aktif Kullanıcı Listesi */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Aktif Kullanıcılar</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Kullanıcı ID</th>
                    <th className="text-left py-3 px-4">Platform</th>
                    <th className="text-left py-3 px-4">Lokasyon</th>
                    <th className="text-left py-3 px-4">Son Aktivite</th>
                    <th className="text-left py-3 px-4">Oturum Süresi</th>
                    <th className="text-left py-3 px-4">Etkileşim</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.realtimeMetrics?.userSessions?.map((session: any) => {
                    const duration = new Date().getTime() - new Date(session.startTime).getTime();
                    const minutes = Math.floor(duration / 1000 / 60);
                    
                    return (
                      <tr key={session.user_id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{session.user_id}</td>
                        <td className="py-3 px-4">{session.platform}</td>
                        <td className="py-3 px-4">{session.location}</td>
                        <td className="py-3 px-4">
                          {new Date(session.lastActivity).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-4">{minutes} dk</td>
                        <td className="py-3 px-4">{session.eventCount} etkileşim</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}