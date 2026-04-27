import React, { useState } from 'react';
import { 
  Files, Search, Code, Code2, LayoutGrid, Settings, 
  Database, Activity, Shield, ShieldAlert, Key, Bell, X, Info, AlertTriangle, CheckCircle, Server 
} from 'lucide-react';
import { VSCodeShell } from '../layout/VSCodeShell';
import { HardwareMonitoring } from './HardwareMonitoring';
import { CoreInfrastructure } from './CoreInfrastructure';
import { SecretsVault } from './SecretsVault';
import { LocalEnvManager } from './LocalEnvManager';
import { SettingsView } from './SettingsView';
import { useApp, useNotifications } from '../../context/AppContext';

interface DashboardProps {
  view: string;
  onViewChange: (view: string) => void;
}

export const ControlPlaneDashboard: React.FC<DashboardProps> = ({ view, onViewChange }) => {
  const { notifications, dismissNotification } = useNotifications();
  const [activeSidebar, setActiveSidebar] = useState<string>('explorer');
  const [activeTab, setActiveTab] = useState('hardware');
  const [showNotifications, setShowNotifications] = useState(false);

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const currentTabName = 
    activeTab === 'infrastructure' ? 'Core Architecture' :
    activeTab === 'secrets' ? 'Secrets Vault' :
    activeTab === 'localenv' ? 'Local .env Manager' :
    activeTab === 'settings' ? 'Settings' :
    activeTab === 'hardware' ? 'Node Telemetry' : 'Control Plane';

  // Different Sidebars based on activity bar selection
  const ExplorerSidebar = (
    <>
      <div className="px-5 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-vs-border bg-vs-header flex justify-between items-center">
         <span>EXPLORER</span>
         <span>...</span>
      </div>
      <div className="flex-1 py-2 overflow-y-auto custom-scrollbar">
         <div className="px-5 py-2 text-[10.5px] font-bold text-gray-400 font-mono tracking-wider flex items-center group cursor-pointer hover:text-gray-200">
           <span>▼</span><span className="ml-2">MULTI-TENANT-ADMIN</span>
         </div>
         <nav className="space-y-0.5 mt-1 border-l border-vs-border ml-6 pl-1">
            <NavItem 
              icon={<Shield size={14} className="text-yellow-500" />} 
              label="Core Architecture.ts" 
              active={activeTab === 'infrastructure'} 
              onClick={() => handleNavClick('infrastructure')} 
            />
            <NavItem 
              icon={<ShieldAlert size={14} className="text-purple-500" />} 
              label="Cloud Secrets Vault.env" 
              active={activeTab === 'secrets'} 
              onClick={() => handleNavClick('secrets')} 
            />
            <NavItem 
              icon={<Code2 size={14} className="text-[#007fd4]" />} 
              label="Local Workspace .env" 
              active={activeTab === 'localenv'} 
              onClick={() => handleNavClick('localenv')} 
            />
            <NavItem 
              icon={<Server size={14} className="text-blue-500" />} 
              label="Node Telemetry.tsx" 
              active={activeTab === 'hardware'} 
              onClick={() => handleNavClick('hardware')} 
            />
         </nav>
      </div>
    </>
  );

  const SearchSidebar = (
    <div className="p-4 flex flex-col h-full text-vs-text">
       <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">SEARCH</div>
       <input type="text" placeholder="Search" className="bg-vs-base border border-vs-border p-1 text-[11px] outline-none focus:border-[#007fd4] w-full mb-2" />
       <input type="text" placeholder="Replace" className="bg-vs-base border border-vs-border p-1 text-[11px] outline-none focus:border-[#007fd4] w-full" />
    </div>
  );

  const SettingsSidebar = (
    <div className="p-4 flex flex-col h-full text-vs-text">
       <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">SETTINGS</div>
       <div className="text-[12px] text-gray-400">Manage extension preferences and cloud sync.</div>
    </div>
  );

  const getSidebarContent = () => {
    switch (activeSidebar) {
      case 'explorer': return ExplorerSidebar;
      case 'search': return SearchSidebar;
      case 'settings': {
        if (activeTab !== 'settings') setActiveTab('settings');
        return null;
      }
      default: return (
        <div className="p-4 text-xs text-gray-500 uppercase tracking-widest">
           {activeSidebar} view
        </div>
      );
    }
  };

  return (
    <VSCodeShell
      activeSidebar={activeSidebar}
      onSidebarChange={(id) => {
        setActiveSidebar(id);
        if (id === 'settings') setActiveTab('settings');
      }}
      sidebarContent={getSidebarContent()}
      topBarTitle={currentTabName}
      headerContent={
        <div className="flex items-center gap-4 w-full">
           <div className="flex items-center gap-1">
             <span className="text-vs-text-muted tracking-tight text-[11px]">app</span>
             <span className="text-vs-text-muted">/</span>
             <span className="text-vs-text">{currentTabName.toLowerCase().replace(/\s+/g, '-')}</span>
           </div>
           
           <div className="ml-auto flex items-center gap-3">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-1 rounded-sm transition-colors border-none bg-transparent cursor-pointer hover:bg-vs-active ${showNotifications ? 'text-vs-accent bg-vs-active' : 'text-vs-text-muted'}`}
                aria-label="Notifications"
              >
                 <Bell size={16} />
                 {notifications.length > 0 && (
                   <span className="absolute -top-1 -right-1 w-4 h-4 bg-vs-error text-white text-[9px] flex items-center justify-center rounded-full border border-vs-base font-bold">
                     {notifications.length}
                   </span>
                 )}
              </button>
           </div>
        </div>
      }
    >
      <div className="relative h-full w-full overflow-hidden">
        <div className={activeTab === 'infrastructure' ? 'block h-full' : 'hidden'}><CoreInfrastructure onOpenSettings={() => setActiveTab('settings')} /></div>
        <div className={activeTab === 'hardware' ? 'block h-full' : 'hidden'}><HardwareMonitoring isVisible={activeTab === 'hardware'} /></div>
        <div className={activeTab === 'secrets' ? 'block h-full' : 'hidden'}><SecretsVault /></div>
        <div className={activeTab === 'localenv' ? 'block h-full' : 'hidden'}><LocalEnvManager /></div>
        <div className={activeTab === 'settings' ? 'block h-full' : 'hidden'}><SettingsView /></div>

        {/* Notification Panel Overlay */}
        {showNotifications && (
          <div className="absolute top-0 right-0 w-80 h-full bg-vs-bg border-l border-vs-border z-[100] shadow-2xl flex flex-col animate-in slide-in-from-right-4 duration-300">
             <header className="px-4 py-3 border-b border-vs-border flex items-center justify-between bg-vs-panel">
                <span className="text-[11px] font-bold uppercase tracking-widest text-vs-text-muted">Notification Center</span>
                <button onClick={() => setShowNotifications(false)} className="text-vs-text-muted hover:text-white bg-transparent border-none cursor-pointer">
                  <X size={16} />
                </button>
             </header>
             <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {notifications.length > 0 ? notifications.map(n => (
                  <div key={n.id} className={`p-3 rounded-sm border-l-2 bg-vs-panel shadow-sm animate-in slide-in-from-right-2 duration-300 relative group
                    ${n.type === 'error' ? 'border-vs-error' : n.type === 'warn' ? 'border-orange-500' : n.type === 'success' ? 'border-vs-success' : 'border-vs-accent'}
                  `}>
                    <button 
                      onClick={() => dismissNotification(n.id)}
                      className="absolute top-2 right-2 p-1 text-vs-text-muted hover:text-white opacity-0 group-hover:opacity-100 transition-opacity bg-transparent border-none cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {n.type === 'error' && <AlertTriangle size={14} className="text-vs-error" />}
                        {n.type === 'warn' && <AlertTriangle size={14} className="text-orange-500" />}
                        {n.type === 'success' && <CheckCircle size={14} className="text-vs-success" />}
                        {n.type === 'info' && <Info size={14} className="text-vs-accent" />}
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="text-[12px] font-bold text-white truncate">{n.title}</div>
                         <div className="text-[11px] text-vs-text-muted mt-1 leading-relaxed">{n.message}</div>
                         <div className="text-[9px] text-vs-text-muted mt-2 opacity-50 font-mono italic">{n.timestamp.toLocaleTimeString()}</div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center text-vs-text-muted opacity-30 mt-20">
                    <Bell size={40} strokeWidth={1} />
                    <span className="text-[11px] uppercase tracking-widest mt-4">No unread alerts</span>
                  </div>
                )}
             </div>
             {notifications.length > 0 && (
               <footer className="p-2 border-t border-vs-border bg-vs-panel">
                 <button 
                   onClick={() => notifications.forEach(n => dismissNotification(n.id))}
                   className="w-full py-1.5 text-[10px] font-bold uppercase tracking-widest text-vs-text-muted hover:text-white hover:bg-vs-active rounded-sm transition-all border-none bg-transparent cursor-pointer"
                 >
                   Clear All History
                 </button>
               </footer>
             )}
          </div>
        )}
      </div>
    </VSCodeShell>
  );
};

const NavItem = ({icon, label, active, onClick}: {icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void}) => (
  <button 
    onClick={onClick} 
    aria-current={active ? 'page' : undefined}
    className={`w-full px-3 py-1.5 ml-2 flex items-center gap-2 text-[12px] cursor-pointer transition-colors border border-transparent text-left outline-none focus:ring-1 focus:ring-vs-accent bg-transparent
      ${active ? 'bg-vs-active text-white border-vs-border-light' : 'text-gray-400 hover:bg-vs-hover hover:text-gray-200'}
    `}
  >
     {icon}
     <span className="truncate">{label}</span>
  </button>
);
