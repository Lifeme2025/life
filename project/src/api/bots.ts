import axios from 'axios';
import { toast } from 'react-hot-toast';
import { logController } from '../utils/logController';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    logController.addLog('error', `API request error: ${error.message}`, 'api', {
      stack: error.stack
    });
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      logController.addLog('error', 'Sunucuya bağlanılamıyor', 'api');
      toast.error('Sunucuya bağlanılamıyor. Lütfen sunucunun çalıştığından emin olun.');
    } else if (error.response?.status === 401) {
      logController.addLog('error', 'Yetkisiz erişim', 'api');
      localStorage.removeItem('token');
      window.location.href = '/giris';
    } else {
      logController.addLog('error', `API response error: ${error.response?.data?.message || error.message}`, 'api', {
        status: error.response?.status,
        data: error.response?.data
      });
      toast.error(error.response?.data?.message || 'Bir hata oluştu');
    }
    return Promise.reject(error);
  }
);

export const getBots = async () => {
  try {
    const { data } = await api.get('/bots');
    return data.data || [];
  } catch (error: any) {
    if (error.code !== 'ERR_NETWORK') {
      logController.addLog('error', `Bot listesi alınırken hata: ${error.message}`, 'api');
    }
    return [];
  }
};

export const botEkle = async (botData: { isim: string; token: string }) => {
  try {
    const { data } = await api.post('/bots', botData);
    logController.addLog('info', `Yeni bot eklendi: ${botData.isim}`, 'api');
    return data;
  } catch (error: any) {
    logController.addLog('error', `Bot eklenirken hata: ${error.message}`, 'api', {
      botData,
      error: error.response?.data
    });
    throw error;
  }
};

export const botSil = async (id: number) => {
  try {
    const { data } = await api.delete(`/bots/${id}`);
    logController.addLog('info', `Bot silindi: ${id}`, 'api');
    return data;
  } catch (error: any) {
    logController.addLog('error', `Bot silinirken hata: ${error.message}`, 'api', {
      botId: id,
      error: error.response?.data
    });
    throw error;
  }
};

export const botDurumDegistir = async (id: number) => {
  try {
    const { data } = await api.put(`/bots/${id}/durum`);
    logController.addLog('info', `Bot durumu değiştirildi: ${id}`, 'api');
    return data;
  } catch (error: any) {
    logController.addLog('error', `Bot durumu değiştirilirken hata: ${error.message}`, 'api', {
      botId: id,
      error: error.response?.data
    });
    throw error;
  }
};

export const botAyarlariniGuncelle = async (id: number, ayarlar: any) => {
  try {
    const { data } = await api.put(`/bots/${id}/config`, ayarlar);
    logController.addLog('info', `Bot ayarları güncellendi: ${id}`, 'api');
    return data;
  } catch (error: any) {
    logController.addLog('error', `Bot ayarları güncellenirken hata: ${error.message}`, 'api', {
      botId: id,
      ayarlar,
      error: error.response?.data
    });
    throw error;
  }
};

export const botDurumunuGetir = async (id: number) => {
  try {
    const { data } = await api.get(`/bots/${id}/status`);
    return data;
  } catch (error: any) {
    logController.addLog('error', `Bot durumu alınırken hata: ${error.message}`, 'api', {
      botId: id,
      error: error.response?.data
    });
    throw error;
  }
};

export const botIstatistikleriniGetir = async (id: number) => {
  try {
    const { data } = await api.get(`/bots/${id}/stats`);
    return data;
  } catch (error: any) {
    logController.addLog('error', `Bot istatistikleri alınırken hata: ${error.message}`, 'api', {
      botId: id,
      error: error.response?.data
    });
    throw error;
  }
};