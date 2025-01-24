import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Settings, Save, RefreshCw } from 'lucide-react';
import axios from 'axios';

interface BotAyarlari {
  id: number;
  isim: string;
  token: string;
  webhook_url?: string;
  welcome_message?: string;
  commands?: Array<{ command: string; description: string }>;
  openai_prompt?: string;
  notification_channel?: string;
  max_daily_messages?: number;
  allowed_users?: string[];
  blocked_users?: string[];
}

export default function BotAyarlari() {
  const [seciliBotId, setSeciliBotId] = React.useState<number | null>(null);
  const [ayarlar, setAyarlar] = React.useState<BotAyarlari | null>(null);

  const { data: botlar = [], isLoading: botlarYukleniyor } = useQuery({
    queryKey: ['botlar'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3001/api/bots');
      return data;
    }
  });

  const { data: botAyarlari, isLoading: ayarlarYukleniyor } = useQuery({
    queryKey: ['bot-ayarlari', seciliBotId],
    queryFn: async () => {
      if (!seciliBotId) return null;
      const { data } = await axios.get(`http://localhost:3001/api/bots/${seciliBotId}/config`);
      return data;
    },
    enabled: !!seciliBotId
  });

  React.useEffect(() => {
    if (botAyarlari) {
      setAyarlar(botAyarlari);
    }
  }, [botAyarlari]);

  const ayarlariKaydet = async () => {
    if (!seciliBotId || !ayarlar) return;
    
    try {
      await axios.put(`http://localhost:3001/api/bots/${seciliBotId}/config`, ayarlar);
      toast.success('Ayarlar başarıyla kaydedildi');
    } catch (error) {
      toast.error('Ayarlar kaydedilirken bir hata oluştu');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bot Ayarları</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {botlarYukleniyor ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">Botlar yükleniyor...</p>
          </div>
        ) : botlar.length === 0 ? (
          <div className="text-center py-8">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Bot Bulunamadı
            </h2>
            <p className="text-gray-500">
              Ayarlarını düzenlemek için önce bir bot eklemelisiniz.
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bot Seçin
              </label>
              <select
                value={seciliBotId || ''}
                onChange={(e) => setSeciliBotId(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Bot seçin...</option>
                {botlar.map((bot: any) => (
                  <option key={bot.id} value={bot.id}>
                    {bot.isim}
                  </option>
                ))}
              </select>
            </div>

            {seciliBotId && ayarlar && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Karşılama Mesajı
                  </label>
                  <textarea
                    value={ayarlar.welcome_message || ''}
                    onChange={(e) => setAyarlar({ ...ayarlar, welcome_message: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 h-32"
                    placeholder="Kullanıcı bota başladığında gönderilecek mesaj..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OpenAI Prompt
                  </label>
                  <textarea
                    value={ayarlar.openai_prompt || ''}
                    onChange={(e) => setAyarlar({ ...ayarlar, openai_prompt: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 h-32"
                    placeholder="Botun kişiliğini ve davranışlarını belirleyen prompt..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bildirim Kanalı
                  </label>
                  <input
                    type="text"
                    value={ayarlar.notification_channel || ''}
                    onChange={(e) => setAyarlar({ ...ayarlar, notification_channel: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="@kanal_adi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Günlük Maksimum Mesaj
                  </label>
                  <input
                    type="number"
                    value={ayarlar.max_daily_messages || ''}
                    onChange={(e) => setAyarlar({ ...ayarlar, max_daily_messages: Number(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="0 = sınırsız"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setAyarlar(botAyarlari)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <RefreshCw size={20} />
                    Sıfırla
                  </button>
                  <button
                    onClick={ayarlariKaydet}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save size={20} />
                    Kaydet
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}