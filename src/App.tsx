import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ControlPlaneDashboard } from './components/views/ControlPlaneDashboard';
import { DataPlaneNode } from './components/views/DataPlaneNode';
import { WinUI3Shell } from './components/layout/WinUI3Shell';
import { AppProvider, useApp, useNotifications } from './context/AppContext';
import { X } from 'lucide-react';

const NotificationContainer = () => {
  const { notifications, dismissNotification } = useNotifications();
  const activeToasts = notifications.filter(n => !n.isDismissed);
  
  return createPortal(
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none pt-4 pr-4">
      {activeToasts.map(n => (
        <div key={n.id} className={`flex items-start justify-between min-w-[320px] max-w-[400px] p-4 rounded bg-vs-panel border border-vs-border shadow-2xl pointer-events-auto animate-in slide-in-from-right-4 fade-in duration-300 border-l-[4px] shadow-black/50 ${
          n.type === 'error' ? 'border-l-vs-error' :
          n.type === 'warn' ? 'border-l-orange-500' :
          n.type === 'success' ? 'border-l-vs-success' :
          'border-l-vs-accent'
        }`}>
          <div className="flex flex-col pr-6">
              <span className={`text-[12px] font-bold uppercase tracking-wider mb-1 ${
                n.type === 'error' ? 'text-vs-error' :
                n.type === 'warn' ? 'text-orange-500' :
                n.type === 'success' ? 'text-vs-success' : 'text-vs-accent'
              }`}>{n.title}</span>
              <span className="text-[12px] text-vs-text leading-relaxed">{n.message}</span>
          </div>
          <button onClick={() => dismissNotification(n.id)} className="text-vs-text-muted hover:text-vs-text transition-colors cursor-pointer bg-transparent border-none p-1 -mr-1 -mt-1"><X size={16}/></button>
        </div>
      ))}
    </div>,
    document.body
  );
};

const AppInner = () => {
  const { activeRootView, setActiveRootView } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Guard: Don't trigger shortcuts if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.altKey && e.shiftKey) {
        if (e.key === 'Q' || e.key === 'q') {
          e.preventDefault();
          setActiveRootView('control');
        } else if (e.key === 'W' || e.key === 'w') {
          e.preventDefault();
          setActiveRootView('data');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveRootView]);

  return (
    <main className={`h-screen w-screen overflow-hidden bg-black flex p-4 pb-0 items-end justify-center relative`}>
      {/* Discreet secret trigger - focus hidden to avoid accessibility trap */}
      <button 
        className="absolute bottom-0 right-0 w-2 h-2 opacity-0 hover:opacity-10 bg-white/20 cursor-default rounded-tl-full z-50"
        onClick={() => setActiveRootView(activeRootView === 'control' ? 'data' : 'control')}
        aria-hidden="true"
        tabIndex={-1}
        title="Environment Toggle"
      />

      {/* CSS Grid routing to preserve component state on view toggle perfectly overlaid securely */}
      <div className="w-full h-full relative grid grid-cols-1 grid-rows-1">
        <div 
          className={`col-start-1 row-start-1 w-full h-full relative mx-auto rounded-t-xl overflow-hidden shadow-2xl border border-vs-border-light flex flex-col transition-opacity duration-300 ${activeRootView === 'control' ? 'opacity-100 flex pointer-events-auto z-10' : 'opacity-0 invisible pointer-events-none z-0'}`}
        >
          <ControlPlaneDashboard />
        </div>
        
        <div 
          className={`col-start-1 row-start-1 w-full h-full relative mx-auto rounded-t-xl overflow-hidden shadow-2xl flex flex-col transition-opacity duration-300 ${activeRootView === 'data' ? 'opacity-100 flex pointer-events-auto z-10' : 'opacity-0 invisible pointer-events-none z-0'}`}
        >
          <WinUI3Shell title="Data Plane Node Registration Agent - 0.9.2">
            <DataPlaneNode />
          </WinUI3Shell>
        </div>
      </div>
    </main>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppInner />
      <NotificationContainer />
    </AppProvider>
  );
}
