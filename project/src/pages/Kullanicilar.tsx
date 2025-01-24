import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, Filter, Download, Trash2, Ban, MoreVertical, Mail, MessageSquare, History, Shield, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Filters from '../components/Filters';
import SortButton from '../components/SortButton';

interface Kullanici {
  id: number;
  telegram_id: string;
  kullanici_adi: string;
  ad: string;
  soyad: string;
  katilma_tarihi: string;
  son_gorulme: string;
  durum: 'aktif' | 'pasif' | 'engelli';
  mesaj_sayisi: number;
}

export default function Kullanicilar() {
  const [aramaMetni, setAramaMetni] = React.useState('');
  const [durumFiltresi, setDurumFiltresi] = React.useState<string>('hepsi');
  const [seciliKullanici, setSeciliKullanici] = React.useState<Kullanici | null>(null);
  const [detayAcik, setDetayAcik] = React.useState(false);
  const [filters, setFilters] = React.useState<Record<string, any>>({});
  const [siralama, setSiralama] = React.useState<{
    field: string;
    direction: 'asc' | 'desc';
  }>({
    field: 'katilma_tarihi',
    direction: 'desc'
  });

  const siralamaSecenekleri = [
    { id: 'katilma_tarihi', label: 'Katılma Tarihi' },
    { id: 'son_gorulme', label: 'Son Görülme' },
    { id: 'mesaj_sayisi', label: 'Mesaj Sayısı' },
    { id: 'kullanici_adi', label: 'Kullanıcı Adı' }
  ];

  const { data: kullanicilar = [], isLoading } = useQuery({
    queryKey: ['kullanicilar'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3001/api/kullanicilar');
      return data;
    }
  });

  const filterOptions = [
    {
      id: 'durum',
      label: 'Durum',
      type: 'select' as const,
      options: [
        { value: 'aktif', label: 'Aktif' },
        { value: 'pasif', label: 'Pasif' },
        { value: 'engelli', label: 'Engelli' }
      ]
    },
    {
      id: 'katilma_tarihi',
      label: 'Katılma Tarihi',
      type: 'date' as const
    },
    {
      id: 'mesaj_sayisi',
      label: 'Minimum Mesaj',
      type: 'number' as const
    }
  ];

  const filtrelenmisKullanicilar = React.useMemo(() => {
    let sonuc = kullanicilar.filter((kullanici: Kullanici) => {
      const aramaUyumu = 
        kullanici.kullanici_adi.toLowerCase().includes(aramaMetni.toLowerCase()) ||
        kullanici.ad.toLowerCase().includes(aramaMetni.toLowerCase()) ||
        kullanici.soyad.toLowerCase().includes(aramaMetni.toLowerCase());
      
      const durumUyumu = durumFiltresi === 'hepsi' || kullanici.durum === durumFiltresi;
      
      return aramaUyumu && durumUyumu;
    });

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
  }, [kullanicilar, aramaMetni, durumFiltresi, siralama]);

  const kullanicilariIndir = () => {
    const csv = [
      ['ID', 'Kullanıcı Adı', 'Ad', 'Soyad', 'Katılma Tarihi', 'Son Görülme', 'Durum', 'Mesaj Sayısı'],
      ...filtrelenmisKullanicilar.map((k: Kullanici) => [
        k.id,
        k.kullanici_adi,
        k.ad,
        k.soyad,
        k.katilma_tarihi,
        k.son_gorulme,
        k.durum,
        k.mesaj_sayisi
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kullanicilar.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Kullanıcı Yönetimi
          </h1>
          <p className="text-gray-600 dark:text-dark-text-soft mt-1">
            Bot kullanıcılarını görüntüleyin ve yönetin
          </p>
        </div>
        <button
          onClick={kullanicilariIndir}
          className="button-primary"
        >
          <Download size={20} className="mr-2" />
          Dışa Aktar
        </button>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-primary/10 text-primary">
              <Users size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Toplam Kullanıcı</h3>
              <p className="text-2xl font-bold text-primary">
                {kullanicilar.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-success/10 text-success">
              <CheckCircle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Aktif Kullanıcı</h3>
              <p className="text-2xl font-bold text-success">
                {kullanicilar.filter(k => k.durum === 'aktif').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-warning/10 text-warning">
              <XCircle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Pasif Kullanıcı</h3>
              <p className="text-2xl font-bold text-warning">
                {kullanicilar.filter(k => k.durum === 'pasif').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-error/10 text-error">
              <Ban size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Engelli Kullanıcı</h3>
              <p className="text-2xl font-bold text-error">
                {kullanicilar.filter(k => k.durum === 'engelli').length}
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
              placeholder="Kullanıcı ara..."
              value={aramaMetni}
              onChange={(e) => setAramaMetni(e.target.value)}
              className="input pl-10 w-full"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={durumFiltresi}
                onChange={(e) => setDurumFiltresi(e.target.value)}
                className="input"
              >
                <option value="hepsi">Tüm Durumlar</option>
                <option value="aktif">Aktif</option>
                <option value="pasif">Pasif</option>
                <option value="engelli">Engelli</option>
              </select>
            </div>
            <SortButton
              options={siralamaSecenekleri}
              activeSort={siralama}
              onSort={(field, direction) => setSiralama({ field, direction })}
            />
          </div>
        </div>
      </div>

      {/* Kullanıcı Listesi */}
      {isLoading ? (
        <div className="card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-dark-text-soft">Kullanıcılar yükleniyor...</p>
        </div>
      ) : filtrelenmisKullanicilar.length === 0 ? (
        <div className="card p-8 text-center">
          <Users className="w-16 h-16 text-gray-400 dark:text-dark-text-soft mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-dark-text mb-2">
            Kullanıcı Bulunamadı
          </h2>
          <p className="text-gray-500 dark:text-dark-text-soft">
            Arama kriterlerinize uygun kullanıcı bulunmamaktadır.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b dark:border-dark-surface">
                  <th className="text-left p-4 font-semibold">Kullanıcı</th>
                  <th className="text-left p-4 font-semibold">Katılma Tarihi</th>
                  <th className="text-left p-4 font-semibold">Son Görülme</th>
                  <th className="text-left p-4 font-semibold">Durum</th>
                  <th className="text-left p-4 font-semibold">Mesaj Sayısı</th>
                  <th className="text-right p-4 font-semibold">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filtrelenmisKullanicilar.map((kullanici: Kullanici) => (
                  <tr 
                    key={kullanici.id} 
                    className="border-b dark:border-dark-surface hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors"
                  >
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{kullanici.kullanici_adi}</div>
                        <div className="text-sm text-gray-500 dark:text-dark-text-soft">
                          {kullanici.ad} {kullanici.soyad}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {new Date(kullanici.katilma_tarihi).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      {new Date(kullanici.son_gorulme).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${kullanici.durum === 'aktif' 
                          ? 'bg-success/10 text-success'
                          : kullanici.durum === 'pasif'
                          ? 'bg-warning/10 text-warning'
                          : 'bg-error/10 text-error'
                        }
                      `}>
                        {kullanici.durum.charAt(0).toUpperCase() + kullanici.durum.slice(1)}
                      </span>
                    </td>
                    <td className="p-4">{kullanici.mesaj_sayisi}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSeciliKullanici(kullanici);
                            setDetayAcik(true);
                          }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-dark-surface rounded-lg"
                          title="Detaylar"
                        >
                          <MoreVertical size={18} className="text-gray-500" />
                        </button>
                        <button
                          onClick={() => {}}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-dark-surface rounded-lg"
                          title="Mesaj Gönder"
                        >
                          <MessageSquare size={18} className="text-primary" />
                        </button>
                        <button
                          onClick={() => {}}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-dark-surface rounded-lg"
                          title="Engelle"
                        >
                          <Ban size={18} className="text-error" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Kullanıcı Detay Modal */}
      <AnimatePresence>
        {detayAcik && seciliKullanici && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setDetayAcik(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed inset-x-4 bottom-4 top-20 md:inset-x-auto md:right-4 md:w-96 z-50"
            >
              <div className="card h-full flex flex-col">
                {/* Header */}
                <div className="p-6 border-b dark:border-dark-surface">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold">
                      {seciliKullanici.ad[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{seciliKullanici.kullanici_adi}</h3>
                      <p className="text-gray-500 dark:text-dark-text-soft">
                        {seciliKullanici.ad} {seciliKullanici.soyad}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* İstatistikler */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-dark-surface rounded-xl">
                      <MessageSquare className="text-primary mb-2" size={20} />
                      <p className="text-sm text-gray-500 dark:text-dark-text-soft">Mesaj Sayısı</p>
                      <p className="text-lg font-semibold">{seciliKullanici.mesaj_sayisi}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-dark-surface rounded-xl">
                      <History className="text-secondary mb-2" size={20} />
                      <p className="text-sm text-gray-500 dark:text-dark-text-soft">Son Görülme</p>
                      <p className="text-lg font-semibold">
                        {new Date(seciliKullanici.son_gorulme).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Detay Bilgiler */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">Kullanıcı Bilgileri</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-dark-text-soft">Telegram ID</span>
                        <span>{seciliKullanici.telegram_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-dark-text-soft">Katılma Tarihi</span>
                        <span>{new Date(seciliKullanici.katilma_tarihi).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-dark-text-soft">Durum</span>
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${seciliKullanici.durum === 'aktif' 
                            ? 'bg-success/10 text-success'
                            : seciliKullanici.durum === 'pasif'
                            ? 'bg-warning/10 text-warning'
                            : 'bg-error/10 text-error'
                          }
                        `}>
                          {seciliKullanici.durum.charAt(0).toUpperCase() + seciliKullanici.durum.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 border-t dark:border-dark-surface space-y-2">
                  <button className="button-primary w-full">
                    <MessageSquare size={18} className="mr-2" />
                    Mesaj Gönder
                  </button>
                  <button className="button-secondary w-full">
                    <Shield size={18} className="mr-2" />
                    Engelle
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}