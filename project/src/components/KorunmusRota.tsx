import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const YETKI_HARITALARI: Record<string, string[]> = {
  '/kullanicilar': ['kullanici_yonetimi'],
  '/bot-ayarlari': ['bot_yonetimi'],
  '/guvenlik': ['guvenlik_yonetimi'],
  '/veritabani': ['veritabani_yonetimi'],
  '/sistem-loglari': ['sistem_loglari_goruntuleme'],
  '/webhook-yonetimi': ['webhook_yonetimi'],
  '/komut-yonetimi': ['komut_yonetimi'],
  '/prompts': ['ai_yonetimi'],
  '/analizler': ['analiz_goruntuleme'],
  '/performans': ['performans_goruntuleme']
};

export default function KorunmusRota() {
  const { girisYapildi, yetkiVarMi } = useAuth();
  const location = useLocation();
  
  if (!girisYapildi) {
    return <Navigate to="/giris" state={{ from: location }} replace />;
  }

  const gerekliYetkiler = YETKI_HARITALARI[location.pathname];
  if (gerekliYetkiler && !gerekliYetkiler.some(yetki => yetkiVarMi(yetki))) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}