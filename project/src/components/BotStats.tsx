import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Bot, Users, MessageSquare, Activity } from 'lucide-react';
import axios from 'axios';

interface BotStatsProps {
  botId: number;
}

export default function BotStats({ botId }: BotStatsProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['bot-stats', botId],
    queryFn: async () => {
      const { data } = await axios.get(`http://localhost:3001/api/bots/${botId}/stats`);
      return data;
    },
    refetchInterval: 5000 // Her 5 saniyede bir güncelle
  });

  if (isLoading) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Son 24 saatlik mesaj verilerini hazırla
  const messageData = stats?.son_mesajlar?.map((mesaj: any) => ({
    time: new Date(mesaj.timestamp).toLocaleTimeString(),
    count: 1
  })) || [];

  return (
    <div className="space-y-6">
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Toplam Mesaj</p>
              <p className="text-2xl font-bold">{stats?.mesaj_sayisi || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Aktif Kullanıcılar</p>
              <p className="text-2xl font-bold">{stats?.aktif_kullanicilar || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Günlük Etkileşim</p>
              <p className="text-2xl font-bold">{stats?.kullanici_etkilesimleri?.gunluk || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Bot className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Bot Durumu</p>
              <p className="text-2xl font-bold text-green-500">Aktif</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grafik */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Mesaj İstatistikleri</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={messageData}>
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

      {/* Son Mesajlar */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Son Mesajlar</h3>
        <div className="space-y-2">
          {stats?.son_mesajlar?.slice(0, 5).map((mesaj: any) => (
            <div key={mesaj.id} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm text-gray-900">{mesaj.message}</p>
                <p className="text-xs text-gray-500">
                  {new Date(mesaj.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}