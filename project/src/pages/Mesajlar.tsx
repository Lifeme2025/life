import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Search, Filter, Download, Trash2, ExternalLink, Bot, Calendar, ArrowDown, ArrowUp, User, Clock } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import SortButton from '../components/SortButton';

interface Mesaj {
  id: number;
  kullanici_id: number;
  kullanici_adi: string;
  bot_id: number;
  bot_adi: string;
  mesaj: string;
  tarih: string;
  tip: 'gelen' | 'giden';
}

export default function Mesajlar() {
  const [aramaMetni, setAramaMetni] = React.useState('');
  const [tipFiltresi, setTipFiltresi] = React.useState<string>('hepsi');
  const [botFiltresi, setBotFiltresi] = React.useState<string>('hepsi');
  const [siralama, setSiralama] = React.useState<{
    field: string;
    direction: 'asc' | 'desc';
  }>({
    field: 'tarih',
    direction: 'desc'
  });

  const { data: mesajlar = [], isLoading } = useQuery({
    queryKey: ['mesajlar'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3001/api/mesajlar');
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

  const siralamaSecenekleri = [
    { id: 'tarih', label: 'Tarih' },
    { id: 'kullanici_adi', label: 'Kullanıcı' },
    { id: 'bot_adi', label: 'Bot' }
  ];

  const filtrelenenMesajlar = React.useMemo(() => {
    let sonuc = mesajlar.filter((mesaj: Mesaj) => {
      const aramaUyumu = 
        mesaj.mesaj.toLowerCase().includes(aramaMetni.toLowerCase()) ||
        mesaj.kullanici_adi.toLowerCase().includes(aramaMetni.toLowerCase());
      
      const tipUyumu = tipFiltresi === 'hepsi' || mesaj.tip === tipFiltresi;
      const botUyumu = botFiltresi === 'hepsi' || mesaj.bot_id.toString() === botFiltresi;
      
      return aramaUyumu && tipUyumu && botUyumu;
    });

    // Sıralama
    sonuc.sort((a, b) => {
      const aValue = a[siralama.field];
      const bValue = b[siralama.field];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return siralama.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (siralama.field === 'tarih') {
        const aDate = new Date(a.tarih);
        const bDate = new Date(b.tarih);
        return siralama.direction === 'asc'
          ? aDate.getTime() - bDate.getTime()
          : bDate.getTime() - aDate.getTime();
      }

      return 0;
    });

    return sonuc;
  }, [mesajlar, aramaMetni, tipFiltresi, botFiltresi, siralama]);

  const mesajlariIndir = () => {
    const csv = [
      ['ID', 'Kullanıcı', 'Bot', 'Mesaj', 'Tarih', 'Tip'],
      ...filtrelenenMesajlar.map((m: Mesaj) => [
        m.id,
        m.kullanici_adi,
        m.bot_adi,
        m.mesaj,
        m.tarih,
        m.tip
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mesajlar.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Mesaj Geçmişi
          </h1>
          <p className="text-gray-600 dark:text-dark-text-soft mt-1">
            Bot mesajlarını görüntüleyin ve yönetin
          </p>
        </div>
        <button
          onClick={mesajlariIndir}
          className="button-primary"
        >
          <Download size={20} className="mr-2" />
          Dışa Aktar
        </button>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-primary/10 text-primary">
              <MessageSquare size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Toplam Mesaj</h3>
              <p className="text-2xl font-bold text-primary">
                {mesajlar.length}
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
                {botlar.filter(b => b.aktif).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-accent/10 text-accent">
              <User size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Tekil Kullanıcı</h3>
              <p className="text-2xl font-bold text-accent">
                {new Set(mesajlar.map(m => m.kullanici_id)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-secondary/10 text-secondary">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Günlük Mesaj</h3>
              <p className="text-2xl font-bold text-secondary">
                {mesajlar.filter(m => {
                  const mesajTarihi = new Date(m.tarih);
                  const bugun = new Date();
                  return mesajTarihi.toDateString() === bugun.toDateString();
                }).length}
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
              placeholder="Mesajlarda ara..."
              value={aramaMetni}
              onChange={(e) => setAramaMetni(e.target.value)}
              className="input pl-10 w-full"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={tipFiltresi}
                onChange={(e) => setTipFiltresi(e.target.value)}
                className="input"
              >
                <option value="hepsi">Tüm Mesajlar</option>
                <option value="gelen">Gelen</option>
                <option value="giden">Giden</option>
              </select>
            </div>
            <select
              value={botFiltresi}
              onChange={(e) => setBotFiltresi(e.target.value)}
              className="input"
            >
              <option value="hepsi">Tüm Botlar</option>
              {botlar.map((bot: any) => (
                <option key={bot.id} value={bot.id}>
                  {bot.isim}
                </option>
              ))}
            </select>
            <SortButton
              options={siralamaSecenekleri}
              activeSort={siralama}
              onSort={(field, direction) => setSiralama({ field, direction })}
            />
          </div>
        </div>
      </div>

      {/* Mesaj Listesi */}
      {isLoading ? (
        <div className="card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-dark-text-soft">Mesajlar yükleniyor...</p>
        </div>
      ) : filtrelenenMesajlar.length === 0 ? (
        <div className="card p-8 text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 dark:text-dark-text-soft mx-auto mb-4 animate-float" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-dark-text mb-2">
            Mesaj Bulunamadı
          </h2>
          <p className="text-gray-500 dark:text-dark-text-soft">
            Arama kriterlerinize uygun mesaj bulunmamaktadır.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtrelenenMesajlar.map((mesaj: Mesaj) => (
            <motion.div
              key={mesaj.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`card p-6 ${
                mesaj.tip === 'gelen' 
                  ? 'bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20' 
                  : ''
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center
                    ${mesaj.tip === 'gelen'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-success/10 text-success'
                    }
                  `}>
                    {mesaj.tip === 'gelen' ? <User size={20} /> : <Bot size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{mesaj.tip === 'gelen' ? mesaj.kullanici_adi : mesaj.bot_adi}</span>
                      <span className={`
                        px-2 py-1 rounded-full text-xs
                        ${mesaj.tip === 'gelen'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-success/10 text-success'
                        }
                      `}>
                        {mesaj.tip === 'gelen' ? 'Kullanıcı' : 'Bot'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-text-soft">
                      <Calendar size={14} />
                      <span>{new Date(mesaj.tarih).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="p-2 glass-button rounded-xl"
                    title="Konuşmaya Git"
                  >
                    <ExternalLink size={18} className="text-primary" />
                  </button>
                  <button
                    className="p-2 glass-button rounded-xl text-error"
                    title="Sil"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <p className="text-gray-700 dark:text-dark-text mt-4 pl-[52px]">
                {mesaj.mesaj}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}