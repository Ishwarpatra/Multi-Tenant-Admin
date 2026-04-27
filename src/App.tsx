import React, { useState, useEffect } from 'react';
import { ControlPlaneDashboard } from './components/views/ControlPlaneDashboard';
import { DataPlaneNode } from './components/views/DataPlaneNode';
import { WinUI3Shell } from './components/layout/WinUI3Shell';
import { AppProvider, useApp, useNotifications } from './context/AppContext';
import { X } from 'lucide-react';

const AppInner = () => {
  const { activeRootView, setActiveRootView, settings } = useApp();
  const { notifications, dismissNotification } = useNotifications();

  useEffect(() => {
    document.documentElement.style.fontSize = `${settings.fontSize}px`;
  }, [settings.fontSize]);

  // Hidden keyboard shortcuts for stakeholder demo transitions (Alt+Shift+Q/W)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Use Alt+Shift to avoid conflicts with VS Code / Browser shortcuts
      if (e.altKey && e.shiftKey) {
        if (e.key === 'Q' || e.key === 'q') {
          e.preventDefault();
          e.stopPropagation();
          setActiveRootView('control');
        } else if (e.key === 'W' || e.key === 'w') {
          e.preventDefault();
          e.stopPropagation();
          setActiveRootView('data');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveRootView]);

  return (
    <main className={`h-screen w-screen overflow-hidden bg-black flex p-4 pb-0 items-end justify-center relative theme-${settings.theme}`}>
      {/* Discreet secret trigger - focus hidden to avoid accessibility trap */}
      <button 
        className="absolute bottom-0 right-0 w-2 h-2 opacity-0 hover:opacity-10 bg-white/20 cursor-default rounded-tl-full z-50"
        onClick={() => setActiveRootView(activeRootView === 'control' ? 'data' : 'control')}
        aria-hidden="true"
        tabIndex={-1}
        title="Environment Toggle"
      />

      {/* CSS-based routing to preserve component state on view toggle */}
      <div 
        className={`w-full h-full relative mx-auto rounded-t-xl overflow-hidden shadow-2xl border border-vs-border-light flex flex-col transition-opacity duration-300 ${activeRootView === 'control' ? 'opacity-100 flex pointer-events-auto' : 'opacity-0 invisible absolute inset-0 pointer-events-none'}`}
      >
        <ControlPlaneDashboard view="control-plane" onViewChange={() => {}} />
      </div>
      
      <div 
        className={`w-full h-full relative mx-auto rounded-t-xl overflow-hidden shadow-2xl flex flex-col transition-opacity duration-300 ${activeRootView === 'data' ? 'opacity-100 flex pointer-events-auto' : 'opacity-0 invisible absolute inset-0 pointer-events-none'}`}
      >
        <WinUI3Shell title="Data Plane Node Registration Agent - 0.9.2">
          <DataPlaneNode />
        </WinUI3Shell>
      </div>

      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none pt-4 pr-4">
        {notifications.map(n => (
          <div key={n.id} className={`flex items-start justify-between min-w-[300px] max-w-[400px] p-3 rounded-sm shadow-xl pointer-events-auto animate-in slide-in-from-right fade-in border border-l-4 bg-vs-panel ${
            n.type === 'error' ? 'border-vs-error border-l-vs-error' :
            n.type === 'warn' ? 'border-yellow-600/30 border-l-yellow-600' :
            n.type === 'success' ? 'border-vs-success/30 border-l-vs-success' :
            'border-vs-border border-l-vs-accent text-white'
          }`}>
            <div className="flex flex-col pr-4">
               <span className={`text-xs font-semibold mb-1 ${
                 n.type === 'error' ? 'text-vs-error' :
                 n.type === 'warn' ? 'text-yellow-600' :
                 n.type === 'success' ? 'text-vs-success' : 'text-vs-accent'
               }`}>{n.title}</span>
               <span className="text-xs text-vs-text">{n.message}</span>
            </div>
            <button onClick={() => dismissNotification(n.id)} className="text-gray-400 hover:text-white cursor-pointer -mt-1 p-1"><X size={14}/></button>
          </div>
        ))}
      </div>
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
