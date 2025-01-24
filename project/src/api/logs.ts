import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 5000,
});

interface Log {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

export const getLogs = async (): Promise<Log[]> => {
  const { data } = await api.get('/logs');
  return data;
};