import React from 'react';
import { X, Bell, Check, XCircle, Info, AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { create } from 'zustand';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: Date;
  read: boolean;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (notification) => 
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: Date.now().toString(),
          timestamp: new Date(),
          read: false
        },
        ...state.notifications
      ]
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    })),
  clearAll: () => set({ notifications: [] }),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true }))
    }))
}));

const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
  switch (type) {
    case 'success':
      return <Check className="text-green-500" size={20} />;
    case 'error':
      return <XCircle className="text-red-500" size={20} />;
    case 'warning':
      return <AlertTriangle className="text-yellow-500" size={20} />;
    default:
      return <Info className="text-blue-500" size={20} />;
  }
};

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { notifications, removeNotification, clearAll, markAsRead, markAllAsRead } = useNotificationStore();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Notification Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 text-gray-600 dark:text-gray-300 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="absolute right-0 mt-2 w-96 bg-white dark:bg-dark-800 rounded-xl shadow-xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b dark:border-dark-700 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Bildirimler</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {unreadCount} okunmamış bildirim
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <>
                      <button
                        onClick={() => markAllAsRead()}
                        className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                      >
                        Tümünü Okundu İşaretle
                      </button>
                      <button
                        onClick={() => clearAll()}
                        className="text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                      >
                        Temizle
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Notifications */}
              <div className="max-h-[70vh] overflow-y-auto">
                <AnimatePresence>
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="mx-auto text-gray-400 dark:text-gray-600 mb-2" size={32} />
                      <p className="text-gray-500 dark:text-gray-400">
                        Henüz bildirim yok
                      </p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`
                          p-4 border-b dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700
                          ${notification.read ? 'opacity-75' : 'bg-blue-50/50 dark:bg-blue-900/10'}
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <NotificationIcon type={notification.type} />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {notification.message}
                            </p>
                            <span className="text-xs text-gray-500 dark:text-gray-500 mt-1 block">
                              {notification.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <button
                            onClick={() => removeNotification(notification.id)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Export store for usage in other components
export { useNotificationStore };