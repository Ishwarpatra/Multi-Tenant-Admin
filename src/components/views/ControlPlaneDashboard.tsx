import React from 'react';
import { Shield, Users, CreditCard, Server, Activity, ShieldAlert } from 'lucide-react';
import { VSCodeShell } from '../layout/VSCodeShell';
import { HardwareMonitoring } from './HardwareMonitoring';
import { CoreInfrastructure } from './CoreInfrastructure';
import { SecretsVault } from './SecretsVault';

interface DashboardProps {
  view: string;
  onViewChange: (view: string) => void;
}

export const ControlPlaneDashboard: React.FC<DashboardProps> = ({ view, onViewChange }) => {
  // Map our App-level views to the sidebar options
  const [activeTab, setActiveTab] = React.useState(view === 'control-plane' ? 'hardware' : 'secrets');

  // To support the routing appropriately via Sidebar clicks
  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const currentTabName = 
    activeTab === 'infrastructure' ? 'Core Architecture' :
    activeTab === 'secrets' ? 'Secrets Vault' :
    activeTab === 'hardware' ? 'Node Telemetry' : 'Control Plane';

  // VS Code Sidebar Content definitions
  const SidebarContent = (
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
              label="Secrets Vault.env" 
              active={activeTab === 'secrets'} 
              onClick={() => handleNavClick('secrets')} 
            />
            <NavItem 
              icon={<Server size={14} className="text-blue-500" />} 
              label="Node Telemetry.tsx" 
              active={activeTab === 'hardware'} 
              onClick={() => handleNavClick('hardware')} 
            />
         </nav>
      </div>

      <div className="p-4 border-t border-vs-border text-[10px] text-gray-500 flex justify-between items-center bg-vs-base">
         <span>Platform Host: Embedded Extension</span>
      </div>
    </>
  );

  return (
    <VSCodeShell
      activeSidebar="explorer"
      onSidebarChange={() => {}}
      sidebarContent={SidebarContent}
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
      {activeTab === 'infrastructure' && <CoreInfrastructure />}
      {activeTab === 'hardware' && <HardwareMonitoring />}
      {activeTab === 'secrets' && <SecretsVault />}
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
