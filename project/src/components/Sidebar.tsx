import { Bot, Users, MessageSquare, Settings, BarChart2, Zap, Database, Shield, Bell, Terminal, MessageCircle, Calendar, BookTemplate as Template, Send, Clock, Layout, FileText, Radio, Sparkles, Home } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import React from 'react';

interface SidebarProps {
  onItemClick?: () => void;
}

export default function Sidebar({ onItemClick }: SidebarProps) {
  const MenuItem = ({ to, icon: Icon, children }: { to: string; icon: any; children: React.ReactNode }) => (
    <NavLink
      to={to}
      onClick={onItemClick}
      className={({ isActive }) =>
        `nav-item group relative overflow-hidden ${isActive ? 'active' : ''}`
      }
    >
      {/* Hover gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="p-1.5 rounded-lg transition-colors duration-200 group-hover:text-primary">
          <Icon size={20} strokeWidth={2} />
        </div>
        <span className="text-sm font-medium">{children}</span>
      </div>

      {/* Active indicator */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-l-full bg-gradient-to-b from-primary to-secondary opacity-0 transform scale-0 transition-all duration-300 group-[.active]:opacity-100 group-[.active]:scale-100" />
    </NavLink>
  );

  const MenuSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-6">
      <h3 className="px-4 mb-2 text-xs font-bold text-gray-400 dark:text-dark-text-soft uppercase tracking-wider">{title}</h3>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );

  return (
    <aside className="h-[calc(100vh-4rem)] w-72 glass-panel rounded-r-2xl">
      <div className="h-full p-4 overflow-y-auto left-sidebar-scroll">
        <nav className="space-y-6">
          {/* Ana Menü */}
          <MenuSection title="Ana Menü">
            <MenuItem to="/" icon={Home}>Dashboard</MenuItem>
            <MenuItem to="/botlar" icon={Bot}>Botlar</MenuItem>
            <MenuItem to="/kullanicilar" icon={Users}>Kullanıcılar</MenuItem>
            <MenuItem to="/mesajlar" icon={MessageSquare}>Mesajlar</MenuItem>
          </MenuSection>

          {/* AI Kontrol */}
          <MenuSection title="AI Kontrol">
            <MenuItem to="/ai-studio" icon={Sparkles}>AI Studio</MenuItem>
            <MenuItem to="/prompts" icon={MessageCircle}>AI Prompts</MenuItem>
          </MenuSection>

          {/* Mesajlaşma */}
          <MenuSection title="Mesajlaşma">
            <MenuItem to="/mesaj-sablonlari" icon={Template}>Mesaj Şablonları</MenuItem>
            <MenuItem to="/toplu-mesaj" icon={Send}>Toplu Mesaj</MenuItem>
            <MenuItem to="/zamanlanmis-mesajlar" icon={Clock}>Zamanlanmış Mesajlar</MenuItem>
            <MenuItem to="/medya-kutuphanesi" icon={Layout}>Medya Kütüphanesi</MenuItem>
          </MenuSection>

          {/* Bot Yönetimi */}
          <MenuSection title="Bot Yönetimi">
            <MenuItem to="/bot-ayarlari" icon={Settings}>Bot Ayarları</MenuItem>
            <MenuItem to="/komut-yonetimi" icon={FileText}>Komut Yönetimi</MenuItem>
            <MenuItem to="/webhook-yonetimi" icon={Radio}>Webhook Yönetimi</MenuItem>
          </MenuSection>

          {/* İstatistikler */}
          <MenuSection title="İstatistikler">
            <MenuItem to="/analizler" icon={BarChart2}>Analizler</MenuItem>
            <MenuItem to="/performans" icon={Zap}>Performans</MenuItem>
          </MenuSection>

          {/* Sistem */}
          <MenuSection title="Sistem">
            <MenuItem to="/veritabani" icon={Database}>Veritabanı</MenuItem>
            <MenuItem to="/guvenlik" icon={Shield}>Güvenlik</MenuItem>
            <MenuItem to="/bildirimler" icon={Bell}>Bildirimler</MenuItem>
            <MenuItem to="/sistem-loglari" icon={Terminal}>Sistem Logları</MenuItem>
          </MenuSection>
        </nav>
      </div>
    </aside>
  );
}