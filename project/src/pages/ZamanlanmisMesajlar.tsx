import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, Trash2, Edit2, Play, Pause, Calendar, Search, Filter, Bot, MessageSquare, AlertTriangle, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface ZamanlanmisMesaj {
  id: number;
  sablon_id: number;
  sablon_baslik: string;
  bot_ids: number[];
  gonderim_zamani: string;
  durum: 'bekliyor' | 'tamamlandi' | 'iptal_edildi' | 'hata';
  olusturma_tarihi: string;
}

export default function ZamanlanmisMesajlar() {
  const [aramaMetni, setAramaMetni] = React.useState('');
  const [durumFiltresi, setDurumFiltresi] = React.useState<string>('hepsi');
  const [detayAcik, setDetayAcik] = React.useState(false);
  const [seciliMesaj, setSeciliMesaj] = React.useState<ZamanlanmisMesaj | null>(null);

  const { data: mesajlar = [], isLoading } = useQuery({
    queryKey: ['zamanlanmis-mesajlar'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3001/api/mesajlar/zamanlanmis');
      return data;
    }
  });

  const durumRenkleri = {
    bekliyor: {
      bg: 'bg-warning/10',
      text: 'text-warning',
      label: 'Bekliyor'
    },
    tamamlandi: {
      bg: 'bg-success/10',
      text: 'text-success',
      label: 'Tamamlandı'
    },
    iptal_edildi: {
      bg: 'bg-gray-100 dark:bg-dark-surface',
      text: 'text-gray-600 dark:text-dark-text-soft',
      label: 'İptal Edildi'
    },
    hata: {
      bg: 'bg-error/10',
      text: 'text-error',
      label: 'Hata'
    }
  };

  const filtrelenenMesajlar = mesajlar.filter((mesaj: ZamanlanmisMesaj) => {
    const aramaUyumu = mesaj.sablon_baslik.toLowerCase().includes(aramaMetni.toLowerCase());
    const durumUyumu = durumFiltresi === 'hepsi' || mesaj.durum === durumFiltresi;
    return aramaUyumu && durumUyumu;
  });

  const handleDurumDegistir = async (id: number, yeniDurum: string) => {
    try {
      await axios.put(`http://localhost:3001/api/mesajlar/zamanlanmis/${id}/durum`, {
        durum: yeniDurum
      });
      toast.success('Mesaj durumu güncellendi');
    } catch (error) {
      toast.error('Durum güncellenirken bir hata oluştu');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Zamanlanmış Mesajlar
          </h1>
          <p className="text-gray-600 dark:text-dark-text-soft mt-1">
            İleri tarihli mesaj gönderimlerini yönetin
          </p>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-primary/10 text-primary">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Bekleyen</h3>
              <p className="text-2xl font-bold text-primary">
                {mesajlar.filter(m => m.durum === 'bekliyor').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-success/10 text-success">
              <MessageSquare size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Tamamlanan</h3>
              <p className="text-2xl font-bold text-success">
                {mesajlar.filter(m => m.durum === 'tamamlandi').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-warning/10 text-warning">
              <Pause size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">İptal Edilen</h3>
              <p className="text-2xl font-bold text-warning">
                {mesajlar.filter(m => m.durum === 'iptal_edildi').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-error/10 text-error">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Hatalı</h3>
              <p className="text-2xl font-bold text-error">
                {mesajlar.filter(m => m.durum === 'hata').length}
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
              placeholder="Mesajlarda ara..."
              value={aramaMetni}
              onChange={(e) => setAramaMetni(e.target.value)}
              className="input pl-10 w-full"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={durumFiltresi}
              onChange={(e) => setDurumFiltresi(e.target.value)}
              className="input"
            >
              <option value="hepsi">Tüm Durumlar</option>
              <option value="bekliyor">Bekliyor</option>
              <option value="tamamlandi">Tamamlandı</option>
              <option value="iptal_edildi">İptal Edildi</option>
              <option value="hata">Hata</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mesaj Listesi */}
      {isLoading ? (
        <div className="card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-dark-text-soft">Zamanlanmış mesajlar yükleniyor...</p>
        </div>
      ) : filtrelenenMesajlar.length === 0 ? (
        <div className="card p-8 text-center">
          <Clock className="w-16 h-16 text-gray-400 dark:text-dark-text-soft mx-auto mb-4 animate-float" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-dark-text mb-2">
            Zamanlanmış Mesaj Bulunamadı
          </h2>
          <p className="text-gray-500 dark:text-dark-text-soft">
            Henüz zamanlanmış bir mesaj bulunmuyor.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtrelenenMesajlar.map((mesaj: ZamanlanmisMesaj) => (
            <div key={mesaj.id} className="card p-6 group hover:scale-[1.02] transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${durumRenkleri[mesaj.durum].bg} ${durumRenkleri[mesaj.durum].text}
                  `}>
                    {durumRenkleri[mesaj.durum].label}
                  </span>
                  <h3 className="font-semibold mt-2">{mesaj.sablon_baslik}</h3>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {mesaj.durum === 'bekliyor' && (
                    <>
                      <button
                        onClick={() => {
                          setSeciliMesaj(mesaj);
                          setDetayAcik(true);
                        }}
                        className="p-2 glass-button rounded-xl"
                        title="Düzenle"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDurumDegistir(mesaj.id, 'iptal_edildi')}
                        className="p-2 glass-button rounded-xl text-warning"
                        title="Durdur"
                      >
                        <Pause size={18} />
                      </button>
                    </>
                  )}
                  {mesaj.durum === 'iptal_edildi' && (
                    <button
                      onClick={() => handleDurumDegistir(mesaj.id, 'bekliyor')}
                      className="p-2 glass-button rounded-xl text-success"
                      title="Yeniden Başlat"
                    >
                      <Play size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => {/* Silme işlemi */}}
                    className="p-2 glass-button rounded-xl text-error"
                    title="Sil"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-text-soft">
                  <Calendar size={16} />
                  <span>Gönderim: {new Date(mesaj.gonderim_zamani).toLocaleString()}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-text-soft">
                  <Bot size={16} />
                  <span>{mesaj.bot_ids.length} bot seçili</span>
                </div>

                <div className="text-xs text-gray-400 dark:text-dark-text-soft">
                  Oluşturulma: {new Date(mesaj.olusturma_tarihi).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detay Modal */}
      <AnimatePresence>
        {detayAcik && seciliMesaj && (
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
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Mesaj Detayları</h3>
                    <button
                      onClick={() => setDetayAcik(false)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-dark-surface rounded-xl"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Gönderim Zamanı
                    </label>
                    <input
                      type="datetime-local"
                      value={seciliMesaj.gonderim_zamani.slice(0, 16)}
                      className="input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Durum
                    </label>
                    <select className="input w-full">
                      <option value="bekliyor">Bekliyor</option>
                      <option value="iptal_edildi">İptal Edildi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5">
                      Bot Listesi
                    </label>
                    <div className="space-y-2">
                      {seciliMesaj.bot_ids.map((botId) => (
                        <div key={botId} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-dark-surface rounded-lg">
                          <Bot size={16} className="text-gray-400" />
                          <span className="text-sm">Bot #{botId}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-6 border-t dark:border-dark-surface space-y-2">
                  <button className="button-primary w-full">
                    Değişiklikleri Kaydet
                  </button>
                  <button className="button-secondary w-full">
                    İptal Et
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