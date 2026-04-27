import React from 'react';
import { Activity, Settings, Files, Search, Code, LayoutGrid } from 'lucide-react';

interface VSCodeShellProps {
  children: React.ReactNode;
  activeSidebar: string;
  onSidebarChange: (id: string) => void;
  sidebarContent?: React.ReactNode;
  topBarTitle?: string;
  headerContent?: React.ReactNode;
}

import { useApp } from '../../context/AppContext';

export const VSCodeShell: React.FC<VSCodeShellProps> = ({ 
  children, 
  activeSidebar, 
  onSidebarChange, 
  sidebarContent,
  topBarTitle = "Control Plane Dashboard",
  headerContent
}) => {
  const { notifications } = useApp();
  const hasAlerts = notifications.length > 0;

  return (
    <div className="bg-vs-base min-h-screen flex flex-col font-sans text-vs-text overflow-hidden selection:bg-blue-500/30">
      
      {/* Mock VS Code Title Bar */}
      <div className="h-8 bg-vs-header flex items-center justify-center border-b border-vs-border flex-shrink-0 relative">
        <div className="absolute left-3 flex gap-2">
           <div className="w-3 h-3 rounded-full bg-vs-error border border-[#d64010]"></div>
           <div className="w-3 h-3 rounded-full bg-[#f3c800] border border-[#d4ae00]"></div>
           <div className="w-3 h-3 rounded-full bg-vs-success border border-[#009b43]"></div>
        </div>
        <span className="text-[11px] text-gray-400 font-medium tracking-wide">
          Multi-Tenant Webview (Extension Simulation) - Visual Studio Code
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
         {/* Activity Bar (Leftmost narrow strip) */}
          <nav 
            aria-label="Activity Bar"
            className="w-12 bg-vs-header border-r border-vs-border flex flex-col items-center py-2 flex-shrink-0 gap-4 z-20"
          >
             <ActivityButton label="Explorer" icon={<Files size={24} strokeWidth={1.5}/>} active={activeSidebar === 'explorer'} onClick={() => onSidebarChange('explorer')} />
             <ActivityButton label="Search" icon={<Search size={24} strokeWidth={1.5}/>} active={activeSidebar === 'search'} onClick={() => onSidebarChange('search')} />
             <ActivityButton label="Source Control" icon={<Code size={24} strokeWidth={1.5}/>} active={activeSidebar === 'source-control'} onClick={() => onSidebarChange('source-control')} />
             <ActivityButton label="Dashboard" icon={<LayoutGrid size={24} strokeWidth={1.5}/>} active={activeSidebar === 'dashboard'} onClick={() => onSidebarChange('dashboard')} />
             
             <div className="mt-auto mb-2 relative">
                <ActivityButton 
                  label="Settings" 
                  icon={<Settings size={24} strokeWidth={1.5}/>} 
                  active={activeSidebar === 'settings'} 
                  onClick={() => onSidebarChange('settings')} 
                  hasAlert={hasAlerts}
                />
             </div>
          </nav>

         {/* Primary Sidebar */}
         {sidebarContent && (
            <aside 
              aria-label="Sidebar"
              className="w-60 md:w-64 lg:w-72 max-w-[40%] bg-vs-panel border-r border-vs-border flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.2)] flex-shrink-0 transition-all duration-300"
            >
               {sidebarContent}
            </aside>
         )}
         
         {/* Main Editor Area */}
         <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-vs-base">
            {/* Mock Editor Tabs */}
            <div className="h-9 bg-vs-panel flex flex-shrink-0 relative overflow-x-auto no-scrollbar">
               <div className="px-4 h-full bg-vs-base border-t border-[#007fd4] border-r border-vs-border flex items-center gap-2 text-white min-w-[140px]">
                  <Activity size={14} className="text-vs-accent" />
                  <span className="text-[12px] italic">{topBarTitle}.tsx</span>
               </div>
            </div>

            {/* Breadcrumb / Top Header Area inside editor */}
            {headerContent && (
              <header className="min-h-7 py-1 px-4 border-b border-vs-border/40 flex items-center justify-between flex-wrap text-[11.5px] bg-vs-base text-gray-400 z-10 shrink-0 shadow-sm">
                 {headerContent}
              </header>
            )}
            
            {/* Actual Content Frame */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
               {children}
            </div>
         </div>
      </div>

      {/* VS Code Status Bar */}
      <footer className="h-6 bg-[#007fd4] text-white flex items-center px-3 justify-between text-[11px] font-medium flex-shrink-0 z-30">
        <div className="flex items-center gap-4">
           <span className="truncate">Multi-Tenant Platform Extension Host Active</span>
           <span className="hidden sm:inline-flex opacity-80 cursor-pointer hover:opacity-100">Telemetry Piped</span>
        </div>
        <div className="flex items-center gap-4 opacity-90">
           <span className="hover:opacity-100 cursor-pointer">Live Node: 1,402ms</span>
           <span className="hover:opacity-100 cursor-pointer">React Native/Web</span>
           <span className="hover:opacity-100 cursor-pointer">UTF-8</span>
        </div>
      </footer>
    </div>
  );
};

const ActivityButton = ({icon, active, onClick, label, hasAlert}: {icon: React.ReactNode, active: boolean, onClick: () => void, label: string, hasAlert?: boolean}) => (
   <button 
     onClick={onClick}
     aria-label={label}
     aria-current={active ? 'page' : undefined}
     className={`relative w-full flex justify-center py-2 cursor-pointer transition-colors border-none bg-transparent focus:outline-none focus:bg-vs-active/50 ${active ? 'text-white' : 'text-vs-text-muted hover:text-gray-300'}`}
   >
     {active && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white"></div>}
     {icon}
     {hasAlert && (
       <span className="absolute top-2 right-2 w-2 h-2 bg-vs-error rounded-full border border-vs-bg" />
     )}
   </button>
);
