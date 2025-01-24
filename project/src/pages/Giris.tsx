import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { Bot, Lock, User } from 'lucide-react';
import axios from 'axios';

export default function Giris() {
  const navigate = useNavigate();
  const { girisYap } = useAuth();
  const [kullaniciAdi, setKullaniciAdi] = React.useState('test');
  const [sifre, setSifre] = React.useState('test');
  const [yukleniyor, setYukleniyor] = React.useState(false);

  React.useEffect(() => {
    handleGiris();
  }, []);

  const handleGiris = async () => {
    setYukleniyor(true);

    try {
      const { data } = await axios.post('http://localhost:3001/api/auth/login', {
        kullanici_adi: 'test',
        sifre: 'test'
      });

      if (data.token) {
        girisYap(data.token, data.user);
        navigate('/', { replace: true });
        toast.success('Giriş başarılı');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Giriş yapılamadı');
    } finally {
      setYukleniyor(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setYukleniyor(true);

    try {
      const { data } = await axios.post('http://localhost:3001/api/auth/login', {
        kullanici_adi: kullaniciAdi,
        sifre
      });

      if (data.token) {
        girisYap(data.token, data.user);
        navigate('/', { replace: true });
        toast.success('Giriş başarılı');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Giriş yapılamadı');
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-2xl">
        <div>
          <div className="w-20 h-20 bg-blue-100 rounded-2xl mx-auto flex items-center justify-center">
            <Bot className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Telegram Bot Yönetimi
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Yönetim paneline giriş yapın
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="kullanici_adi" className="sr-only">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="kullanici_adi"
                  name="kullanici_adi"
                  type="text"
                  required
                  value={kullaniciAdi}
                  onChange={(e) => setKullaniciAdi(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Kullanıcı adı"
                />
              </div>
            </div>
            <div>
              <label htmlFor="sifre" className="sr-only">
                Şifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="sifre"
                  name="sifre"
                  type="password"
                  required
                  value={sifre}
                  onChange={(e) => setSifre(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Şifre"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={yukleniyor}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {yukleniyor ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Giriş Yap'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}