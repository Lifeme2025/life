import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Radio, Plus, Edit2, Trash2, X, Globe, Bot, Activity, RefreshCw, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Webhook {
  id: number;
  bot_id: number;
  bot_isim: string;
  url: string;
  aktif: boolean;
  son_guncelleme: string;
  son_yanit_suresi?: number;
  basari_orani?: number;
}

export default function WebhookYonetimi() {
  const [modalAcik, setModalAcik] = React.useState(false);
  const [seciliWebhook, setSeciliWebhook] = React.useState<Webhook | null>(null);
  const [aramaMetni, setAramaMetni] = React.useState('');
  const [durumFiltresi, setDurumFiltresi] = React.useState<string>('hepsi');

  const { data: webhooks = [], isLoading } = useQuery({
    queryKey: ['webhooks'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3001/api/webhooks');
      return data;
    }
  });

  const filtrelenenWebhooks = webhooks.filter((webhook: Webhook) => {
    const aramaUyumu = 
      webhook.bot_isim.toLowerCase().includes(aramaMetni.toLowerCase()) ||
      webhook.url.toLowerCase().includes(aramaMetni.toLowerCase());
    
    const durumUyumu = durumFiltresi === 'hepsi' || 
      (durumFiltresi === 'aktif' && webhook.aktif) ||
      (durumFiltresi === 'pasif' && !webhook.aktif);
    
    return aramaUyumu && durumUyumu;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Webhook Yönetimi
          </h1>
          <p className="text-gray-600 dark:text-dark-text-soft mt-1">
            Bot webhook'larını yönetin ve izleyin
          </p>
        </div>
        <button
          onClick={() => {
            setSeciliWebhook(null);
            setModalAcik(true);
          }}
          className="button-primary"
        >
          <Plus size={20} className="mr-2" />
          Yeni Webhook
        </button>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-primary/10 text-primary">
              <Globe size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Toplam Webhook</h3>
              <p className="text-2xl font-bold text-primary">
                {webhooks.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-success/10 text-success">
              <Bot size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Aktif Webhook</h3>
              <p className="text-2xl font-bold text-success">
                {webhooks.filter(w => w.aktif).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-accent/10 text-accent">
              <Activity size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Ortalama Yanıt</h3>
              <p className="text-2xl font-bold text-accent">
                {(webhooks.reduce((acc, w) => acc + (w.son_yanit_suresi || 0), 0) / webhooks.length || 0).toFixed(2)}ms
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
              <h3 className="text-lg font-semibold">Başarı Oranı</h3>
              <p className="text-2xl font-bold text-secondary">
                {(webhooks.reduce((acc, w) => acc + (w.basari_orani || 0), 0) / webhooks.length || 0).toFixed(1)}%
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
              placeholder="Webhook ara..."
              value={aramaMetni}
              onChange={(e) => setAramaMetni(e.target.value)}
              className="input pl-10 w-full"
            />
            <LinkIcon className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          <select
            value={durumFiltresi}
            onChange={(e) => setDurumFiltresi(e.target.value)}
            className="input"
          >
            <option value="hepsi">Tüm Durumlar</option>
            <option value="aktif">Aktif</option>
            <option value="pasif">Pasif</option>
          </select>
        </div>
      </div>

      {/* Webhook Listesi */}
      {isLoading ? (
        <div className="card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-dark-text-soft">Webhook'lar yükleniyor...</p>
        </div>
      ) : filtrelenenWebhooks.length === 0 ? (
        <div className="card p-8 text-center">
          <Globe className="w-16 h-16 text-gray-400 dark:text-dark-text-soft mx-auto mb-4 animate-float" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-dark-text mb-2">
            Webhook Bulunamadı
          </h2>
          <p className="text-gray-500 dark:text-dark-text-soft mb-4">
            Henüz bir webhook tanımlanmamış
          </p>
          <button
            onClick={() => setModalAcik(true)}
            className="button-primary"
          >
            <Plus size={20} className="mr-2" />
            Yeni Webhook
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtrelenenWebhooks.map((webhook: Webhook) => (
            <div key={webhook.id} className="card p-6 group hover:scale-[1.02] transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${webhook.aktif 
                      ? 'bg-success/10 text-success' 
                      : 'bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-dark-text-soft'
                    }
                  `}>
                    {webhook.aktif ? 'Aktif' : 'Pasif'}
                  </span>
                  <h3 className="font-semibold mt-2">{webhook.bot_isim}</h3>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setSeciliWebhook(webhook);
                      setModalAcik(true);
                    }}
                    className="p-2 glass-button rounded-xl"
                    title="Düzenle"
                  >
                    <Edit2 size={18} />
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

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-text-soft">
                  <Globe size={16} />
                  <span className="truncate">{webhook.url}</span>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Activity size={16} className="text-accent" />
                    <span>{webhook.son_yanit_suresi}ms</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <RefreshCw size={16} className="text-secondary" />
                    <span>{webhook.basari_orani}%</span>
                  </div>
                </div>

                {webhook.son_yanit_suresi && webhook.son_yanit_suresi > 1000 && (
                  <div className="flex items-center gap-2 p-2 bg-warning/10 text-warning rounded-lg text-sm">
                    <AlertTriangle size={16} />
                    <span>Yüksek yanıt süresi</span>
                  </div>
                )}

                <div className="text-xs text-gray-400 dark:text-dark-text-soft">
                  Son güncelleme: {new Date(webhook.son_guncelleme).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Webhook Modal */}
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
                <div className="card w-full max-w-2xl">
                  <div className="p-6 border-b dark:border-dark-surface">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">
                        {seciliWebhook ? 'Webhook Düzenle' : 'Yeni Webhook'}
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
                        Bot
                      </label>
                      <select className="input w-full">
                        <option value="">Bot seçin...</option>
                        {webhooks.map((webhook: Webhook) => (
                          <option key={webhook.bot_id} value={webhook.bot_id}>
                            {webhook.bot_isim}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        Webhook URL
                      </label>
                      <input
                        type="url"
                        className="input w-full"
                        placeholder="https://example.com/webhook"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                        <span className="text-sm font-medium">Aktif</span>
                      </label>
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
                        {seciliWebhook ? 'Güncelle' : 'Oluştur'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}