import React, { useState } from 'react';
import { ControlPlaneDashboard } from './components/views/ControlPlaneDashboard';
import { DataPlaneNode } from './components/views/DataPlaneNode';
import { VSCodeShell } from './components/layout/VSCodeShell';
import { Server, Grid, PlaySquare, Code2, Monitor, Terminal } from 'lucide-react';
import { WinUI3Shell } from './components/layout/WinUI3Shell';

export default function App() {
  const [activeRootView, setActiveRootView] = useState<'control' | 'data'>('control');

  // We utilize a small floating debug toolbar (mimicking an OS App Switcher or testing panel)
  // to toggle between testing the "Control Plane" Extension and the "Data Plane" Standalone node.
  const DebugToolbar = () => (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[100] flex items-center bg-vs-header border border-vs-border-light rounded shadow-2xl p-1 gap-2">
      <div className="px-2 flex items-center gap-2 mr-2 border-r border-vs-border-light text-[11px] font-mono text-gray-400">
        <Monitor size={14} className="text-green-500" />
        OS Simulator Switcher
      </div>
      <button 
        onClick={() => setActiveRootView('control')} 
        className={`px-4 py-1 text-[11px] font-medium rounded-sm transition-colors flex items-center gap-2 ${activeRootView === 'control' ? 'bg-blue-600 text-white shadow-inner' : 'text-gray-400 hover:text-white hover:bg-vs-active'}`}
      >
        <Grid size={14} /> VS Code Extension (Control Plane)
      </button>
      <button 
        onClick={() => setActiveRootView('data')} 
        className={`px-4 py-1 text-[11px] font-medium rounded-sm transition-colors flex items-center gap-2 ${activeRootView === 'data' ? 'bg-green-700 text-white shadow-inner' : 'text-gray-400 hover:text-white hover:bg-vs-active'}`}
      >
        <Server size={14} /> WinUI 3 Desktop App (Data Plane)
      </button>
    </div>
  );

  return (
    <>
      <DebugToolbar />
      <div className="h-screen w-screen overflow-hidden bg-black flex pt-12 p-4 pb-0 items-end justify-center">
        {activeRootView === 'control' ? (
          <div className="w-full h-full max-w-7xl relative mx-auto rounded-t-xl overflow-hidden shadow-2xl border border-vs-border-light flex flex-col">
            <ControlPlaneDashboard view="control-plane" onViewChange={() => {}} />
          </div>
        ) : (
          <div className="w-full h-full max-w-4xl relative mx-auto rounded-t-xl overflow-hidden shadow-2xl flex flex-col items-center justify-end">
            <WinUI3Shell title="Data Plane Node Configuration - Standalone Agent">
              <DataPlaneNode />
            </WinUI3Shell>
          </div>
        )}
      </div>
    </>
  );
}
