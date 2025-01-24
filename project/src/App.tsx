import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import Panel from './pages/Panel';
import AIStudio from './pages/AIStudio';
import Kullanicilar from './pages/Kullanicilar';
import Mesajlar from './pages/Mesajlar';
import BotAyarlari from './pages/BotAyarlari';
import Prompts from './pages/Prompts';
import Analizler from './pages/Analizler';
import Performans from './pages/Performans';
import Veritabani from './pages/Veritabani';
import Guvenlik from './pages/Guvenlik';
import Bildirimler from './pages/Bildirimler';
import SistemLoglari from './pages/SistemLoglari';
import MesajSablonlari from './pages/MesajSablonlari';
import TopluMesaj from './pages/TopluMesaj';
import ZamanlanmisMesajlar from './pages/ZamanlanmisMesajlar';
import MedyaKutuphanesi from './pages/MedyaKutuphanesi';
import KomutYonetimi from './pages/KomutYonetimi';
import WebhookYonetimi from './pages/WebhookYonetimi';
import Yerlesim from './components/Yerlesim';
import Giris from './pages/Giris';
import { useAuth } from './hooks/useAuth';
import { logController } from './utils/logController';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      onError: (error: any) => {
        logController.addLog('error', `Query error: ${error.message}`, 'query', {
          stack: error.stack
        });
      }
    },
    mutations: {
      onError: (error: any) => {
        logController.addLog('error', `Mutation error: ${error.message}`, 'mutation', {
          stack: error.stack
        });
      }
    }
  }
});

// Global error boundary
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logController.addLog('error', `React error: ${error.message}`, 'react', {
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-error mb-4">Bir hata oluştu</h1>
            <button 
              onClick={() => window.location.reload()}
              className="button-primary"
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { girisYapildi } = useAuth();
  
  if (!girisYapildi) {
    return <Navigate to="/giris" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { girisYap } = useAuth();

  // Otomatik giriş - sadece geliştirme ortamında
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      girisYap('test-token', {
        id: 1,
        kullanici_adi: 'test',
        email: 'test@example.com',
        rol: 'admin',
        izinler: []
      });
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/giris" element={<Giris />} />

            {/* Protected routes */}
            <Route element={
              <ProtectedRoute>
                <Yerlesim />
              </ProtectedRoute>
            }>
              <Route path="/" element={<Dashboard />} />
              <Route path="/botlar" element={<Panel />} />
              <Route path="/ai-studio" element={<AIStudio />} />
              <Route path="/kullanicilar" element={<Kullanicilar />} />
              <Route path="/mesajlar" element={<Mesajlar />} />
              <Route path="/mesaj-sablonlari" element={<MesajSablonlari />} />
              <Route path="/toplu-mesaj" element={<TopluMesaj />} />
              <Route path="/zamanlanmis-mesajlar" element={<ZamanlanmisMesajlar />} />
              <Route path="/medya-kutuphanesi" element={<MedyaKutuphanesi />} />
              <Route path="/bot-ayarlari" element={<BotAyarlari />} />
              <Route path="/komut-yonetimi" element={<KomutYonetimi />} />
              <Route path="/webhook-yonetimi" element={<WebhookYonetimi />} />
              <Route path="/prompts" element={<Prompts />} />
              <Route path="/analizler" element={<Analizler />} />
              <Route path="/performans" element={<Performans />} />
              <Route path="/veritabani" element={<Veritabani />} />
              <Route path="/guvenlik" element={<Guvenlik />} />
              <Route path="/bildirimler" element={<Bildirimler />} />
              <Route path="/sistem-loglari" element={<SistemLoglari />} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;