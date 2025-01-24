import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Bot, Upload, List, X, HelpCircle, AlertCircle } from 'lucide-react';
import { botEkle } from '../api/bots';

interface BotEkleModalProps {
  acik: boolean;
  kapat: () => void;
}

export default function BotEkleModal({ acik, kapat }: BotEkleModalProps) {
  const [isim, setIsim] = React.useState('');
  const [token, setToken] = React.useState('');
  const [mod, setMod] = React.useState<'tekli' | 'toplu'>('tekli');
  const [topluBotlar, setTopluBotlar] = React.useState('');
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: { isim: string; token: string }) => {
      return botEkle(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['botlar'] });
      toast.success('Bot başarıyla eklendi');
      setIsim('');
      setToken('');
      kapat();
    }
  });

  const { mutate: topluEkle, isPending: topluEkleniyor } = useMutation({
    mutationFn: async (botlar: Array<{ isim: string; token: string }>) => {
      const promises = botlar.map(bot => botEkle(bot));
      return Promise.all(promises);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['botlar'] });
      toast.success(`${data.length} bot başarıyla eklendi`);
      setTopluBotlar('');
      kapat();
    }
  });

  const handleTopluEkle = () => {
    try {
      const botlar = topluBotlar.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [isim, token] = line.split('|').map(s => s.trim());
          if (!isim || !token) throw new Error('Geçersiz format');
          return { isim, token };
        });

      if (botlar.length === 0) {
        toast.error('Eklenecek bot bulunamadı');
        return;
      }

      topluEkle(botlar);
    } catch (error) {
      toast.error('Geçersiz format. Her satır "isim|token" şeklinde olmalıdır');
    }
  };

  if (!acik) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={kapat} />

      {/* Modal */}
      <div className="relative w-full max-w-xl">
        <div className="card p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Bot Ekle
              </h2>
              <p className="text-gray-500 dark:text-dark-text-soft mt-1">
                Yeni bir Telegram botu ekleyin
              </p>
            </div>
            <button onClick={kapat} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-surface rounded-xl">
              <X size={20} />
            </button>
          </div>

          {/* Mode Selector */}
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-dark-surface rounded-xl">
            <button
              onClick={() => setMod('tekli')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm ${
                mod === 'tekli' 
                  ? 'bg-white dark:bg-dark-surface-soft shadow-sm' 
                  : 'text-gray-600 dark:text-dark-text-soft'
              }`}
            >
              <Bot size={18} />
              Tekli Ekle
            </button>
            <button
              onClick={() => setMod('toplu')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm ${
                mod === 'toplu' 
                  ? 'bg-white dark:bg-dark-surface-soft shadow-sm' 
                  : 'text-gray-600 dark:text-dark-text-soft'
              }`}
            >
              <List size={18} />
              Toplu Ekle
            </button>
          </div>

          {mod === 'tekli' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                mutate({ isim, token });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Bot İsmi
                </label>
                <input
                  type="text"
                  value={isim}
                  onChange={(e) => setIsim(e.target.value)}
                  className="input w-full"
                  placeholder="@ornekbot"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Bot Token
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="input w-full"
                  placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                  required
                />
                <div className="flex items-start gap-2 mt-2 text-xs text-gray-500 dark:text-dark-text-soft">
                  <HelpCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <p>
                    Bot token'ını @BotFather üzerinden alabilirsiniz. 
                    Örnek format: <code className="px-1 py-0.5 bg-gray-100 dark:bg-dark-surface rounded">123456:ABC-DEF1234ghIkl</code>
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={kapat}
                  className="px-4 py-2 text-gray-700 dark:text-dark-text-soft hover:bg-gray-100 dark:hover:bg-dark-surface rounded-xl"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="button-primary"
                >
                  {isPending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Bot size={18} />
                      Bot Ekle
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Botları Girin
                </label>
                <div className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg mb-2">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <p className="text-xs">Her satıra bir bot gelecek şekilde "botismi|bottoken" formatında girin</p>
                </div>
                <textarea
                  value={topluBotlar}
                  onChange={(e) => setTopluBotlar(e.target.value)}
                  className="input w-full h-48 font-mono text-sm"
                  placeholder="@bot1|123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11&#10;@bot2|123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew12"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={kapat}
                  className="px-4 py-2 text-gray-700 dark:text-dark-text-soft hover:bg-gray-100 dark:hover:bg-dark-surface rounded-xl"
                >
                  İptal
                </button>
                <button
                  onClick={handleTopluEkle}
                  disabled={topluEkleniyor || !topluBotlar.trim()}
                  className="button-primary"
                >
                  {topluEkleniyor ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Upload size={18} />
                      Toplu Ekle
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}