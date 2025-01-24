import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, Lock, Key, AlertTriangle, UserX, Download } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface GuvenlikDurumu {
  son_girisler: Array<{
    id: number;
    kullanici: string;
    ip: string;
    tarih: string;
    durum: 'basarili' | 'basarisiz';
    detay?: string;
  }>;
  engellenen_ipler: Array<{
    ip: string;
    sebep: string;
    tarih: string;
    bitis_tarihi?: string;
  }>;
  guvenlik_olaylari: Array<{
    id: number;
    tip: string;
    detay: string;
    onem: 'dusuk' | 'orta' | 'yuksek';
    tarih: string;
  }>;
  api_kullanimi: {
    gunluk_istek: number;
    basarisiz_istekler: number;
    ortalama_yanit_suresi: number;
  };
}

export default function Guvenlik() {
  const { data: guvenlik, isLoading } = useQuery<GuvenlikDurumu>({
    queryKey: ['guvenlik'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3001/api/guvenlik');
      return data;
    }
  });

  const raporIndir = () => {
    if (!guvenlik) return;

    const csv = [
      ['Güvenlik Raporu'],
      [''],
      ['Son Girişler'],
      ['Kullanıcı', 'IP', 'Tarih', 'Durum', 'Detay'],
      ...guvenlik.son_girisler.map(giris => [
        giris.kullanici,
        giris.ip,
        giris.tarih,
        giris.durum,
        giris.detay || ''
      ]),
      [''],
      ['Engellenen IP\'ler'],
      ['IP', 'Sebep', 'Tarih', 'Bitiş Tarihi'],
      ...guvenlik.engellenen_ipler.map(ip => [
        ip.ip,
        ip.sebep,
        ip.tarih,
        ip.bitis_tarihi || 'Süresiz'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guvenlik-raporu.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Güvenlik</h1>
        <button
          onClick={raporIndir}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Download size={20} />
          Rapor İndir
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Güvenlik verileri yükleniyor...</p>
        </div>
      ) : !guvenlik ? (
        <div className="text-center py-8">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Veri Bulunamadı
          </h2>
          <p className="text-gray-500">
            Güvenlik verileri henüz toplanmamış.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Özet Kartlar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Lock className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Başarısız Girişler</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {guvenlik.son_girisler.filter(g => g.durum === 'basarisiz').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Güvenlik Olayları</h3>
                  <p className="text-2xl font-bold text-red-600">
                    {guvenlik.guvenlik_olaylari.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-full">
                  <UserX className="text-orange-600" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Engellenen IP'ler</h3>
                  <p className="text-2xl font-bold text-orange-600">
                    {guvenlik.engellenen_ipler.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Son Güvenlik Olayları */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Son Güvenlik Olayları</h3>
            </div>
            <div className="p-6">
              {guvenlik.guvenlik_olaylari.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Güvenlik olayı bulunmuyor</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {guvenlik.guvenlik_olaylari.map((olay) => (
                    <div
                      key={olay.id}
                      className={`p-4 rounded-lg border ${
                        olay.onem === 'yuksek'
                          ? 'border-red-200 bg-red-50'
                          : olay.onem === 'orta'
                          ? 'border-yellow-200 bg-yellow-50'
                          : 'border-blue-200 bg-blue-50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{olay.tip}</h4>
                          <p className="text-sm text-gray-600">{olay.detay}</p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(olay.tarih).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Son Girişler */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Son Girişler</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-4">Kullanıcı</th>
                    <th className="text-left py-3 px-4">IP</th>
                    <th className="text-left py-3 px-4">Tarih</th>
                    <th className="text-left py-3 px-4">Durum</th>
                    <th className="text-left py-3 px-4">Detay</th>
                  </tr>
                </thead>
                <tbody>
                  {guvenlik.son_girisler.map((giris) => (
                    <tr key={giris.id} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{giris.kullanici}</td>
                      <td className="py-3 px-4">{giris.ip}</td>
                      <td className="py-3 px-4">
                        {new Date(giris.tarih).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            giris.durum === 'basarili'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {giris.durum === 'basarili' ? 'Başarılı' : 'Başarısız'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{giris.detay}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Engellenen IP'ler */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold">Engellenen IP'ler</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-4">IP Adresi</th>
                    <th className="text-left py-3 px-4">Sebep</th>
                    <th className="text-left py-3 px-4">Engellenme Tarihi</th>
                    <th className="text-left py-3 px-4">Bitiş Tarihi</th>
                  </tr>
                </thead>
                <tbody>
                  {guvenlik.engellenen_ipler.map((ip, index) => (
                    <tr key={index} className="border-t hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{ip.ip}</td>
                      <td className="py-3 px-4">{ip.sebep}</td>
                      <td className="py-3 px-4">
                        {new Date(ip.tarih).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        {ip.bitis_tarihi
                          ? new Date(ip.bitis_tarihi).toLocaleString()
                          : 'Süresiz'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}