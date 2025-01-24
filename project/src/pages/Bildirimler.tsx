import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, Settings, Trash2, Check, X } from 'lucide-react';
import axios from 'axios';

interface Bildirim {
  id: number;
  baslik: string;
  mesaj: string;
  tip: 'bilgi' | 'uyari' | 'hata' | 'basari';
  tarih: string;
  okundu: boolean;
}

interface BildirimAyarlari {
  email_bildirim: boolean;
  telegram_bildirim: boolean;
  web_bildirim: boolean;
  bildirim_tipleri: {
    sistem: boolean;
    guvenlik: boolean;
    bot: boolean;
    performans: boolean;
  };
}

export default function Bildirimler() {
  const [ayarlarAcik, setAyarlarAcik] = React.useState(false);
  const [ayarlar, setAyarlar] = React.useState<BildirimAyarlari | null>(null);

  const { data: bildirimler = [], isLoading, refetch } = useQuery<Bildirim[]>({
    queryKey: ['bildirimler'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3001/api/bildirimler');
      return data;
    }
  });

  const { data: bildirimAyarlari } = useQuery<BildirimAyarlari>({
    queryKey: ['bildirim-ayarlari'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3001/api/bildirimler/ayarlar');
      return data;
    },
    onSuccess: (data) => setAyarlar(data)
  });

  const bildirimOku = async (id: number) => {
    try {
      await axios.put(`http://localhost:3001/api/bildirimler/${id}/oku`);
      refetch();
    } catch (error) {
      toast.error('Bildirim durumu güncellenirken bir hata oluştu');
    }
  };

  const bildirimSil = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3001/api/bildirimler/${id}`);
      refetch();
      toast.success('Bildirim silindi');
    } catch (error) {
      toast.error('Bildirim silinirken bir hata oluştu');
    }
  };

  const tumBildirimleriOku = async () => {
    try {
      await axios.put('http://localhost:3001/api/bildirimler/toplu-oku');
      refetch();
      toast.success('Tüm bildirimler okundu olarak işaretlendi');
    } catch (error) {
      toast.error('Bildirimler güncellenirken bir hata oluştu');
    }
  };

  const ayarlariKaydet = async () => {
    if (!ayarlar) return;

    try {
      await axios.put('http://localhost:3001/api/bildirimler/ayarlar', ayarlar);
      toast.success('Bildirim ayarları güncellendi');
      setAyarlarAcik(false);
    } catch (error) {
      toast.error('Ayarlar kaydedilirken bir hata oluştu');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bildirimler</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setAyarlarAcik(true)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Settings size={20} />
            Ayarlar
          </button>
          <button
            onClick={tumBildirimleriOku}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Check size={20} />
            Tümünü Okundu İşaretle
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Bildirimler yükleniyor...</p>
        </div>
      ) : bildirimler.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Bildirim Bulunmuyor
          </h2>
          <p className="text-gray-500">
            Henüz okunmamış bildiriminiz yok.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bildirimler.map((bildirim) => (
            <div
              key={bildirim.id}
              className={`bg-white rounded-lg p-4 shadow-sm border-l-4 ${
                bildirim.tip === 'hata'
                  ? 'border-red-500'
                  : bildirim.tip === 'uyari'
                  ? 'border-yellow-500'
                  : bildirim.tip === 'basari'
                  ? 'border-green-500'
                  : 'border-blue-500'
              } ${!bildirim.okundu && 'bg-blue-50'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{bildirim.baslik}</h3>
                  <p className="text-gray-600 mt-1">{bildirim.mesaj}</p>
                  <span className="text-sm text-gray-500 mt-2 block">
                    {new Date(bildirim.tarih).toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  {!bildirim.okundu && (
                    <button
                      onClick={() => bildirimOku(bildirim.id)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Okundu İşaretle"
                    >
                      <Check size={18} className="text-green-500" />
                    </button>
                  )}
                  <button
                    onClick={() => bildirimSil(bildirim.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Sil"
                  >
                    <Trash2 size={18} className="text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bildirim Ayarları Modal */}
      {ayarlarAcik && ayarlar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Bildirim Ayarları</h2>
              <button
                onClick={() => setAyarlarAcik(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Bildirim Kanalları</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={ayarlar.email_bildirim}
                      onChange={(e) => setAyarlar({
                        ...ayarlar,
                        email_bildirim: e.target.checked
                      })}
                      className="rounded"
                    />
                    E-posta Bildirimleri
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={ayarlar.telegram_bildirim}
                      onChange={(e) => setAyarlar({
                        ...ayarlar,
                        telegram_bildirim: e.target.checked
                      })}
                      className="rounded"
                    />
                    Telegram Bildirimleri
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={ayarlar.web_bildirim}
                      onChange={(e) => setAyarlar({
                        ...ayarlar,
                        web_bildirim: e.target.checked
                      })}
                      className="rounded"
                    />
                    Web Bildirimleri
                  </label>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Bildirim Tipleri</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={ayarlar.bildirim_tipleri.sistem}
                      onChange={(e) => setAyarlar({
                        ...ayarlar,
                        bildirim_tipleri: {
                          ...ayarlar.bildirim_tipleri,
                          sistem: e.target.checked
                        }
                      })}
                      className="rounded"
                    />
                    Sistem Bildirimleri
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={ayarlar.bildirim_tipleri.guvenlik}
                      onChange={(e) => setAyarlar({
                        ...ayarlar,
                        bildirim_tipleri: {
                          ...ayarlar.bildirim_tipleri,
                          guvenlik: e.target.checked
                        }
                      })}
                      className="rounded"
                    />
                    Güvenlik Bildirimleri
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={ayarlar.bildirim_tipleri.bot}
                      onChange={(e) => setAyarlar({
                        ...ayarlar,
                        bildirim_tipleri: {
                          ...ayarlar.bildirim_tipleri,
                          bot: e.target.checked
                        }
                      })}
                      className="rounded"
                    />
                    Bot Bildirimleri
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={ayarlar.bildirim_tipleri.performans}
                      onChange={(e) => setAyarlar({
                        ...ayarlar,
                        bildirim_tipleri: {
                          ...ayarlar.bildirim_tipleri,
                          performans: e.target.checked
                        }
                      })}
                      className="rounded"
                    />
                    Performans Bildirimleri
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setAyarlarAcik(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  İptal
                </button>
                <button
                  onClick={ayarlariKaydet}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}