import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Bot, Users, MessageSquare, Activity } from 'lucide-react';
import { getBots } from '../api/bots';
import BotCard from './BotCard';
import BotEkleModal from './BotEkleModal';
import BotConfigModal from './BotConfigModal';

export default function Panel() {
  const [modalAcik, setModalAcik] = React.useState(false);
  const [configModal, setConfigModal] = React.useState({ open: false, bot: null });
  
  const { data: botlar = [], isLoading, isError } = useQuery({
    queryKey: ['botlar'],
    queryFn: getBots,
    refetchInterval: 5000
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Bot Yönetim Paneli
          </h1>
          <p className="text-gray-600 dark:text-dark-text-soft mt-1">
            Telegram botlarınızı tek bir yerden yönetin
          </p>
        </div>

        <button
          onClick={() => setModalAcik(true)}
          className="button-primary"
        >
          <Plus size={20} className="mr-2" />
          Yeni Bot Ekle
        </button>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-primary/10 text-primary">
              <Bot size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Aktif Botlar</h3>
              <p className="text-2xl font-bold text-primary">
                {botlar?.filter(bot => bot.aktif).length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-success/10 text-success">
              <Users size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Toplam Kullanıcı</h3>
              <p className="text-2xl font-bold text-success">
                {botlar?.reduce((acc, bot) => acc + (bot.kullanici_sayisi || 0), 0) || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-accent/10 text-accent">
              <MessageSquare size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Günlük Mesaj</h3>
              <p className="text-2xl font-bold text-accent">
                {botlar?.reduce((acc, bot) => acc + (bot.gunluk_mesaj || 0), 0) || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-secondary/10 text-secondary">
              <Activity size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Yanıt Süresi</h3>
              <p className="text-2xl font-bold text-secondary">0.8s</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bot Listesi */}
      {isLoading ? (
        <div className="card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-dark-text-soft">Botlar yükleniyor...</p>
        </div>
      ) : isError ? (
        <div className="card p-8 text-center">
          <Activity className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-dark-text mb-2">
            Bağlantı Hatası
          </h2>
          <p className="text-gray-500 dark:text-dark-text-soft mb-4">
            Sunucuya bağlanılamıyor. Lütfen sunucunun çalıştığından emin olun.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="button-primary"
          >
            Yeniden Dene
          </button>
        </div>
      ) : botlar.length === 0 ? (
        <div className="card p-8 text-center">
          <Bot className="w-16 h-16 text-gray-400 dark:text-dark-text-soft mx-auto mb-4 animate-float" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-dark-text mb-2">
            Henüz Bot Bulunmuyor
          </h2>
          <p className="text-gray-500 dark:text-dark-text-soft mb-4">
            Yeni bir bot ekleyerek başlayabilirsiniz
          </p>
          <button
            onClick={() => setModalAcik(true)}
            className="button-primary"
          >
            <Plus size={20} className="mr-2" />
            Yeni Bot Ekle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {botlar.map(bot => (
            <BotCard 
              key={bot.id} 
              bot={bot} 
              onConfigureClick={(bot) => setConfigModal({ open: true, bot })}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <BotEkleModal
        acik={modalAcik}
        kapat={() => setModalAcik(false)}
      />

      {configModal.open && configModal.bot && (
        <BotConfigModal
          bot={configModal.bot}
          isOpen={configModal.open}
          onClose={() => setConfigModal({ open: false, bot: null })}
          onSave={async (config) => {
            try {
              await axios.put(`/api/bots/${configModal.bot.id}/config`, config);
              toast.success('Bot ayarları güncellendi');
              setConfigModal({ open: false, bot: null });
            } catch (error) {
              toast.error('Bot ayarları güncellenirken bir hata oluştu');
            }
          }}
        />
      )}
    </div>
  );
}