import React from 'react';
import { Layout, Upload, Trash2, Copy, Search, Filter, Image, Video, FileText, Plus, X, Download, RefreshCw, Grid, List as ListIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface MedyaDosyasi {
  id: number;
  isim: string;
  tip: 'resim' | 'video' | 'gif' | 'dosya';
  url: string;
  boyut: number;
  olusturma_tarihi: string;
  etiketler: string[];
}

export default function MedyaKutuphanesi() {
  const [aramaMetni, setAramaMetni] = React.useState('');
  const [tipFiltresi, setTipFiltresi] = React.useState<string>('hepsi');
  const [seciliDosyalar, setSeciliDosyalar] = React.useState<number[]>([]);
  const [gorunumModu, setGorunumModu] = React.useState<'grid' | 'list'>('grid');
  const [yuklemeModalAcik, setYuklemeModalAcik] = React.useState(false);
  const [yuklenecekDosyalar, setYuklenecekDosyalar] = React.useState<File[]>([]);
  const [yuklemeIlerlemesi, setYuklemeIlerlemesi] = React.useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { data: medyalar = [], isLoading, refetch } = useQuery({
    queryKey: ['medya-dosyalari'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3001/api/medya');
      return data;
    }
  });

  const filtrelenenMedyalar = medyalar.filter((medya: MedyaDosyasi) => {
    const aramaUyumu = 
      medya.isim.toLowerCase().includes(aramaMetni.toLowerCase()) ||
      medya.etiketler.some(etiket => etiket.toLowerCase().includes(aramaMetni.toLowerCase()));
    
    const tipUyumu = tipFiltresi === 'hepsi' || medya.tip === tipFiltresi;
    
    return aramaUyumu && tipUyumu;
  });

  const formatBoyut = (byte: number) => {
    if (byte < 1024) return `${byte} B`;
    if (byte < 1024 * 1024) return `${(byte / 1024).toFixed(2)} KB`;
    return `${(byte / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleDosyaYukle = async () => {
    if (yuklenecekDosyalar.length === 0) return;

    const formData = new FormData();
    yuklenecekDosyalar.forEach(file => {
      formData.append('dosyalar', file);
    });

    try {
      await axios.post('http://localhost:3001/api/medya/yukle', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setYuklemeIlerlemesi(progress);
        }
      });

      toast.success('Dosyalar başarıyla yüklendi');
      setYuklenecekDosyalar([]);
      setYuklemeModalAcik(false);
      refetch();
    } catch (error) {
      toast.error('Dosyalar yüklenirken bir hata oluştu');
    } finally {
      setYuklemeIlerlemesi(0);
    }
  };

  const handleDosyaSecimi = (files: FileList | null) => {
    if (!files) return;
    setYuklenecekDosyalar(Array.from(files));
    setYuklemeModalAcik(true);
  };

  const handleDosyaSil = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3001/api/medya/${id}`);
      toast.success('Dosya başarıyla silindi');
      refetch();
    } catch (error) {
      toast.error('Dosya silinirken bir hata oluştu');
    }
  };

  const handleTopluSil = async () => {
    try {
      await Promise.all(seciliDosyalar.map(id => axios.delete(`http://localhost:3001/api/medya/${id}`)));
      toast.success('Seçili dosyalar başarıyla silindi');
      setSeciliDosyalar([]);
      refetch();
    } catch (error) {
      toast.error('Dosyalar silinirken bir hata oluştu');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Medya Kütüphanesi
          </h1>
          <p className="text-gray-600 dark:text-dark-text-soft mt-1">
            Bot medya dosyalarını yönetin
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="button-primary"
          >
            <Upload size={20} className="mr-2" />
            Dosya Yükle
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleDosyaSecimi(e.target.files)}
            accept="image/*,video/*,.gif,.pdf,.doc,.docx"
          />
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-primary/10 text-primary">
              <Image size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Resimler</h3>
              <p className="text-2xl font-bold text-primary">
                {medyalar.filter(m => m.tip === 'resim').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-success/10 text-success">
              <Video size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Videolar</h3>
              <p className="text-2xl font-bold text-success">
                {medyalar.filter(m => m.tip === 'video').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-accent/10 text-accent">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Dosyalar</h3>
              <p className="text-2xl font-bold text-accent">
                {medyalar.filter(m => m.tip === 'dosya').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-secondary/10 text-secondary">
              <Layout size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Toplam</h3>
              <p className="text-2xl font-bold text-secondary">
                {medyalar.length}
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
              placeholder="Medya ara..."
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
                <option value="hepsi">Tüm Dosyalar</option>
                <option value="resim">Resimler</option>
                <option value="video">Videolar</option>
                <option value="gif">GIF'ler</option>
                <option value="dosya">Diğer Dosyalar</option>
              </select>
            </div>
            <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-dark-surface rounded-lg">
              <button
                onClick={() => setGorunumModu('grid')}
                className={`p-2 rounded-lg ${
                  gorunumModu === 'grid'
                    ? 'bg-white dark:bg-dark-surface-soft shadow-sm'
                    : 'text-gray-500 dark:text-dark-text-soft'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setGorunumModu('list')}
                className={`p-2 rounded-lg ${
                  gorunumModu === 'list'
                    ? 'bg-white dark:bg-dark-surface-soft shadow-sm'
                    : 'text-gray-500 dark:text-dark-text-soft'
                }`}
              >
                <ListIcon size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Seçili Dosya İşlemleri */}
        {seciliDosyalar.length > 0 && (
          <div className="flex items-center gap-4 mt-4 p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
            <span className="text-sm text-primary">
              {seciliDosyalar.length} dosya seçili
            </span>
            <div className="flex-1" />
            <button
              onClick={handleTopluSil}
              className="button-error"
            >
              <Trash2 size={18} className="mr-2" />
              Seçilenleri Sil
            </button>
          </div>
        )}
      </div>

      {/* Medya Listesi */}
      {isLoading ? (
        <div className="card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-dark-text-soft">Medya dosyaları yükleniyor...</p>
        </div>
      ) : filtrelenenMedyalar.length === 0 ? (
        <div className="card p-8 text-center">
          <Layout className="w-16 h-16 text-gray-400 dark:text-dark-text-soft mx-auto mb-4 animate-float" />
          <h2 className="text-xl font-semibold text-gray-700 dark:text-dark-text mb-2">
            Medya Bulunamadı
          </h2>
          <p className="text-gray-500 dark:text-dark-text-soft mb-4">
            Arama kriterlerinize uygun medya dosyası bulunmamaktadır.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="button-primary"
          >
            <Upload size={20} className="mr-2" />
            Dosya Yükle
          </button>
        </div>
      ) : gorunumModu === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filtrelenenMedyalar.map((medya: MedyaDosyasi) => (
            <div
              key={medya.id}
              className={`card group hover:scale-[1.02] transition-all duration-300 ${
                seciliDosyalar.includes(medya.id) ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className="aspect-square relative">
                {medya.tip === 'resim' || medya.tip === 'gif' ? (
                  <img
                    src={medya.url}
                    alt={medya.isim}
                    className="w-full h-full object-cover rounded-t-xl"
                  />
                ) : medya.tip === 'video' ? (
                  <video
                    src={medya.url}
                    className="w-full h-full object-cover rounded-t-xl"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-dark-surface rounded-t-xl">
                    <FileText size={32} className="text-gray-400" />
                  </div>
                )}

                {/* Seçim Overlay */}
                <div
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                  onClick={() => {
                    if (seciliDosyalar.includes(medya.id)) {
                      setSeciliDosyalar(seciliDosyalar.filter(id => id !== medya.id));
                    } else {
                      setSeciliDosyalar([...seciliDosyalar, medya.id]);
                    }
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(medya.url);
                      toast.success('URL kopyalandı');
                    }}
                    className="p-2 glass-button rounded-xl"
                    title="URL Kopyala"
                  >
                    <Copy size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDosyaSil(medya.id);
                    }}
                    className="p-2 glass-button rounded-xl text-error"
                    title="Sil"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <p className="font-medium truncate">{medya.isim}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500 dark:text-dark-text-soft">
                    {formatBoyut(medya.boyut)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-dark-text-soft">
                    {new Date(medya.olusturma_tarihi).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left p-4">
                    <input
                      type="checkbox"
                      checked={seciliDosyalar.length === filtrelenenMedyalar.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSeciliDosyalar(filtrelenenMedyalar.map(m => m.id));
                        } else {
                          setSeciliDosyalar([]);
                        }
                      }}
                      className="rounded text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="text-left p-4">Dosya</th>
                  <th className="text-left p-4">Tip</th>
                  <th className="text-left p-4">Boyut</th>
                  <th className="text-left p-4">Tarih</th>
                  <th className="text-right p-4">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filtrelenenMedyalar.map((medya: MedyaDosyasi) => (
                  <tr
                    key={medya.id}
                    className={`border-t dark:border-dark-surface hover:bg-gray-50 dark:hover:bg-dark-surface/50 ${
                      seciliDosyalar.includes(medya.id) ? 'bg-primary/5' : ''
                    }`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={seciliDosyalar.includes(medya.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSeciliDosyalar([...seciliDosyalar, medya.id]);
                          } else {
                            setSeciliDosyalar(seciliDosyalar.filter(id => id !== medya.id));
                          }
                        }}
                        className="rounded text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {medya.tip === 'resim' || medya.tip === 'gif' ? (
                          <img
                            src={medya.url}
                            alt={medya.isim}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                        ) : medya.tip === 'video' ? (
                          <video
                            src={medya.url}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-dark-surface rounded-lg">
                            <FileText size={20} className="text-gray-400" />
                          </div>
                        )}
                        <span className="font-medium">{medya.isim}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${medya.tip === 'resim'
                          ? 'bg-primary/10 text-primary'
                          : medya.tip === 'video'
                          ? 'bg-success/10 text-success'
                          : medya.tip === 'gif'
                          ? 'bg-accent/10 text-accent'
                          : 'bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-dark-text-soft'
                        }
                      `}>
                        {medya.tip.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">{formatBoyut(medya.boyut)}</td>
                    <td className="p-4">
                      {new Date(medya.olusturma_tarihi).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(medya.url);
                            toast.success('URL kopyalandı');
                          }}
                          className="p-2 glass-button rounded-xl"
                          title="URL Kopyala"
                        >
                          <Copy size={18} />
                        </button>
                        <button
                          onClick={() => handleDosyaSil(medya.id)}
                          className="p-2 glass-button rounded-xl text-error"
                          title="Sil"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Yükleme Modal */}
      <AnimatePresence>
        {yuklemeModalAcik && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setYuklemeModalAcik(false)}
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
                      <h2 className="text-xl font-semibold">Dosya Yükleme</h2>
                      <button
                        onClick={() => setYuklemeModalAcik(false)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-dark-surface rounded-xl"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Dosya Listesi */}
                    <div className="space-y-4">
                      {yuklenecekDosyalar.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-dark-surface rounded-xl"
                        >
                          {file.type.startsWith('image/') ? (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 flex items-center justify-center bg-white dark:bg-dark-surface-soft rounded-lg">
                              <FileText size={24} className="text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-gray-500 dark:text-dark-text-soft">
                              {formatBoyut(file.size)}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setYuklenecekDosyalar(yuklenecekDosyalar.filter((_, i) => i !== index));
                            }}
                            className="p-2 hover:bg-white dark:hover:bg-dark-surface-soft rounded-lg text-error"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* İlerleme Çubuğu */}
                    {yuklemeIlerlemesi > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Yükleniyor...</span>
                          <span>{yuklemeIlerlemesi}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-dark-surface rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${yuklemeIlerlemesi}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Butonlar */}
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setYuklemeModalAcik(false)}
                        className="button-secondary"
                      >
                        İptal
                      </button>
                      <button
                        onClick={handleDosyaYukle}
                        disabled={yuklenecekDosyalar.length === 0 || yuklemeIlerlemesi > 0}
                        className="button-primary"
                      >
                        {yuklemeIlerlemesi > 0 ? (
                          <>
                            <RefreshCw className="animate-spin" />
                            Yükleniyor...
                          </>
                        ) : (
                          <>
                            <Upload size={20} className="mr-2" />
                            Yükle
                          </>
                        )}
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