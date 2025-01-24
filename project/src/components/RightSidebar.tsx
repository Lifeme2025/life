import React from 'react';
import { X, Users, MapPin, Bell } from 'lucide-react';

interface RightSidebarProps {
  onClose?: () => void;
}

export default function RightSidebar({ onClose }: RightSidebarProps) {
  return (
    <div className="h-full bg-[#0F172A] border-l border-gray-800/50 relative overflow-hidden">
      {/* Neon gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-secondary/5 opacity-50" />

      {/* Content */}
      <div className="h-full flex flex-col relative z-10">
        {/* Header */}
        <div className="p-6 border-b border-gray-800/50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Bildirimler</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto right-sidebar-scroll">
          <div className="p-6 space-y-8">
            {/* Aktif Kullanıcılar */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">
                Aktif Kullanıcılar
              </h3>
              <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-300">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <Users size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Kullanıcı #{i + 1}</p>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin size={14} />
                        <span>Türkiye</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Son Bildirimler */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">
                Son Bildirimler
              </h3>
              <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <Bell size={16} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-gray-300">Yeni mesaj alındı</p>
                        <p className="text-sm text-gray-500 mt-1">2 dakika önce</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sistem Durumu */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-4">
                Sistem Durumu
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">CPU Kullanımı</span>
                    <span className="text-primary">45%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[45%] bg-gradient-to-r from-primary to-secondary rounded-full" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">RAM Kullanımı</span>
                    <span className="text-primary">60%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[60%] bg-gradient-to-r from-primary to-secondary rounded-full" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Disk Kullanımı</span>
                    <span className="text-primary">30%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[30%] bg-gradient-to-r from-primary to-secondary rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}