import { Bot, Trash2, Power, Settings } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { botSil, botDurumDegistir } from '../api/bots';
import { useNotificationStore } from './NotificationCenter';

interface BotCardProps {
  bot: {
    id: number;
    isim: string;
    token: string;
    aktif: boolean;
    webhook_url?: string;
  };
  onConfigureClick: (bot: any) => void;
}

export default function BotCard({ bot, onConfigureClick }: BotCardProps) {
  const queryClient = useQueryClient();
  const [showToken, setShowToken] = React.useState(false);
  const { addNotification } = useNotificationStore();

  return (
    <div className="card p-6 group hover:scale-[1.02] transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-xl ${
            bot.aktif 
              ? 'bg-success/10 text-success'
              : 'bg-gray-100 dark:bg-dark-surface-soft text-gray-500 dark:text-dark-text-soft'
          }`}>
            <Bot size={24} />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              {bot.isim}
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                bot.aktif
                  ? 'bg-success/10 text-success'
                  : 'bg-gray-100 dark:bg-dark-surface-soft text-gray-500 dark:text-dark-text-soft'
              }`}>
                {bot.aktif ? 'Aktif' : 'Pasif'}
              </span>
            </h3>
            
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-gray-500 dark:text-dark-text-soft">
                {showToken ? bot.token : bot.token.slice(0, 10) + '...'}
              </p>
              <button
                onClick={() => setShowToken(!showToken)}
                className="text-xs text-primary dark:text-primary-light hover:underline"
              >
                {showToken ? 'Gizle' : 'Göster'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onConfigureClick(bot)}
            className="p-2 glass-button rounded-xl"
            title="Bot Ayarları"
          >
            <Settings size={18} />
          </button>
          
          <button
            onClick={() => {}}
            className={`p-2 glass-button rounded-xl ${
              bot.aktif 
                ? 'text-success hover:text-error'
                : 'text-gray-500 hover:text-success'
            }`}
            title={bot.aktif ? 'Botu Durdur' : 'Botu Başlat'}
          >
            <Power size={18} />
          </button>
          
          <button
            onClick={() => {}}
            className="p-2 glass-button rounded-xl text-error"
            title="Botu Sil"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}