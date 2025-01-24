import React from 'react';
import { Sparkles, Code, Wand2, History, Save, Play, RefreshCw, Image, Paperclip, X, Bot, MessageSquare, Zap } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface AIAction {
  type: 'ADD_FEATURE' | 'MODIFY_FEATURE' | 'REMOVE_FEATURE';
  component: string;
  description: string;
  code?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export default function AIStudio() {
  const [prompt, setPrompt] = React.useState('');
  const [showPreview, setShowPreview] = React.useState(false);
  const [pendingActions, setPendingActions] = React.useState<AIAction[]>([]);
  const [files, setFiles] = React.useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { data: history = [], refetch: refetchHistory } = useQuery({
    queryKey: ['ai-history'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3001/api/ai/history');
      return data;
    }
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const handleScreenshot = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ preferCurrentTab: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      stream.getTracks().forEach(track => track.stop());

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `screenshot-${Date.now()}.png`, { type: 'image/png' });
          setFiles(prev => [...prev, file]);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Ekran görüntüsü alınamadı:', error);
      toast.error('Ekran görüntüsü alınamadı');
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const { mutate: executePrompt, isLoading } = useMutation({
    mutationFn: async (data: { prompt: string; files?: File[] }) => {
      const formData = new FormData();
      formData.append('prompt', data.prompt);
      
      if (data.files?.length) {
        data.files.forEach(file => {
          formData.append('files', file);
        });
      }

      const { data: responseData } = await axios.post('http://localhost:3001/api/ai/chat', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return responseData;
    },
    onSuccess: (data) => {
      setPendingActions(data.actions);
      setShowPreview(true);
      setFiles([]);
      toast.success('AI analizi tamamlandı');
    },
    onError: () => {
      toast.error('İstek işlenirken bir hata oluştu');
    }
  });

  const handleAnalyze = () => {
    if (!prompt.trim()) {
      toast.error('Lütfen bir prompt girin');
      return;
    }

    executePrompt({ prompt, files });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            AI Studio
          </h1>
          <p className="text-gray-600 dark:text-dark-text-soft mt-1">
            Bot kişiliğini ve davranışlarını yapay zeka ile özelleştirin
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-6 hover:scale-[1.02] transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <Bot size={24} />
                </div>
                <h3 className="font-semibold">Bot Kişiliği</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-dark-text-soft">
                Botunuzun karakterini ve konuşma tarzını belirleyin
              </p>
            </div>

            <div className="card p-6 hover:scale-[1.02] transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-xl bg-success/10 text-success">
                  <MessageSquare size={24} />
                </div>
                <h3 className="font-semibold">Yanıt Şablonları</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-dark-text-soft">
                Özel yanıt formatları ve şablonları oluşturun
              </p>
            </div>

            <div className="card p-6 hover:scale-[1.02] transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 rounded-xl bg-accent/10 text-accent">
                  <Zap size={24} />
                </div>
                <h3 className="font-semibold">Akıllı Kurallar</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-dark-text-soft">
                Otomatik yanıt ve davranış kuralları tanımlayın
              </p>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Wand2 className="text-primary" />
              AI Prompt
            </h2>
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Panel üzerinde yapmak istediğiniz değişiklikleri açıklayın..."
                className="input w-full h-32"
              />

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleScreenshot}
                  className="button-secondary"
                >
                  <Image size={20} className="mr-2" />
                  Ekran Görüntüsü
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="button-secondary"
                >
                  <Paperclip size={20} className="mr-2" />
                  Dosya Ekle
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
              </div>

              <AnimatePresence>
                {files.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-dark-surface rounded-xl"
                  >
                    {files.map((file, index) => (
                      <div key={index} className="relative group">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-white dark:bg-dark-surface-soft rounded-lg flex items-center justify-center">
                            <Paperclip size={24} className="text-gray-400" />
                          </div>
                        )}
                        <button
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 p-1 bg-error text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                        <span className="absolute -bottom-2 left-0 right-0 text-center text-xs text-gray-500 truncate px-1">
                          {file.name}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handleAnalyze}
                disabled={isLoading || !prompt.trim()}
                className="button-primary w-full"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="animate-spin mr-2" />
                    Analiz Ediliyor...
                  </>
                ) : (
                  <>
                    <Play className="mr-2" />
                    Analiz Et
                  </>
                )}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="card p-6"
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Code className="text-primary" />
                  Önerilen Değişiklikler
                </h2>
                <div className="space-y-4">
                  {pendingActions.map((action, index) => (
                    <div key={index} className="card p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className={`
                            px-2 py-1 rounded-full text-xs
                            ${action.type === 'ADD_FEATURE' ? 'bg-success/10 text-success' :
                              action.type === 'MODIFY_FEATURE' ? 'bg-warning/10 text-warning' :
                              'bg-error/10 text-error'}
                          `}>
                            {action.type}
                          </span>
                          <h3 className="font-medium mt-2">{action.component}</h3>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-dark-text-soft text-sm mb-2">{action.description}</p>
                      {action.code && (
                        <pre className="bg-gray-50 dark:bg-dark-surface p-3 rounded-lg text-sm overflow-x-auto">
                          <code>{action.code}</code>
                        </pre>
                      )}
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPreview(false)}
                      className="button-secondary flex-1"
                    >
                      İptal
                    </button>
                    <button
                      onClick={() => {
                        setShowPreview(false);
                      }}
                      className="button-primary flex-1"
                    >
                      <Save className="mr-2" />
                      Değişiklikleri Uygula
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <History className="text-primary" />
            İşlem Geçmişi
          </h2>
          <div className="space-y-4">
            {history.map((item: any, index: number) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-dark-surface rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-dark-text-soft">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                    <p className="font-medium mt-1">{item.prompt}</p>
                  </div>
                  <span className={`
                    px-2 py-1 rounded-full text-xs
                    ${item.status === 'completed' ? 'bg-success/10 text-success' :
                      item.status === 'failed' ? 'bg-error/10 text-error' :
                      'bg-warning/10 text-warning'}
                  `}>
                    {item.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-dark-text-soft">
                  <p>Yapılan Değişiklikler:</p>
                  <ul className="list-disc list-inside mt-1">
                    {item.changes.map((change: string, i: number) => (
                      <li key={i}>{change}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}