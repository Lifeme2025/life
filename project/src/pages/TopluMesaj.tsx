import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Send, Users, Bot, Clock, MessageSquare, AlertTriangle, Search, Filter, Eye, EyeOff, Calendar, Image, Link, List, Plus, X } from 'lucide-react';
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
}

export default function TopluMesaj() {
  const [seciliSablon, setSeciliSablon] = React.useState<number | null>(null);
  const [seciliBotlar, setSeciliBotlar] = React.useState<number[]>([]);
  const [zamanlanmis, setZamanlanmis] = React.useState(false);
  const [gonderimZamani, setGonderimZamani] = React.useState('');
  const [onizleme, setOnizleme] = React.useState(false);
  const [aramaMetni, setAramaMetni] = React.useState('');
  const [sablonAramaMetni, setSablonAramaMetni] = React.useState('');
  const [botFiltresi, setBotFiltresi] = React.useState<string>('hepsi');

  const { data: sablonlar = [] } = useQuery({
    queryKey: ['mesaj-sablonlari'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3001/api/mesaj-sablonlari');
      return data;
    }
  });

  const { data: botlar = [] } = useQuery({
    queryKey: ['botlar'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3001/api/bots');
      return data;
    }
  });

  const seciliSablonDetay = sablonlar.find((s: MesajSablonu) => s.id === seciliSablon);

  const filtrelenmisTemplates = sablonlar.filter((sablon: MesajSablonu) => 
    sablon.baslik.toLowerCase().includes(sablonAramaMetni.toLowerCase()) ||
    sablon.icerik.toLowerCase().includes(sablonAramaMetni.toLowerCase())
  );

  const filtrelenenBotlar = botlar.filter((bot: any) => {
    const aramaUyumu = bot.isim.toLowerCase().includes(aramaMetni.toLowerCase());
    const durumUyumu = botFiltresi === 'hepsi' || 
      (botFiltresi === 'aktif' && bot.aktif) || 
      (botFiltresi === 'pasif' && !bot.aktif);
    return aramaUyumu && durumUyumu;
  });

  const handleGonder = async () => {
    if (!seciliSablon || seciliBotlar.length === 0) {
      toast.error('Lütfen şablon ve en az bir bot seçin');
      return;
    }

    if (zamanlanmis && !gonderimZamani) {
      toast.error('Lütfen gönderim zamanı seçin');
      return;
    }

    try {
      await axios.post('http://localhost:3001/api/mesajlar/toplu-gonder', {
        sablon_id: seciliSablon,
        bot_ids: seciliBotlar,
        zamanlanmis,
        gonderim_zamani: zamanlanmis ? gonderimZamani : null
      });
      
      toast.success(zamanlanmis ? 'Mesaj zamanlandı' : 'Mesaj gönderimi başlatıldı');
    } catch (error) {
      toast.error('Mesaj gönderilemedi');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Toplu Mesaj Gönderimi
          </h1>
          <p className="text-gray-600 dark:text-dark-text-soft mt-1">
            Birden fazla bota aynı anda mesaj gönderin
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Şablon Seçimi */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="text-primary" />
              Mesaj Şablonu
            </h2>

            <div className="space-y-4">
              {/* Şablon Arama */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Şablonlarda ara..."
                  value={sablonAramaMetni}
                  onChange={(e) => setSablonAramaMetni(e.target.value)}
                  className="input pl-10 w-full"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              </div>

              {/* Şablon Listesi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-2">
                {filtrelenmisTemplates.map((sablon: MesajSablonu) => (
                  <div
                    key={sablon.id}
                    onClick={() => setSeciliSablon(sablon.id)}
                    className={`
                      p-4 rounded-xl cursor-pointer transition-all
                      ${seciliSablon === sablon.id 
                        ? 'bg-primary/10 dark:bg-primary/20 border-2 border-primary'
                        : 'bg-gray-50 dark:bg-dark-surface hover:bg-gray-100 dark:hover:bg-dark-surface-soft border-2 border-transparent'
                      }
                    `}
                  >
                    <h3 className="font-medium mb-2">{sablon.baslik}</h3>
                    <p className="text-sm text-gray-600 dark:text-dark-text-soft line-clamp-2">
                      {sablon.icerik}
                    </p>
                    {sablon.medya_tipleri.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {sablon.medya_tipleri.map((tip, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 dark:bg-dark-surface-soft text-gray-600 dark:text-dark-text-soft rounded text-xs"
                          >
                            {tip}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bot Seçimi */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bot className="text-primary" />
              Bot Seçimi
            </h2>

            <div className="space-y-4">
              {/* Filtreler */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Bot ara..."
                    value={aramaMetni}
                    onChange={(e) => setAramaMetni(e.target.value)}
                    className="input pl-10 w-full"
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
                </div>
                <select
                  value={botFiltresi}
                  onChange={(e) => setBotFiltresi(e.target.value)}
                  className="input w-40"
                >
                  <option value="hepsi">Tüm Botlar</option>
                  <option value="aktif">Aktif</option>
                  <option value="pasif">Pasif</option>
                </select>
              </div>

              {/* Tümünü Seç */}
              <div className="flex items-center gap-2 p-3 bg-primary/10 dark:bg-primary/20 rounded-xl">
                <input
                  type="checkbox"
                  checked={seciliBotlar.length === botlar.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSeciliBotlar(botlar.map((bot: any) => bot.id));
                    } else {
                      setSeciliBotlar([]);
                    }
                  }}
                  className="rounded text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-primary">Tümünü Seç</span>
              </div>

              {/* Bot Listesi */}
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2">
                {filtrelenenBotlar.map((bot: any) => (
                  <label
                    key={bot.id}
                    className={`
                      flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all
                      ${seciliBotlar.includes(bot.id)
                        ? 'bg-primary/10 dark:bg-primary/20'
                        : 'bg-gray-50 dark:bg-dark-surface hover:bg-gray-100 dark:hover:bg-dark-surface-soft'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={seciliBotlar.includes(bot.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSeciliBotlar([...seciliBotlar, bot.id]);
                        } else {
                          setSeciliBotlar(seciliBotlar.filter(id => id !== bot.id));
                        }
                      }}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="text-sm font-medium">{bot.isim}</span>
                      <span className={`
                        ml-2 px-1.5 py-0.5 rounded text-xs
                        ${bot.aktif 
                          ? 'bg-success/10 text-success' 
                          : 'bg-gray-100 dark:bg-dark-surface-soft text-gray-600 dark:text-dark-text-soft'
                        }
                      `}>
                        {bot.aktif ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Zamanlanmış Gönderim */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="text-primary" />
              Gönderim Zamanı
            </h2>

            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={zamanlanmis}
                  onChange={(e) => setZamanlanmis(e.target.checked)}
                  className="rounded text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium">Zamanlanmış Gönderim</span>
              </label>

              {zamanlanmis && (
                <input
                  type="datetime-local"
                  value={gonderimZamani}
                  onChange={(e) => setGonderimZamani(e.target.value)}
                  className="input w-full"
                  min={new Date().toISOString().slice(0, 16)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Sağ Panel - Özet */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Gönderim Özeti</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 dark:bg-primary/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <Bot className="text-primary" size={24} />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-dark-text-soft">Seçili Bot</p>
                    <p className="text-lg font-semibold text-primary">{seciliBotlar.length}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-success/10 dark:bg-success/20 rounded-xl">
                <div className="flex items-center gap-3">
                  <Users className="text-success" size={24} />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-dark-text-soft">Tahmini Alıcı</p>
                    <p className="text-lg font-semibold text-success">
                      {botlar
                        .filter((bot: any) => seciliBotlar.includes(bot.id))
                        .reduce((acc: number, bot: any) => acc + (bot.kullanici_sayisi || 0), 0)
                      }
                    </p>
                  </div>
                </div>
              </div>

              {zamanlanmis && gonderimZamani && (
                <div className="p-4 bg-accent/10 dark:bg-accent/20 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Clock className="text-accent" size={24} />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-dark-text-soft">Gönderim Zamanı</p>
                      <p className="text-lg font-semibold text-accent">
                        {new Date(gonderimZamani).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Önizleme */}
              {seciliSablonDetay && (
                <div className="border dark:border-dark-surface rounded-xl p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Mesaj Önizleme</h3>
                    <button
                      onClick={() => setOnizleme(!onizleme)}
                      className="text-sm text-primary hover:underline"
                    >
                      {onizleme ? (
                        <span className="flex items-center gap-1">
                          <EyeOff size={16} />
                          Gizle
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Eye size={16} />
                          Göster
                        </span>
                      )}
                    </button>
                  </div>

                  {onizleme && (
                    <div className="space-y-4">
                      <p className="text-gray-600 dark:text-dark-text-soft whitespace-pre-wrap">
                        {seciliSablonDetay.icerik}
                      </p>

                      {seciliSablonDetay.medya_urls?.length > 0 && (
                        <div className="flex gap-2">
                          {seciliSablonDetay.medya_urls.map((url: string, index: number) => (
                            <img
                              key={index}
                              src={url}
                              alt="Medya"
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}

                      {seciliSablonDetay.butonlar?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {seciliSablonDetay.butonlar.map((buton, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-dark-text-soft rounded-full text-sm"
                            >
                              {buton.text}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Uyarılar */}
              {seciliBotlar.length > 0 && (
                <div className="p-4 bg-warning/10 dark:bg-warning/20 rounded-xl">
                  <div className="flex gap-3">
                    <AlertTriangle className="text-warning flex-shrink-0" size={24} />
                    <div>
                      <p className="text-sm text-warning font-medium">Önemli Bilgi</p>
                      <p className="text-sm text-warning/90 mt-1">
                        Mesaj {botlar
                          .filter((bot: any) => seciliBotlar.includes(bot.id))
                          .reduce((acc: number, bot: any) => acc + (bot.kullanici_sayisi || 0), 0)
                        } kullanıcıya gönderilecek. Bu işlem geri alınamaz.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleGonder}
                disabled={!seciliSablon || seciliBotlar.length === 0}
                className="button-primary w-full"
              >
                <Send size={20} />
                {zamanlanmis ? 'Zamanla' : 'Gönder'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}