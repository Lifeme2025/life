import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Globe, Activity, Users, MessageSquare, Bot } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

interface BotAnalyticsProps {
  botId: string;
}

export default function BotAnalytics({ botId }: BotAnalyticsProps) {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['bot-analytics', botId],
    queryFn: async () => {
      const { data } = await axios.get(`http://localhost:3001/api/analytics/bot/${botId}`);
      return data;
    },
    refetchInterval: 5000 // Her 5 saniyede bir güncelle
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-48 bg-gray-200 rounded-xl"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
          <div className="h-32 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Anlık Metrikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm opacity-90">Aktif Kullanıcılar</p>
              <p className="text-2xl font-bold">{analytics?.activeUsers || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <MessageSquare size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm opacity-90">Dakikalık Mesaj</p>
              <p className="text-2xl font-bold">{analytics?.messagesPerMinute || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Activity size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm opacity-90">Yanıt Süresi</p>
              <p className="text-2xl font-bold">{analytics?.responseTime || '0.0'}s</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm opacity-90">Bot Durumu</p>
              <p className="text-2xl font-bold">{analytics?.status || 'Aktif'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mesaj Trendi */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Mesaj Trendi (Son 1 Saat)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.messageHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Coğrafi Dağılım */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Coğrafi Dağılım</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.locationStats}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {analytics?.locationStats.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Aktif Kullanıcılar */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Aktif Kullanıcılar</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Kullanıcı</th>
                <th className="text-left py-3 px-4">Platform</th>
                <th className="text-left py-3 px-4">Lokasyon</th>
                <th className="text-left py-3 px-4">Son Aktivite</th>
                <th className="text-left py-3 px-4">Etkileşim</th>
              </tr>
            </thead>
            <tbody>
              {analytics?.activeUserSessions?.map((session: any) => (
                <tr key={session.userId} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{session.username}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-gray-400" />
                      {session.platform}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      {session.location}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {new Date(session.lastActivity).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Activity size={16} className="text-gray-400" />
                      {session.interactions} etkileşim
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}