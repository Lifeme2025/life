import React from 'react';
import { MessageSquare, Send, X, Maximize2, Minimize2, RotateCcw, Image, Paperclip, Sparkles, Bot } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { logController } from '../utils/logController';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: Array<{
    type: 'image' | 'file';
    url: string;
    name: string;
    size?: number;
  }>;
}

interface AIAssistantProps {
  onAction?: (action: any) => void;
}

export default function AIAssistant({ onAction }: AIAssistantProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [files, setFiles] = React.useState<File[]>([]);
  const [isCapturing, setIsCapturing] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const { mutate: sendMessage, isLoading } = useMutation({
    mutationFn: async ({ message, attachments }: { message: string; attachments?: File[] }) => {
      try {
        const formData = new FormData();
        formData.append('message', message);
        
        if (attachments?.length) {
          attachments.forEach(file => {
            formData.append('files', file);
          });
        }

        const { data } = await axios.post('http://localhost:3001/api/ai/chat', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return data;
      } catch (error: any) {
        logController.addLog('error', `AI mesajı gönderilirken hata: ${error.message}`, 'ai', {
          message,
          error: error.response?.data
        });
        throw error;
      }
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        attachments: data.attachments
      }]);

      if (data.action && onAction) {
        onAction(data.action);
      }

      setFiles([]);
      logController.addLog('info', 'AI yanıtı alındı', 'ai');
    },
    onError: () => {
      toast.error('Mesaj gönderilemedi');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !files.length) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      attachments: files.map(file => ({
        type: file.type.startsWith('image/') ? 'image' : 'file',
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      }))
    };

    setMessages(prev => [...prev, newMessage]);
    sendMessage({ message: input, attachments: files });
    setInput('');
  };

  // Minimized state - floating button
  if (!isOpen) {
    return (
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 glass-button rounded-2xl shadow-lg hover:shadow-xl z-50 group"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
      >
        <Bot size={24} className="text-primary group-hover:scale-110 transition-transform duration-200" />
      </motion.button>
    );
  }

  return (
    <motion.div 
      className={`
        fixed bottom-6 right-6 
        card
        z-50
        flex flex-col
        ${isExpanded ? 'w-[800px] h-[80vh]' : 'w-[400px] h-[600px]'}
      `}
      style={{ maxHeight: 'calc(100vh - 4rem)' }}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b dark:border-dark-surface">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary">
            <Bot className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white">Missme</h3>
            <p className="text-xs text-gray-500 dark:text-dark-text-soft">Size nasıl yardımcı olabilirim?</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-surface rounded-lg transition-colors"
            title={isExpanded ? 'Küçült' : 'Büyüt'}
          >
            {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
          <button
            onClick={() => setMessages([])}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-surface rounded-lg transition-colors"
            title="Sohbeti Temizle"
          >
            <RotateCcw size={20} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-surface rounded-lg transition-colors"
            title="Kapat"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <Bot size={48} className="text-primary/50 mb-4 animate-float" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-dark-text mb-2">
              Merhaba! Ben Missme
            </h3>
            <p className="text-gray-500 dark:text-dark-text-soft max-w-sm">
              Size panel yönetiminde yardımcı olmak için buradayım. Ne yapmak istersiniz?
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <button className="p-4 glass-button rounded-xl text-left hover:scale-105 transition-transform">
                <Bot className="text-primary mb-2" size={24} />
                <p className="font-medium">Bot Ekle</p>
                <p className="text-sm text-gray-500 dark:text-dark-text-soft">Yeni bir Telegram botu ekle</p>
              </button>
              <button className="p-4 glass-button rounded-xl text-left hover:scale-105 transition-transform">
                <Sparkles className="text-secondary mb-2" size={24} />
                <p className="font-medium">AI Studio</p>
                <p className="text-sm text-gray-500 dark:text-dark-text-soft">Bot kişiliği oluştur</p>
              </button>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`
                max-w-[80%] p-4 rounded-2xl space-y-2
                ${message.role === 'user'
                  ? 'glass-button'
                  : 'bg-gradient-to-br from-primary to-secondary text-white'
                }
              `}>
                {message.attachments?.map((attachment, index) => (
                  <div key={index} className="mb-2">
                    {attachment.type === 'image' ? (
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="max-w-full rounded-lg"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-white/10 rounded-lg">
                        <Paperclip size={16} />
                        <span>{attachment.name}</span>
                      </div>
                    )}
                  </div>
                ))}
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                <span className="text-xs opacity-70 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t dark:border-dark-surface">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Mesajınızı yazın..."
            className="input flex-1"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || (!input.trim() && !files.length)}
            className="button-primary px-6"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}