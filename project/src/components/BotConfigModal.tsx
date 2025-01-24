import React from 'react';
import { X } from 'lucide-react';

interface BotConfigModalProps {
  bot: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: any) => void;
}

export default function BotConfigModal({ bot, isOpen, onClose, onSave }: BotConfigModalProps) {
  const [config, setConfig] = React.useState({
    welcome_message: bot.welcome_message || '',
    mini_app_url: bot.mini_app_url || '',
    openai_prompt: bot.openai_prompt || '',
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Bot Ayarları - {bot.isim}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Karşılama Mesajı
            </label>
            <textarea
              value={config.welcome_message}
              onChange={(e) => setConfig({ ...config, welcome_message: e.target.value })}
              className="w-full h-32 p-2 border rounded-md"
              placeholder="Kullanıcı bota başladığında gönderilecek mesaj..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mini Uygulama URL
            </label>
            <input
              type="text"
              value={config.mini_app_url}
              onChange={(e) => setConfig({ ...config, mini_app_url: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="https://t.ly/example"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OpenAI Prompt
            </label>
            <textarea
              value={config.openai_prompt}
              onChange={(e) => setConfig({ ...config, openai_prompt: e.target.value })}
              className="w-full h-32 p-2 border rounded-md"
              placeholder="Botun kişiliğini ve davranışlarını belirleyen prompt..."
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              İptal
            </button>
            <button
              onClick={() => {
                onSave(config);
                onClose();
              }}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}