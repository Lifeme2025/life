import axios from 'axios';
import { toast } from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 5000,
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
    return Promise.reject(error);
  }
);

export const getGuvenlikDurumu = async () => {
  try {
    const { data } = await api.get('/guvenlik');
    return data;
  } catch (error: any) {
    toast.error('Güvenlik durumu alınamadı');
    throw error;
  }
};

export const ipEngelle = async (ip: string, sebep: string) => {
  try {
    const { data } = await api.post('/guvenlik/ip-engelle', { ip, sebep });
    toast.success('IP başarıyla engellendi');
    return data;
  } catch (error: any) {
    toast.error('IP engellenemedi');
    throw error;
  }
};

export const ipEngeliKaldir = async (ip: string) => {
  try {
    const { data } = await api.delete(`/guvenlik/ip-engelle/${ip}`);
    toast.success('IP engeli kaldırıldı');
    return data;
  } catch (error: any) {
    toast.error('IP engeli kaldırılamadı');
    throw error;
  }
};