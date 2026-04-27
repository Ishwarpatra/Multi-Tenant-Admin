import React, { useState, useEffect } from 'react';
import { ControlPlaneDashboard } from './components/views/ControlPlaneDashboard';
import { DataPlaneNode } from './components/views/DataPlaneNode';
import { WinUI3Shell } from './components/layout/WinUI3Shell';

export default function App() {
  const [activeRootView, setActiveRootView] = useState<'control' | 'data'>('control');

  // Hidden keyboard shortcuts for stakeholder demo transitions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+P for Pilot (Control Plane)
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setActiveRootView('control');
      }
      // Ctrl+Shift+D for Data (Data Plane)
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setActiveRootView('data');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <main className="h-screen w-screen overflow-hidden bg-black flex p-4 pb-0 items-end justify-center relative">
      {/* Discreet secret trigger for demo navigation if keyboard is unavailable */}
      <button 
        className="absolute bottom-0 right-0 w-2 h-2 opacity-0 hover:opacity-10 bg-white/20 cursor-default rounded-tl-full z-[1001]"
        onClick={() => setActiveRootView(prev => prev === 'control' ? 'data' : 'control')}
        aria-hidden="true"
        title="Environment Toggle"
      />

      {activeRootView === 'control' ? (
        <div className="w-full h-full relative mx-auto rounded-t-xl overflow-hidden shadow-2xl border border-vs-border-light flex flex-col transition-all duration-500 ease-in-out">
          <ControlPlaneDashboard view="control-plane" onViewChange={() => {}} />
        </div>
      ) : (
        <div className="w-full h-full relative mx-auto rounded-t-xl overflow-hidden shadow-2xl flex flex-col transition-all duration-500 ease-in-out">
          <WinUI3Shell title="Data Plane Node Registration Agent - 0.9.2">
            <DataPlaneNode />
          </WinUI3Shell>
        </div>
      )}
    </main>
  );
}
