import React, { useState, useEffect } from 'react';
import { ControlPlaneDashboard } from './components/views/ControlPlaneDashboard';
import { DataPlaneNode } from './components/views/DataPlaneNode';
import { WinUI3Shell } from './components/layout/WinUI3Shell';
import { AppProvider, useApp } from './context/AppContext';

const AppInner = () => {
  const { activeRootView, setActiveRootView, settings } = useApp();

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
    <main 
      className={`h-screen w-screen overflow-hidden bg-black flex p-4 pb-0 items-end justify-center relative theme-${settings.theme}`}
      style={{ fontSize: `${settings.fontSize}px` }}
    >
      {/* Discreet secret trigger - focus hidden to avoid accessibility trap */}
      <button 
        className="absolute bottom-0 right-0 w-2 h-2 opacity-0 hover:opacity-10 bg-white/20 cursor-default rounded-tl-full z-[1001]"
        onClick={() => setActiveRootView(activeRootView === 'control' ? 'data' : 'control')}
        aria-hidden="true"
        tabIndex={-1}
        title="Environment Toggle"
      />

      {/* CSS-based routing to preserve component state on view toggle */}
      <div 
        className={`w-full h-full relative mx-auto rounded-t-xl overflow-hidden shadow-2xl border border-vs-border-light flex flex-col transition-opacity duration-300 ${activeRootView === 'control' ? 'opacity-100 flex' : 'opacity-0 hidden'}`}
      >
        <ControlPlaneDashboard view="control-plane" onViewChange={() => {}} />
      </div>
      
      <div 
        className={`w-full h-full relative mx-auto rounded-t-xl overflow-hidden shadow-2xl flex flex-col transition-opacity duration-300 ${activeRootView === 'data' ? 'opacity-100 flex' : 'opacity-0 hidden'}`}
      >
        <WinUI3Shell title="Data Plane Node Registration Agent - 0.9.2">
          <DataPlaneNode />
        </WinUI3Shell>
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
