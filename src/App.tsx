import { useState } from 'react';
import { 
  X, Cpu, Key, AlertCircle, CheckCircle, Loader2, 
  LayoutDashboard, Users, CreditCard, Server, Activity, Search, Bell,
  Shield, Database, Box, Plug, CheckCircle2, Settings
} from 'lucide-react';

function DataPlaneDialog() {
  const [status, setStatus] = useState<'idle' | 'validating' | 'error' | 'success'>('idle');
  const [licenseKey, setLicenseKey] = useState('');

  const handleActivate = () => {
    setStatus('validating');
    // Simulate complex hardware validation and network delay as described in the document
    setTimeout(() => {
      // Simple mock validation logic
      if (licenseKey.trim() === 'VALID-KEY') {
        setStatus('success');
      } else {
        setStatus('error');
      }
    }, 2000);
  };

  const handleReset = () => {
    setStatus('idle');
    setLicenseKey('');
  };

  return (
    <div 
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      className="w-[500px] bg-[#1e1e1e] rounded-lg shadow-2xl border border-[#3c3c3c] flex flex-col select-none overflow-hidden pointer-events-auto"
    >
      {/* Title Bar */}
      <div className="h-10 border-b border-[#3c3c3c] flex items-center justify-between px-4 bg-[#2d2d2d]">
        <div className="flex items-center gap-2.5">
          <Cpu size={14} className="text-blue-500" aria-hidden="true" />
          <span id="dialog-title" className="text-[11.5px] font-medium text-gray-300">Data Plane: Local Hardware Node Setup</span>
        </div>
        <div className="flex items-center -mr-4">
          <button 
            onClick={handleReset}
            aria-label="Close configuration dialog"
            className="hover:bg-[#e81123] hover:text-white p-3 cursor-pointer transition-colors text-gray-400 bg-transparent border-0 outline-none"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div 
        className="p-8 text-[12px] text-[#cccccc] flex-1 flex flex-col bg-[#1e1e1e]"
        aria-live="polite"
        aria-atomic="true"
      >
        {(status === 'idle' || status === 'validating') && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-[#252526] p-4 border border-[#3c3c3c] rounded flex items-start gap-3 shadow-inner">
              <Cpu size={18} className="text-gray-400 mt-0.5" aria-hidden="true" />
              <div>
                <h2 className="text-white text-lg font-light mb-1 border-b border-transparent">Hardware Fingerprint</h2>
                {/* Simulating cryptographic hash generation from Motherboard & CPU ID */}
                <div className="font-mono text-blue-500 text-xs">H(ID_mb || ID_cpu) = 8F3A-99B2-C711</div>
                <div className="text-[11px] text-gray-500 mt-1">This physical signature will be mapped to a Tenant on the Control Plane.</div>
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <label htmlFor="license-key-input" className="block text-[11px] text-gray-300 font-semibold">One-Time Setup Key</label>
              <div className="relative">
                <Key size={14} className="absolute left-3 top-2.5 text-[#888888]" aria-hidden="true" />
                <input
                  id="license-key-input"
                  type="text"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  placeholder="Enter proxy key (Try: VALID-KEY)"
                  aria-required="true"
                  disabled={status === 'validating'}
                  className="w-full bg-[#3c3c3c] border border-[#454545] rounded-sm pl-9 pr-3 py-2 text-[12px] text-white focus:outline-none focus:border-blue-600 placeholder:text-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
                />
              </div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center py-4 space-y-3 animate-in fade-in duration-300">
            {/* Utilizing Deep Orange 600 (#F4511E) for error state as specified in the document */}
            <AlertCircle size={40} color="#F4511E" aria-hidden="true" />
            <h2 className="text-white text-lg font-light" role="alert">Connection Rejected</h2>
            <div className="text-center text-gray-500 text-[12px] max-w-[320px]">
              The provided setup key is invalid or not registered in the Central Control Plane. Telemetry routing denied.
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center justify-center py-4 space-y-3 animate-in fade-in duration-300">
            <CheckCircle size={40} className="text-[#00B050]" aria-hidden="true" />
            <h2 className="text-white text-lg font-light">Hardware ID Handshake Complete</h2>
            <div className="text-center text-gray-500 text-[12px] max-w-[320px]">
              This proxy node is now securely registered. Billing and API metering data will now pipe asynchronously to the Control Plane.
            </div>
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="h-16 bg-[#1e1e1e] border-t border-[#3c3c3c] flex items-center justify-end px-6 gap-3">
        {(status === 'idle' || status === 'validating' || status === 'error') && (
          <button
            onClick={handleReset}
            disabled={status === 'validating'}
            className="px-8 py-1.5 text-[12px] text-gray-300 bg-[#3a3d41] hover:bg-[#45494e] border border-[#454545] rounded-sm transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
        {(status === 'idle' || status === 'validating') && (
          <button
            onClick={handleActivate}
            disabled={status === 'validating' || !licenseKey}
            className="min-w-[100px] px-4 py-1.5 text-[12px] text-white bg-[#0e639c] hover:bg-[#1177bb] rounded-sm transition-all shadow-[0_1px_3px_rgba(0,0,0,0.3)] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed border border-transparent flex items-center justify-center gap-2"
          >
            {status === 'validating' ? (
              <>
                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                <span>Connecting...</span>
              </>
            ) : (
              'Connect Node'
            )}
          </button>
        )}
        {status === 'error' && (
          <button
            onClick={handleReset}
            className="px-8 py-1.5 text-[12px] text-white bg-[#0e639c] hover:bg-[#1177bb] rounded-sm transition-all shadow-[0_1px_3px_rgba(0,0,0,0.3)] focus:outline-none border border-transparent"
          >
            Retry
          </button>
        )}
        {status === 'success' && (
          <button
            onClick={handleReset}
            className="px-8 py-1.5 text-[12px] text-white bg-[#0e639c] hover:bg-[#1177bb] rounded-sm transition-all shadow-[0_1px_3px_rgba(0,0,0,0.3)] focus:outline-none border border-transparent"
          >
            Close & Start Proxy
          </button>
        )}
      </div>
    </div>
  );
}

const ControlPlaneDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'infrastructure' | 'hardware-nodes'>('hardware-nodes');

  return (
    <div className="w-full h-full flex bg-[#1e1e1e] text-[#cccccc] font-sans selection:bg-blue-500/30 animate-in fade-in duration-300">
      {/* Sidebar */}
      <div className="w-60 bg-[#252526] border-r border-[#3c3c3c] flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.2)] flex-shrink-0">
        {/* Logo area */}
        <div className="h-14 border-b border-[#3c3c3c] flex items-center px-5 gap-3 bg-[#2d2d2d]">
          <div className="w-5 h-5 bg-blue-500 rounded-sm flex items-center justify-center shadow-md shadow-blue-500/20">
             <div className="w-2.5 h-2.5 border-2 border-white transform rotate-45"></div>
          </div>
          <span className="font-semibold text-white text-[13px] tracking-wide">Multi-Tenant Admin</span>
        </div>
        
        {/* Nav */}
        <div className="flex-1 py-5">
          <div className="px-5 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Platform Control</div>
          <nav className="space-y-0.5 mt-2">
            <NavItem icon={<LayoutDashboard size={14}/>} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <NavItem icon={<Shield size={14}/>} label="Security & Infrastructure" active={activeTab === 'infrastructure'} onClick={() => setActiveTab('infrastructure')} />
            <NavItem icon={<Users size={14}/>} label="Tenants (Companies)" />
            <NavItem icon={<CreditCard size={14}/>} label="Billing & Subscriptions" />
            <NavItem icon={<Server size={14}/>} label="Hardware Nodes" active={activeTab === 'hardware-nodes'} onClick={() => setActiveTab('hardware-nodes')} />
            <NavItem icon={<Activity size={14}/>} label="Usage Metering" />
          </nav>
        </div>

        <div className="p-4 border-t border-[#3c3c3c] text-[10px] text-gray-500 flex justify-between items-center bg-[#1e1e1e]/50">
          <span>Self-Hosted Instance</span>
          <span className="px-1.5 py-0.5 bg-[#3c3c3c] rounded-sm text-gray-300 border border-[#454545]">v2.4.0</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#0d0d0d]">
        {/* Topbar */}
        <div className="h-14 border-b border-[#3c3c3c] flex items-center justify-between px-8 bg-[#1e1e1e] z-10 shadow-[0_4px_24px_rgba(0,0,0,0.2)]">
           <h1 className="text-white font-medium text-[14px]">
             {activeTab === 'overview' ? 'Control Plane: Billing & Node Mapping' : 
              activeTab === 'infrastructure' ? 'System Architecture & Solutions Toolkit' :
              'Data Plane Monitoring'}
           </h1>
           <div className="flex items-center gap-5">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="bg-[#2d2d2d] border border-[#454545] rounded-sm pl-9 pr-3 py-1.5 w-64 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-500 shadow-inner" 
                />
              </div>
              <div className="relative">
                <Bell size={16} className="text-gray-400 cursor-pointer hover:text-white transition-colors" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#F4511E] rounded-full border border-[#1e1e1e]"></span>
              </div>
           </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
           {activeTab === 'overview' && (
             <div className="animate-in fade-in duration-300">
               {/* Metrics Row */}
               <div className="grid grid-cols-3 gap-6 mb-8">
                  <MetricCard title="Active Hardware Nodes" value="2,408" trend="+12 this week connecting via Proxy" />
                  <MetricCard title="API Requests Metered (24h)" value="14.2M" trend="~ 800 events/sec piped to Billing engine" isBlue />
                  <MetricCard title="Prepaid Credits Burned" value="482,500" trend="Active burndown processing..." />
               </div>

               {/* Tenants Table */}
               <div className="bg-[#1e1e1e] border border-[#3c3c3c] rounded shadow-xl flex flex-col overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#3c3c3c] flex justify-between items-center bg-[#252526]">
                     <div>
                       <h2 className="text-white text-[14px] font-medium tracking-tight">Tenant Hardware Mapping</h2>
                       <p className="text-gray-500 text-[12px] mt-1">Links local desktop vault physical signatures to billing accounts</p>
                     </div>
                     <button className="bg-[#0e639c] hover:bg-[#1177bb] text-white px-5 py-2 text-xs rounded-sm transition-all shadow-[0_1px_3px_rgba(0,0,0,0.3)] focus:outline-none">Provision New Tenant</button>
                  </div>
                  
                  <table className="w-full text-left border-collapse">
                     <thead>
                       <tr className="border-b border-[#3c3c3c] bg-[#1e1e1e] text-[11px] text-gray-400 uppercase tracking-wider">
                         <th className="px-6 py-3 font-semibold">Reporting Company</th>
                         <th className="px-6 py-3 font-semibold">Registered HW Signature</th>
                         <th className="px-6 py-3 font-semibold">API Calls (MTD)</th>
                         <th className="px-6 py-3 font-semibold">Remaining Credits</th>
                         <th className="px-6 py-3 font-semibold">Billing State</th>
                       </tr>
                     </thead>
                     <tbody className="text-[12px]">
                       <TableRow company="Acme Corp" hw="8F3A-99B2-C711" usage="142,000" credits="8,500" status="Healthy" statusColor="text-[#00B050]" />
                       <TableRow company="Stark Industries" hw="77X2-11A0-BB90" usage="4,820,000" credits="1,200" status="Low Balance" statusColor="text-[#F4511E]" />
                       <TableRow company="Wayne Enterprises" hw="99Q1-88B2-DF34" usage="890,500" credits="120,000" status="Healthy" statusColor="text-[#00B050]" />
                       <TableRow company="Cyberdyne Systems" hw="44A1-22C9-EE11" usage="12,400" credits="0" status="Suspended" statusColor="text-gray-500" />
                     </tbody>
                  </table>
               </div>
             </div>
           )}

           {activeTab === 'infrastructure' && (
             <div className="space-y-6 animate-in fade-in duration-300 pb-10">
                <div className="mb-8">
                  <h2 className="text-white text-xl font-light tracking-tight">Architectural Solutions Center</h2>
                  <p className="text-gray-500 text-[13px] mt-2 max-w-3xl leading-relaxed">
                    Deploying a multi-tenant Control Plane introduces extreme complexity in security, billing, scaling, and delivery. 
                    This panel defines the active mitigations enacted by this system to solve those specific architectural bottlenecks.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Solution 1 */}
                  <SolutionCard 
                    icon={<Shield size={20} className="text-[#00B050]" />}
                    title="1. Data Leakage (Cross-Tenant Access)"
                    subtitle="Solved via PostgreSQL Row-Level Security (RLS)"
                    description="Instead of relying on application-level logic which is prone to human error, we enforce strict isolation at the database engine level. Every SQL query automatically inherits a session variable injected by our Auth middleware. Data belonging to another tenant is mathematically invisible to the database execution planner."
                    badgeLabel="Status: RLS Enforced"
                  />

                  {/* Solution 2 */}
                  <SolutionCard 
                    icon={<CreditCard size={20} className="text-blue-500" />}
                    title="2. The 'Billing Nightmare' at Scale"
                    subtitle="Solved via Hexagonal Billing Abstraction"
                    description="Do not build custom multi-tenant billing logic. Our architecture uses an adapter pattern to proxy events directly into battle-tested open-source billing engines. Webhooks from the proxy node increment usage meters in systems like Kill Bill, completely offloading proration, cycles, and credit ledgers."
                    badgeLabel="Active Engine: Kill Bill"
                  />

                  {/* Solution 3 */}
                  <SolutionCard 
                    icon={<Database size={20} className="text-purple-500" />}
                    title="3. Performance vs. Infrastructure Cost"
                    subtitle="Solved via Hybrid Pool & Silo Sharding"
                    description="Our dashboard supports dynamic deployment topologies. Standard tenants share a pooled database cluster (cost-optimized), while Enterprise clients are automatically routed to physically isolated database silos. The application layer handles connection string routing seamlessly."
                    badgeLabel="Topology: Hybrid Sharded"
                  />

                  {/* Solution 4 */}
                  <SolutionCard 
                    icon={<Box size={20} className="text-orange-500" />}
                    title="4. Ops & Maintenance (Self-Hosted)"
                    subtitle="Solved via Immutable Infrastructure as Code"
                    description="To prevent a steep learning curve for enterprise clients deploying this internally, the entire Control Plane is packaged as a unified Helm chart and Docker Compose kit. Updates are delivered as immutable, pre-configured containers, enabling 'one-click' upgrades on air-gapped networks."
                    badgeLabel="Deploy Kits: GitOps Ready"
                  />

                  {/* Solution 5 */}
                  <div className="col-span-2">
                    <SolutionCard 
                      icon={<Plug size={20} className="text-teal-500" />}
                      title="5. Avoiding Vendor Lock-in"
                      subtitle="Solved via Open-Core Microservices"
                      description="By hosting the database (PostgreSQL), memory store (Redis), and billing layer entirely through open-source equivalents inside the self-hosted Docker container, our clients are completely insulated from third-party vendor APIs, fee hikes, and lock-in. Everything required to run the Control Plane offline is included."
                      badgeLabel="Stack: Fully Independent"
                    />
                  </div>
                </div>
             </div>
           )}

           {activeTab === 'hardware-nodes' && (
             <div className="animate-in fade-in duration-300">
               <div className="mb-8">
                  <h2 className="text-white text-xl font-light tracking-tight">Data Plane Fleet Monitoring</h2>
                  <p className="text-gray-500 text-[13px] mt-2 max-w-3xl leading-relaxed">
                    Monitor the health, connection status, and real-time telemetry of all distributed Data Plane agents (local hardware nodes) operating across different networks. Incoming API hit streams are automatically piped to the active billing engine.
                  </p>
               </div>

               {/* Metrics Row */}
               <div className="grid grid-cols-4 gap-4 mb-6">
                  <MetricCard title="Total Connected Agents" value="2,408" trend="Across 141 Tenants" isBlue />
                  <MetricCard title="Global Throughput" value="1,824" trend="Events / sec" />
                  <MetricCard title="Avg Node Latency" value="48ms" trend="Control Plane heartbeat" />
                  <div className="bg-[#1e1e1e] border border-[#3c3c3c] p-5 rounded flex flex-col shadow-md">
                    <span className="text-gray-400 text-[11px] font-semibold uppercase tracking-widest">Degraded Nodes</span>
                    <span className="text-3xl font-light mt-3 tracking-tight text-[#F4511E] flex items-center gap-2">
                       <AlertCircle size={28} />
                       7
                    </span>
                    <span className="text-gray-500 text-[11px] mt-3 font-medium border-t border-[#3c3c3c] pt-2">Requires admin attention</span>
                  </div>
               </div>

               {/* Telemetry Table */}
               <div className="bg-[#1e1e1e] border border-[#3c3c3c] rounded shadow-xl flex flex-col overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#3c3c3c] flex justify-between items-center bg-[#252526]">
                     <div>
                       <h2 className="text-white text-[14px] font-medium tracking-tight">Active Hardware Ingress (Real-Time)</h2>
                     </div>
                     <div className="flex bg-[#1e1e1e] rounded flex-row border border-[#3c3c3c] p-1">
                        <button className="px-3 py-1 text-xs text-white bg-[#3c3c3c] rounded shadow-[0_1px_2px_rgba(0,0,0,0.5)]">All</button>
                        <button className="px-3 py-1 text-xs text-gray-400 hover:text-white">Degraded</button>
                     </div>
                  </div>
                  
                  <table className="w-full text-left border-collapse">
                     <thead>
                       <tr className="border-b border-[#3c3c3c] bg-[#1e1e1e] text-[11px] text-gray-400 uppercase tracking-wider">
                         <th className="px-6 py-3 font-semibold">Node ID (HW Signature)</th>
                         <th className="px-6 py-3 font-semibold">Assigned Tenant</th>
                         <th className="px-6 py-3 font-semibold">Status</th>
                         <th className="px-6 py-3 font-semibold">Throughput</th>
                         <th className="px-6 py-3 font-semibold">Last Heartbeat</th>
                       </tr>
                     </thead>
                     <tbody className="text-[12px]">
                       <NodeRow hw="8F3A-99B2-C711" tenant="Acme Corp" status="Online / Syncing" isOnline throughput="42 env/s" heartbeat="< 1s ago" />
                       <NodeRow hw="77X2-11A0-BB90" tenant="Stark Industries" status="Online / Idle" isOnline throughput="0 env/s" heartbeat="12s ago" />
                       <NodeRow hw="99Q1-88B2-DF34" tenant="Wayne Enterprises" status="High Latency" isOnline={false} isWarning throughput="18 env/s" heartbeat="2s ago" />
                       <NodeRow hw="44A1-22C9-EE11" tenant="Cyberdyne Systems" status="Offline (Suspended)" isOnline={false} throughput="---" heartbeat="4 days ago" />
                       <NodeRow hw="11B0-55C4-XZ92" tenant="Acme Corp" status="Online / Syncing" isOnline throughput="125 env/s" heartbeat="< 1s ago" />
                     </tbody>
                  </table>
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

const NavItem = ({icon, label, active, onClick}: {icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void}) => (
   <div onClick={onClick} className={`px-5 py-2.5 flex items-center gap-3 text-[12px] cursor-pointer transition-colors ${active ? 'bg-[#37373d] text-white border-l-2 border-blue-500' : 'text-gray-400 hover:bg-[#2a2d2e] hover:text-gray-200 border-l-2 border-transparent'}`}>
      {icon}
      <span>{label}</span>
   </div>
);

const MetricCard = ({title, value, trend, isBlue}: {title: string, value: string, trend: string, isBlue?: boolean}) => (
   <div className="bg-[#1e1e1e] border border-[#3c3c3c] p-6 rounded flex flex-col shadow-md hover:border-[#555] transition-colors">
      <span className="text-gray-400 text-[11px] font-semibold uppercase tracking-widest">{title}</span>
      <span className={`text-4xl font-light mt-4 tracking-tight ${isBlue ? 'text-blue-500' : 'text-white'}`}>{value}</span>
      <span className="text-gray-500 text-[11px] mt-3 font-medium border-t border-[#3c3c3c] pt-3">{trend}</span>
   </div>
);

const SolutionCard = ({icon, title, subtitle, description, badgeLabel}: {icon: React.ReactNode, title: string, subtitle: string, description: string, badgeLabel: string}) => (
  <div className="bg-[#252526] border border-[#3c3c3c] p-6 rounded shadow-lg flex flex-col relative overflow-hidden group">
    <div className="absolute top-0 left-0 w-1 h-full bg-[#3c3c3c] group-hover:bg-blue-500 transition-colors duration-500"></div>
    <div className="flex items-center gap-4 border-b border-[#3c3c3c] pb-4 mb-4">
      <div className="w-10 h-10 rounded-full bg-[#1e1e1e] flex items-center justify-center border border-[#454545]">
        {icon}
      </div>
      <div>
        <h3 className="text-white text-[15px] font-medium">{title}</h3>
        <p className="text-blue-400 text-[12px] font-mono mt-0.5 opacity-90">{subtitle}</p>
      </div>
    </div>
    <p className="text-gray-400 text-[13px] leading-relaxed flex-1">
      {description}
    </p>
    <div className="mt-5 pt-4 border-t border-[#3c3c3c] flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-[#00B050] text-[11px] font-semibold tracking-wide uppercase">
        <CheckCircle2 size={12} />
        {badgeLabel}
      </div>
      <button className="text-gray-500 hover:text-white transition-colors focus:outline-none">
        <Settings size={14} />
      </button>
    </div>
  </div>
);

const TableRow = ({company, hw, usage, credits, status, statusColor}: {company: string, hw: string, usage: string, credits: string, status: string, statusColor: string}) => (
   <tr className="border-b border-[#3c3c3c] hover:bg-[#2a2d2e] transition-colors group cursor-default">
      <td className="px-6 py-4 text-white font-medium">{company}</td>
      <td className="px-6 py-4 font-mono text-blue-400 text-[11.5px] opacity-80 group-hover:opacity-100 transition-opacity">{hw}</td>
      <td className="px-6 py-4 text-gray-300 font-mono text-[12px]">{usage}</td>
      <td className="px-6 py-4 text-gray-300 font-mono text-[12px]">{credits} <span className="text-gray-500 text-[10px] ml-1">CR</span></td>
      <td className={`px-6 py-4 font-medium text-[11px] uppercase tracking-wide flex items-center gap-2 mt-1.5 ${statusColor}`}>
        <span className={`w-1.5 h-1.5 rounded-full shadow-sm ${status === 'Suspended' ? 'bg-gray-500' : status === 'Low Balance' ? 'bg-[#F4511E] shadow-[#F4511E]/50' : 'bg-[#00B050] shadow-[#00B050]/50'}`}></span>
        {status}
      </td>
   </tr>
);

const NodeRow = ({hw, tenant, status, isOnline, isWarning, throughput, heartbeat}: {hw: string, tenant: string, status: string, isOnline: boolean, isWarning?: boolean, throughput: string, heartbeat: string}) => (
   <tr className="border-b border-[#3c3c3c] hover:bg-[#2a2d2e] transition-colors group cursor-default">
      <td className="px-6 py-4 font-mono text-blue-400 text-[11.5px] flex items-center gap-3">
         <div className="relative flex items-center justify-center">
           {isOnline && <span className="absolute animate-ping w-2 h-2 rounded-full bg-[#00B050] opacity-50"></span>}
           <span className={`w-2 h-2 rounded-full z-10 ${isOnline ? 'bg-[#00B050]' : isWarning ? 'bg-[#F4511E]' : 'bg-gray-500'}`}></span>
         </div>
         {hw}
      </td>
      <td className="px-6 py-4 text-white font-medium text-[12px]">{tenant}</td>
      <td className={`px-6 py-4 font-medium text-[11px] uppercase tracking-wide ${isOnline ? 'text-[#00B050]' : isWarning ? 'text-[#F4511E]' : 'text-gray-500'}`}>
        {status}
      </td>
      <td className="px-6 py-4 text-gray-300 font-mono text-[12px]">{throughput}</td>
      <td className="px-6 py-4 text-gray-500 font-mono text-[11.5px]">{heartbeat}</td>
   </tr>
);

export default function App() {
  const [view, setView] = useState<'data-plane' | 'control-plane'>('control-plane');

  return (
    <div className="bg-[#0d0d0d] min-h-screen flex flex-col font-['Segoe_UI',_Tahoma,_Geneva,_Verdana,_sans-serif] text-[#cccccc] overflow-hidden">
      
      {/* Dev Environment Prototype Switcher Bar */}
      <div className="h-12 border-b border-[#1177bb] bg-[#0e639c]/10 flex flex-shrink-0 items-center justify-center gap-3 px-4 shadow-[0_4px_16px_rgba(0,0,0,0.4)] z-50">
        <div className="flex items-center gap-2 mr-6 text-blue-400">
           <Activity size={16} />
           <span className="text-[11px] font-bold uppercase tracking-widest">Downloaded Cloud Architecture</span>
        </div>
        
        <button
          onClick={() => setView('data-plane')}
          className={`px-5 py-1.5 text-[12px] font-medium rounded-sm transition-all border ${view === 'data-plane' ? 'bg-[#0e639c] text-white border-[#0e639c] shadow-[0_0_10px_rgba(14,99,156,0.5)]' : 'bg-[#1e1e1e] text-gray-400 border-[#3c3c3c] hover:text-white hover:bg-[#2d2d2d]'}`}
        >
          1. The Data Plane (Local Node)
        </button>
        
        <span className="text-gray-500 text-[10px] px-2 font-mono">=== HTTP Event PIPE ==={'>>'}</span>
        
        <button
          onClick={() => setView('control-plane')}
          className={`px-5 py-1.5 text-[12px] font-medium rounded-sm transition-all border ${view === 'control-plane' ? 'bg-[#0e639c] text-white border-[#0e639c] shadow-[0_0_10px_rgba(14,99,156,0.5)]' : 'bg-[#1e1e1e] text-gray-400 border-[#3c3c3c] hover:text-white hover:bg-[#2d2d2d]'}`}
        >
          2. The Control Plane (Billing Dashboard)
        </button>
      </div>

      {/* Dynamic Render Area */}
      <div className="flex-1 overflow-hidden relative flex">
         {view === 'data-plane' ? (
           <div className="flex-1 flex items-center justify-center bg-[#0d0d0d]">
             <DataPlaneDialog />
           </div>
         ) : (
           <ControlPlaneDashboard />
         )}
      </div>
      
    </div>
  );
}
