import React from 'react';
import { MessageCircle, Plus, Edit2, Trash2, Bot, Sparkles, Brain, Zap, Search, Filter, X } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Prompt {
  id: number;
  baslik: string;
  icerik: string;
  bot_id: number;
  bot_isim: string;
  aktif: boolean;
  olusturma_tarihi: string;
  son_guncelleme: string;
  performans_skoru?: number;
  kullanim_sayisi?: number;
}

export default function Prompts() {
  const [modalAcik, setModalAcik] = React.useState(false);
  const [seciliPrompt, setSeciliPrompt] = React.useState<Prompt | null>(null);
  const [aramaMetni, setAramaMetni] = React.useState('');
  const [durumFiltresi, setDurumFiltresi] = React.useState<string>('hepsi');

  const { data: prompts = [], isLoading } = useQuery({
    queryKey: ['prompts'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3001/api/prompts');
      return data;
    }
  });

  const filtrelenenPrompts = prompts.filter((prompt: Prompt) => {
    const aramaUyumu = 
      prompt.baslik.toLowerCase().includes(aramaMetni.toLowerCase()) ||
      prompt.icerik.toLowerCase().includes(aramaMetni.toLowerCase());
    
    const durumUyumu = durumFiltresi === 'hepsi' || 
      (durumFiltresi === 'aktif' && prompt.aktif) ||
      (durumFiltresi === 'pasif' && !prompt.aktif);
    
    return aramaUyumu && durumUyumu;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            AI Prompts
          </h1>
          <p className="text-gray-600 dark:text-dark-text-soft mt-1">
            Bot kişiliklerini ve davranışlarını özelleştirin
          </p>
        </div>
        <button
          onClick={() => {
            setSeciliPrompt(null);
            setModalAcik(true);
          }}
          className="button-primary"
        >
          <Plus size={20} className="mr-2" />
          Yeni Prompt
        </button>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-primary/10 text-primary">
              <MessageCircle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Toplam Prompt</h3>
              <p className="text-2xl font-bold text-primary">
                {prompts.length}
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
              <h3 className="text-lg font-semibold">Aktif Bot</h3>
              <p className="text-2xl font-bold text-success">
                {prompts.filter(p => p.aktif).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-accent/10 text-accent">
              <Brain size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Ortalama Skor</h3>
              <p className="text-2xl font-bold text-accent">
                {(prompts.reduce((acc, p) => acc + (p.performans_skoru || 0), 0) / prompts.length || 0).toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-secondary/10 text-secondary">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Toplam Kullanım</h3>
              <p className="text-2xl font-bold text-secondary">
                {prompts.reduce((acc, p) => acc + (p.kullanim_sayisi || 0), 0)}
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
              placeholder="Promptlarda ara..."
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
              <option value="aktif">Aktif</option>
              <option value="pasif">Pasif</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prompt Listesi */}
      {isLoading ? (
        <div className="card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-dark-text-soft">Promptlar yükleniyor...</p>
        </div>
      ) : filtrelenenPrompts.length === 0 ? (
        <div className="card p-8 text-center">
          <Sparkles className="w-16 h-16 text-gray-400 dark:text-dark-text-soft mx-auto mb-4 animate-float" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-dark-text mb-2">
            Prompt Bulunamadı
          </h2>
          <p className="text-gray-500 dark:text-dark-text-soft mb-4">
            Henüz bir AI prompt tanımlanmamış
          </p>
          <button
            onClick={() => setModalAcik(true)}
            className="button-primary"
          >
            <Plus size={20} className="mr-2" />
            Yeni Prompt
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtrelenenPrompts.map((prompt: Prompt) => (
            <div key={prompt.id} className="card p-6 group hover:scale-[1.02] transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${prompt.aktif 
                      ? 'bg-success/10 text-success' 
                      : 'bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-dark-text-soft'
                    }
                  `}>
                    {prompt.aktif ? 'Aktif' : 'Pasif'}
                  </span>
                  <h3 className="font-semibold mt-2">{prompt.baslik}</h3>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setSeciliPrompt(prompt);
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
                  <Bot size={16} />
                  <span>{prompt.bot_isim}</span>
                </div>

                <p className="text-gray-600 dark:text-dark-text-soft line-clamp-3">
                  {prompt.icerik}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-accent">
                    <Brain size={16} />
                    <span>{prompt.performans_skoru?.toFixed(1) || 0} skor</span>
                  </div>
                  <div className="flex items-center gap-1 text-secondary">
                    <Zap size={16} />
                    <span>{prompt.kullanim_sayisi || 0} kullanım</span>
                  </div>
                </div>

                <div className="text-xs text-gray-400 dark:text-dark-text-soft">
                  Son güncelleme: {new Date(prompt.son_guncelleme).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Prompt Modal */}
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
                        {seciliPrompt ? 'Prompt Düzenle' : 'Yeni Prompt'}
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
                        {/* Bot listesi */}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        Prompt Başlığı
                      </label>
                      <input
                        type="text"
                        className="input w-full"
                        placeholder="Prompt başlığı"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        Prompt İçeriği
                      </label>
                      <textarea
                        className="input w-full h-48"
                        placeholder="Bot kişiliğini ve davranışlarını tanımlayan prompt..."
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
                        {seciliPrompt ? 'Güncelle' : 'Oluştur'}
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