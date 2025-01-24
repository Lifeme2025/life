import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Database, Table, Download, RefreshCw, HardDrive, Search, Filter } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import SortButton from '../components/SortButton';

interface VeritabaniDurumu {
  boyut: number;
  tablo_sayisi: number;
  son_yedekleme: string;
  tablolar: Array<{
    isim: string;
    satir_sayisi: number;
    boyut: number;
    son_guncelleme: string;
  }>;
  performans: {
    aktif_baglantilar: number;
    sorgu_sayisi: number;
    onbellek_hit_orani: number;
  };
}

export default function Veritabani() {
  const [aramaMetni, setAramaMetni] = React.useState('');
  const [siralama, setSiralama] = React.useState<{
    field: string;
    direction: 'asc' | 'desc';
  }>({
    field: 'isim',
    direction: 'asc'
  });

  const siralamaSecenekleri = [
    { id: 'isim', label: 'Tablo Adı' },
    { id: 'satir_sayisi', label: 'Satır Sayısı' },
    { id: 'boyut', label: 'Boyut' },
    { id: 'son_guncelleme', label: 'Son Güncelleme' }
  ];

  const { data: durum, isLoading, refetch } = useQuery<VeritabaniDurumu>({
    queryKey: ['veritabani-durum'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3001/api/veritabani/durum');
      return data;
    }
  });

  const formatBoyut = (byte: number) => {
    if (byte < 1024) return `${byte} B`;
    if (byte < 1024 * 1024) return `${(byte / 1024).toFixed(2)} KB`;
    if (byte < 1024 * 1024 * 1024) return `${(byte / (1024 * 1024)).toFixed(2)} MB`;
    return `${(byte / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const yedekAl = async () => {
    try {
      await axios.post('http://localhost:3001/api/veritabani/yedekle');
      toast.success('Veritabanı yedeği başarıyla alındı');
    } catch (error) {
      toast.error('Yedekleme sırasında bir hata oluştu');
    }
  };

  const filtrelenenTablolar = React.useMemo(() => {
    if (!durum?.tablolar) return [];

    let sonuc = durum.tablolar.filter(tablo => 
      tablo.isim.toLowerCase().includes(aramaMetni.toLowerCase())
    );

    // Sıralama
    sonuc.sort((a, b) => {
      const aValue = a[siralama.field];
      const bValue = b[siralama.field];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return siralama.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return siralama.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return siralama.direction === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      return 0;
    });

    return sonuc;
  }, [durum?.tablolar, aramaMetni, siralama]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Veritabanı Yönetimi
          </h1>
          <p className="text-gray-600 dark:text-dark-text-soft mt-1">
            Veritabanı durumunu izleyin ve yönetin
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            className="button-secondary"
          >
            <RefreshCw size={20} className="mr-2" />
            Yenile
          </button>
          <button
            onClick={yedekAl}
            className="button-primary"
          >
            <Download size={20} className="mr-2" />
            Yedek Al
          </button>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-primary/10 text-primary">
              <HardDrive size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Toplam Boyut</h3>
              <p className="text-2xl font-bold text-primary">
                {durum && formatBoyut(durum.boyut)}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-success/10 text-success">
              <Table size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Tablo Sayısı</h3>
              <p className="text-2xl font-bold text-success">
                {durum?.tablo_sayisi}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-accent/10 text-accent">
              <Database size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Aktif Bağlantılar</h3>
              <p className="text-2xl font-bold text-accent">
                {durum?.performans.aktif_baglantilar}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-secondary/10 text-secondary">
              <RefreshCw size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Önbellek Hit Oranı</h3>
              <p className="text-2xl font-bold text-secondary">
                {durum?.performans.onbellek_hit_orani.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtreler */}
      <div className="card p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Tablo ara..."
              value={aramaMetni}
              onChange={(e) => setAramaMetni(e.target.value)}
              className="input pl-10 w-full"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          <SortButton
            options={siralamaSecenekleri}
            activeSort={siralama}
            onSort={(field, direction) => setSiralama({ field, direction })}
          />
        </div>
      </div>

      {/* Tablo Listesi */}
      {isLoading ? (
        <div className="card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-dark-text-soft">Veritabanı durumu yükleniyor...</p>
        </div>
      ) : !durum ? (
        <div className="card p-8 text-center">
          <Database className="w-16 h-16 text-gray-400 dark:text-dark-text-soft mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-dark-text mb-2">
            Veri Bulunamadı
          </h2>
          <p className="text-gray-500 dark:text-dark-text-soft">
            Veritabanı durumu alınamadı.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-dark-surface">
                  <th className="text-left py-3 px-4">Tablo Adı</th>
                  <th className="text-left py-3 px-4">Satır Sayısı</th>
                  <th className="text-left py-3 px-4">Boyut</th>
                  <th className="text-left py-3 px-4">Son Güncelleme</th>
                </tr>
              </thead>
              <tbody>
                {filtrelenenTablolar.map((tablo) => (
                  <tr key={tablo.isim} className="border-t dark:border-dark-surface hover:bg-gray-50 dark:hover:bg-dark-surface/50">
                    <td className="py-3 px-4 font-medium">{tablo.isim}</td>
                    <td className="py-3 px-4">{tablo.satir_sayisi.toLocaleString()}</td>
                    <td className="py-3 px-4">{formatBoyut(tablo.boyut)}</td>
                    <td className="py-3 px-4">
                      {new Date(tablo.son_guncelleme).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Son Yedekleme Bilgisi */}
      <div className="card p-6 mt-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Son Yedekleme</h3>
            <p className="text-gray-500 dark:text-dark-text-soft">
              {durum?.son_yedekleme ? new Date(durum.son_yedekleme).toLocaleString() : 'Henüz yedekleme yapılmadı'}
            </p>
          </div>
          <button
            onClick={yedekAl}
            className="button-primary"
          >
            <Download size={20} className="mr-2" />
            Yeni Yedek Al
          </button>
        </div>
      </div>
    </div>
  );
}