import { LogOut, Menu, Sun, Moon, Search, Bell } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDarkMode } from '../hooks/useDarkMode';

interface UstBarProps {
  onMenuClick: () => void;
  onNotificationsClick: () => void;
  rightSidebarOpen: boolean;
}

export default function UstBar({ onMenuClick, onNotificationsClick, rightSidebarOpen }: UstBarProps) {
  const { cikisYap } = useAuth();
  const { isDark, setIsDark } = useDarkMode();

  return (
    <header className="sticky top-0 z-10 glass-panel">
      <div className="max-w-full mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-xl hover:bg-gray-100/50 dark:hover:bg-white/[0.02] lg:hidden"
            >
              <Menu size={24} className="text-gray-600 dark:text-dark-text" />
            </button>
            
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Ara..."
                className="input pl-10 w-64"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNotificationsClick}
              className={`
                p-2 glass-button rounded-xl relative
                ${rightSidebarOpen ? 'text-primary' : ''}
              `}
              title="Bildirimler"
            >
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>
            
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 glass-button rounded-xl"
              title={isDark ? 'Açık Tema' : 'Koyu Tema'}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={cikisYap}
              className="flex items-center gap-2 px-4 py-2 glass-button rounded-xl"
            >
              <LogOut size={20} />
              <span className="hidden sm:inline">Çıkış Yap</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}