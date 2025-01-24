import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Zap, Cpu, MemoryStick as Memory, Clock, HardDrive, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

interface PerformansData {
  cpu_kullanim: Array<{
    zaman: string;
    yuzde: number;
  }>;
  bellek_kullanim: Array<{
    zaman: string;
    kullanilan: number;
    toplam: number;
  }>;
  disk_kullanim: {
    kullanilan: number;
    toplam: number;
    yuzde: number;
  };
  yanit_sureleri: Array<{
    zaman: string;
    sure: number;
  }>;
  sistem_durumu: {
    uptime: number;
    aktif_botlar: number;
    aktif_baglantilar: number;
    dakikalik_istek: number;
  };
}

export default function Performans() {
  const { data: performans, isLoading } = useQuery<PerformansData>({
    queryKey: ['performans'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3001/api/performans');
      return data;
    },
    refetchInterval: 5000 // Her 5 saniyede bir güncelle
  });

  const performansVerileriniIndir = () => {
    if (!performans) return;

    const csv = [
      ['CPU Kullanımı'],
      ['Zaman', 'Yüzde'],
      ...performans.cpu_kullanim.map(cpu => [cpu.zaman, cpu.yuzde]),
      [''],
      ['Bellek Kullanımı'],
      ['Zaman', 'Kullanılan (MB)', 'Toplam (MB)'],
      ...performans.bellek_kullanim.map(bellek => [
        bellek.zaman,
        bellek.kullanilan,
        bellek.toplam
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sistem-performans.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatByte = (byte: number) => {
    const gb = byte / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    return `${days}g ${hours}s ${minutes}d`;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sistem Performansı</h1>
        <button
          onClick={performansVerileriniIndir}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Download size={20} />
          Dışa Aktar
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Performans verileri yükleniyor...</p>
        </div>
      ) : !performans ? (
        <div className="text-center py-8">
          <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Veri Bulunamadı
          </h2>
          <p className="text-gray-500">
            Performans verileri henüz toplanmamış.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Sistem Durumu Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Çalışma Süresi</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatUptime(performans.sistem_durumu.uptime)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Zap className="text-green-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Aktif Botlar</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {performans.sistem_durumu.aktif_botlar}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Cpu className="text-purple-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">CPU Kullanımı</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {performans.cpu_kullanim[performans.cpu_kullanim.length - 1]?.yuzde.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Memory className="text-orange-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Bellek Kullanımı</h3>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatByte(performans.bellek_kullanim[performans.bellek_kullanim.length - 1]?.kullanilan || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CPU Kullanım Grafiği */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">CPU Kullanımı</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performans.cpu_kullanim}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="zaman" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="yuzde" 
                    stroke="#3b82f6" 
                    name="CPU %" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bellek Kullanım Grafiği */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Bellek Kullanımı</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performans.bellek_kullanim}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="zaman" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="kullanilan" 
                    stroke="#3b82f6" 
                    name="Kullanılan" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="toplam" 
                    stroke="#10b981" 
                    name="Toplam" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Disk Kullanımı */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Disk Kullanımı</h3>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                    {performans.disk_kullanim.yuzde}% Kullanımda
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    {formatByte(performans.disk_kullanim.kullanilan)} / {formatByte(performans.disk_kullanim.toplam)}
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                <div 
                  style={{ width: `${performans.disk_kullanim.yuzde}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}