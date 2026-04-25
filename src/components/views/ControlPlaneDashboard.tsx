import React, { useState } from 'react';
import { Shield, Server, ShieldAlert, Code2, Search, Settings } from 'lucide-react';
import { VSCodeShell } from '../layout/VSCodeShell';
import { HardwareMonitoring } from './HardwareMonitoring';
import { CoreInfrastructure } from './CoreInfrastructure';
import { SecretsVault } from './SecretsVault';
import { LocalEnvManager } from './LocalEnvManager';
import { SettingsView } from './SettingsView';

interface DashboardProps {
  view: string;
  onViewChange: (view: string) => void;
}

export const ControlPlaneDashboard: React.FC<DashboardProps> = ({ view, onViewChange }) => {
  const [activeSidebar, setActiveSidebar] = useState<string>('explorer');
  const [activeTab, setActiveTab] = useState('hardware');

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
        <div className="flex items-center text-vs-text-muted gap-1">
           <span className="hover:text-white cursor-pointer px-1">src</span>
           <span className="opacity-50">❯</span>
           <span className="hover:text-white cursor-pointer px-1">views</span>
           <span className="opacity-50">❯</span>
           <span className="hover:text-white cursor-pointer px-1 text-blue-400">{currentTabName}.tsx</span>
        </div>
      }
    >
      <div className={activeTab === 'infrastructure' ? 'block h-full' : 'hidden'}><CoreInfrastructure onOpenSettings={() => setActiveTab('settings')} /></div>
      <div className={activeTab === 'hardware' ? 'block h-full' : 'hidden'}><HardwareMonitoring /></div>
      <div className={activeTab === 'secrets' ? 'block h-full' : 'hidden'}><SecretsVault /></div>
      <div className={activeTab === 'localenv' ? 'block h-full' : 'hidden'}><LocalEnvManager /></div>
      <div className={activeTab === 'settings' ? 'block h-full' : 'hidden'}><SettingsView /></div>
    </VSCodeShell>
  );
};

const NavItem = ({icon, label, active, onClick}: {icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void}) => (
  <div 
    onClick={onClick} 
    className={`px-3 py-1.5 ml-2 flex items-center gap-2 text-[12px] cursor-pointer transition-colors border border-transparent 
      ${active ? 'bg-vs-active text-white border-vs-border-light' : 'text-gray-400 hover:bg-vs-hover hover:text-gray-200'}
    `}
  >
     {icon}
     <span className="truncate">{label}</span>
  </div>
);
