import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number;
  kullanici_adi: string;
  email: string;
  rol: 'admin' | 'moderator' | 'user';
  izinler: string[];
}

interface AuthState {
  girisYapildi: boolean;
  token: string | null;
  user: User | null;
  girisYap: (token: string, user: User) => void;
  cikisYap: () => void;
  yetkiVarMi: (yetki: string) => boolean;
}

const DEFAULT_PERMISSIONS = [
  'kullanici_yonetimi',
  'bot_yonetimi',
  'guvenlik_yonetimi',
  'veritabani_yonetimi',
  'sistem_loglari_goruntuleme',
  'webhook_yonetimi',
  'komut_yonetimi',
  'ai_yonetimi',
  'analiz_goruntuleme',
  'performans_goruntuleme',
  'mesaj_yonetimi',
  'medya_yonetimi',
  'bildirim_yonetimi'
];

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      girisYapildi: false,
      token: null,
      user: null,
      girisYap: (token: string, user: User) => {
        const userWithPermissions = {
          ...user,
          rol: 'admin',
          izinler: [...DEFAULT_PERMISSIONS]
        };
        set({ girisYapildi: true, token, user: userWithPermissions });
      },
      cikisYap: () => {
        set({ girisYapildi: false, token: null, user: null });
      },
      yetkiVarMi: (yetki: string) => {
        const state = get();
        return state.user?.izinler.includes(yetki) || state.user?.rol === 'admin' || false;
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);