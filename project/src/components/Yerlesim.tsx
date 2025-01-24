import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import UstBar from './UstBar';
import AIAssistant from './AIAssistant';
import RightSidebar from './RightSidebar';
import { useDarkMode } from '../hooks/useDarkMode';

export default function Yerlesim() {
  const [sidebarAcik, setSidebarAcik] = React.useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = React.useState(false);
  const { isDark } = useDarkMode();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-200">
      <UstBar 
        onMenuClick={() => setSidebarAcik(!sidebarAcik)} 
        onNotificationsClick={() => setRightSidebarOpen(!rightSidebarOpen)}
        rightSidebarOpen={rightSidebarOpen}
      />
      
      <div className="flex">
        {/* Left Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-30 w-72 lg:relative
          transform transition-transform duration-300 ease-in-out
          ${sidebarAcik ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="h-full">
            <Sidebar onItemClick={() => setSidebarAcik(false)} />
          </div>
        </div>

        {/* Left Sidebar Overlay */}
        {sidebarAcik && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setSidebarAcik(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-hidden">
          <div className="max-w-7xl mx-auto custom-scrollbar">
            <Outlet />
          </div>
        </main>

        {/* Right Sidebar */}
        <div className={`
          fixed inset-y-0 right-0 z-30 w-80 lg:relative
          transform transition-transform duration-300 ease-in-out
          ${rightSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          <div className="h-full">
            <RightSidebar onClose={() => setRightSidebarOpen(false)} />
          </div>
        </div>

        {/* Right Sidebar Overlay */}
        {rightSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setRightSidebarOpen(false)}
          />
        )}
      </div>

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
}