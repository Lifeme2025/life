import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookTemplate as Template, Plus, Edit2, Trash2, Copy, Image, Link, List, Search, Filter, Bot, MessageSquare, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface MesajSablonu {
  id: number;
  baslik: string;
  icerik: string;
  medya_tipleri: string[];
  medya_urls: string[];
  butonlar: Array<{
    text: string;
    url?: string;
    callback_data?: string;
  }>;
  olusturma_tarihi: string;
  son_guncelleme: string;
}

export default function MesajSablonlari() {
  const [modalAcik, setModalAcik] = React.useState(false);
  const [seciliSablon, setSeciliSablon] = React.useState<MesajSablonu | null>(null);
  const [aramaMetni, setAramaMetni] = React.useState('');
  const [medyaOnizleme, setMedyaOnizleme] = React.useState<string | null>(null);
  const [butonlar, setButonlar] = React.useState<Array<{ text: string; url?: string; callback_data?: string }>>([]);

  const { data: sablonlar = [], isLoading } = useQuery({
    queryKey: ['mesaj-sablonlari'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3001/api/mesaj-sablonlari');
      return data;
    }
  });

  const filtrelenmisTemplates = sablonlar.filter((sablon: MesajSablonu) => 
    sablon.baslik.toLowerCase().includes(aramaMetni.toLowerCase()) ||
    sablon.icerik.toLowerCase().includes(aramaMetni.toLowerCase())
  );

  const handleButonEkle = () => {
    setButonlar([...butonlar, { text: '', url: '' }]);
  };

  const handleButonSil = (index: number) => {
    setButonlar(butonlar.filter((_, i) => i !== index));
  };

  const handleButonGuncelle = (index: number, field: 'text' | 'url' | 'callback_data', value: string) => {
    const yeniButonlar = [...butonlar];
    yeniButonlar[index] = { ...yeniButonlar[index], [field]: value };
    setButonlar(yeniButonlar);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Mesaj Şablonları
          </h1>
          <p className="text-gray-600 dark:text-dark-text-soft mt-1">
            Özelleştirilebilir mesaj şablonları oluşturun ve yönetin
          </p>
        </div>
        <button
          onClick={() => {
            setSeciliSablon(null);
            setModalAcik(true);
          }}
          className="button-primary"
        >
          <Plus size={20} className="mr-2" />
          Yeni Şablon
        </button>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-primary/10 text-primary">
              <Template size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Toplam Şablon</h3>
              <p className="text-2xl font-bold text-primary">{sablonlar.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-success/10 text-success">
              <Bot size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Kullanılan Bot</h3>
              <p className="text-2xl font-bold text-success">12</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-accent/10 text-accent">
              <MessageSquare size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Gönderim</h3>
              <p className="text-2xl font-bold text-accent">1.2K</p>
            </div>
          </div>
        </div>
      </div>

      {/* Arama ve Filtreler */}
      <div className="card p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Şablonlarda ara..."
              value={aramaMetni}
              onChange={(e) => setAramaMetni(e.target.value)}
              className="input pl-10 w-full"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
        </div>
      </div>

      {/* Şablon Listesi */}
      {isLoading ? (
        <div className="card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-dark-text-soft">Şablonlar yükleniyor...</p>
        </div>
      ) : filtrelenmisTemplates.length === 0 ? (
        <div className="card p-8 text-center">
          <Template className="w-16 h-16 text-gray-400 dark:text-dark-text-soft mx-auto mb-4 animate-float" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-dark-text mb-2">
            Şablon Bulunamadı
          </h2>
          <p className="text-gray-500 dark:text-dark-text-soft mb-4">
            Henüz bir mesaj şablonu oluşturmamışsınız
          </p>
          <button
            onClick={() => setModalAcik(true)}
            className="button-primary"
          >
            <Plus size={20} className="mr-2" />
            Yeni Şablon
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtrelenmisTemplates.map((sablon: MesajSablonu) => (
            <div key={sablon.id} className="card p-6 group hover:scale-[1.02] transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg">{sablon.baslik}</h3>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setSeciliSablon(sablon);
                      setModalAcik(true);
                    }}
                    className="p-2 glass-button rounded-xl"
                    title="Düzenle"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => {/* Kopyalama işlemi */}}
                    className="p-2 glass-button rounded-xl"
                    title="Kopyala"
                  >
                    <Copy size={18} />
                  </button>
                  <button
                    onClick={() => {/* Silme işlemi */}}
                    className="p-2 glass-button rounded-xl text-error"
                    title="Sil"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600 dark:text-dark-text-soft line-clamp-3">
                  {sablon.icerik}
                </p>

                {sablon.medya_tipleri.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {sablon.medya_tipleri.map((tip, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-dark-text-soft rounded-lg text-xs"
                      >
                        {tip}
                      </span>
                    ))}
                  </div>
                )}

                {sablon.butonlar.length > 0 && (
                  <div className="border-t dark:border-dark-surface pt-4">
                    <p className="text-sm text-gray-500 dark:text-dark-text-soft mb-2">Butonlar:</p>
                    <div className="flex flex-wrap gap-2">
                      {sablon.butonlar.map((buton, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-primary/10 text-primary dark:text-primary-light rounded-full text-sm"
                        >
                          {buton.text}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500 dark:text-dark-text-soft">
                  Son güncelleme: {new Date(sablon.son_guncelleme).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Şablon Ekleme/Düzenleme Modal */}
      <AnimatePresence>
        {modalAcik && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setModalAcik(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-6 z-50 overflow-y-auto"
            >
              <div className="min-h-full flex items-center justify-center p-4">
                <div className="card w-full max-w-4xl">
                  <div className="p-6 border-b dark:border-dark-surface">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">
                        {seciliSablon ? 'Şablon Düzenle' : 'Yeni Şablon'}
                      </h2>
                      <button
                        onClick={() => setModalAcik(false)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-dark-surface rounded-xl"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        Şablon Başlığı
                      </label>
                      <input
                        type="text"
                        className="input w-full"
                        placeholder="Şablon başlığı"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        Mesaj İçeriği
                      </label>
                      <textarea
                        className="input w-full h-32"
                        placeholder="Mesaj içeriği..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        Medya
                      </label>
                      <div className="border-2 border-dashed dark:border-dark-surface rounded-xl p-8 text-center">
                        <div className="flex flex-col items-center">
                          <Image size={32} className="text-gray-400 dark:text-dark-text-soft mb-2" />
                          <p className="text-gray-500 dark:text-dark-text-soft mb-4">
                            Medya dosyalarını buraya sürükleyin veya seçin
                          </p>
                          <button className="button-secondary">
                            Dosya Seç
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        Butonlar
                      </label>
                      <div className="space-y-3">
                        {butonlar.map((buton, index) => (
                          <div key={index} className="flex gap-3">
                            <input
                              type="text"
                              value={buton.text}
                              onChange={(e) => handleButonGuncelle(index, 'text', e.target.value)}
                              className="input flex-1"
                              placeholder="Buton metni"
                            />
                            <select
                              className="input w-32"
                              onChange={(e) => {
                                if (e.target.value === 'url') {
                                  handleButonGuncelle(index, 'url', '');
                                  handleButonGuncelle(index, 'callback_data', '');
                                } else {
                                  handleButonGuncelle(index, 'callback_data', '');
                                  handleButonGuncelle(index, 'url', '');
                                }
                              }}
                            >
                              <option value="url">URL</option>
                              <option value="callback">Callback</option>
                            </select>
                            <input
                              type="text"
                              value={buton.url || buton.callback_data || ''}
                              onChange={(e) => handleButonGuncelle(index, buton.url ? 'url' : 'callback_data', e.target.value)}
                              className="input flex-1"
                              placeholder={buton.url ? 'https://example.com' : 'callback_data'}
                            />
                            <button
                              onClick={() => handleButonSil(index)}
                              className="p-2 glass-button rounded-xl text-error"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={handleButonEkle}
                          className="button-secondary w-full"
                        >
                          <Plus size={18} className="mr-2" />
                          Buton Ekle
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-6 border-t dark:border-dark-surface">
                      <button
                        onClick={() => setModalAcik(false)}
                        className="button-secondary"
                      >
                        İptal
                      </button>
                      <button
                        onClick={() => {
                          setModalAcik(false);
                        }}
                        className="button-primary"
                      >
                        {seciliSablon ? 'Güncelle' : 'Oluştur'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Medya Önizleme Modal */}
      <AnimatePresence>
        {medyaOnizleme && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setMedyaOnizleme(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="relative max-w-4xl max-h-[90vh]">
                <img
                  src={medyaOnizleme}
                  alt="Medya önizleme"
                  className="rounded-xl shadow-2xl"
                />
                <button
                  onClick={() => setMedyaOnizleme(null)}
                  className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/75 text-white rounded-xl"
                >
                  <X size={20} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}