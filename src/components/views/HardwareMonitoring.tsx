import React, { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { AlertCircle, Monitor, Loader2, Info } from 'lucide-react';

interface NodeData {
  hw: string;
  tenant: string;
  region: string;
  isOnline: boolean;
  isWarning: boolean;
  isCritical: boolean;
  capacity: number;
  throughput: string;
  heartbeat: string;
}

const INITIAL_NODES: NodeData[] = [
  { hw: '8F3A-99B2-C711', tenant: 'Acme Corp', region: 'US-East', isOnline: true, isWarning: false, isCritical: false, capacity: 42, throughput: '42 env/s', heartbeat: '< 1s ago' },
  { hw: '77X2-11A0-BB90', tenant: 'Stark Industries', region: 'EU-Central', isOnline: true, isWarning: false, isCritical: false, capacity: 5, throughput: '0 env/s', heartbeat: '12s ago' },
  { hw: '99Q1-88B2-DF34', tenant: 'Wayne Enterprises', region: 'US-East', isOnline: false, isWarning: true, isCritical: true, capacity: 85, throughput: '18 env/s', heartbeat: '2s ago' },
  { hw: '44A1-22C9-EE11', tenant: 'Cyberdyne Systems', region: 'US-East', isOnline: false, isWarning: false, isCritical: false, capacity: 0, throughput: '---', heartbeat: '4 days ago' },
  { hw: '11B0-55C4-XZ92', tenant: 'Acme Corp', region: 'EU-Central', isOnline: true, isWarning: false, isCritical: true, capacity: 92, throughput: '125 env/s', heartbeat: '< 1s ago' },
];

export const HardwareMonitoring: React.FC = () => {
  const [filterRegion, setFilterRegion] = useState<string>('All Regions');
  const [filterCriticalOnly, setFilterCriticalOnly] = useState(false);
  
  const [nodes, setNodes] = useState<NodeData[]>(INITIAL_NODES);
  const [isErrorState, setIsErrorState] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  
  const [throughputData, setThroughputData] = useState(Array.from({length: 40}).map((_, i) => ({
    time: `${40 - i}s ago`,
    reqs: Math.floor(Math.random() * 200) + 1500 + Math.sin(i / 3) * 500
  })));

  const totalReqsStr = throughputData[throughputData.length - 1].reqs.toLocaleString();

  useEffect(() => {
    if (isErrorState || isSeeding) return;

    const interval = setInterval(() => {
      // Update Sparkline
      setThroughputData(prev => {
        const newData = [...prev.slice(1)];
        const lastVal = newData[newData.length - 1].reqs;
        const jump = (Math.random() - 0.5) * 400;
        newData.push({
          time: 'now',
          reqs: Math.max(800, Math.min(3000, Math.floor(lastVal + jump)))
        });
        return newData;
      });

      // Update Nodes
      setNodes(prev => prev.map(n => {
        if (!n.isOnline && !n.isWarning) return n;
        
        const capacityJump = (Math.random() - 0.5) * 10;
        const newCap = Math.max(0, Math.min(100, Math.floor(n.capacity + capacityJump)));
        const newThroughput = n.isOnline ? `${Math.floor(Math.random() * 100 + (newCap * 2))} env/s` : n.throughput;
        
        return {
          ...n,
          capacity: newCap,
          throughput: newThroughput,
          heartbeat: n.isOnline ? '< 1s ago' : n.heartbeat,
          isCritical: newCap > 85
        };
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, [isErrorState, isSeeding]);

  const criticalCount = nodes.filter(n => n.isCritical).length;

  const filteredNodes = nodes.filter(n => {
    if (filterRegion !== 'All Regions' && n.region !== filterRegion) return false;
    if (filterCriticalOnly && !n.isCritical) return false;
    return true;
  });

  const handleRetry = () => {
    setIsSeeding(true);
    setIsErrorState(false);
    setTimeout(() => {
      setIsSeeding(false);
      setNodes(INITIAL_NODES);
    }, 2000);
  };

  const EmptyState = ({ title, message, icon: Icon }: { title: string, message: string, icon: any }) => (
    <div className="flex flex-col items-center justify-center p-20 text-center bg-vs-panel/30 border border-vs-border border-dashed rounded-lg animate-in fade-in zoom-in duration-500">
      <div className="w-16 h-16 rounded-full bg-vs-base border border-vs-border flex items-center justify-center mb-6 shadow-xl text-vs-text-muted">
        <Icon size={32} strokeWidth={1} />
      </div>
      <h3 className="text-white text-lg font-medium mb-2">{title}</h3>
      <p className="text-vs-text-muted text-sm max-w-sm leading-relaxed mb-8">{message}</p>
      <button 
        onClick={handleRetry}
        className="bg-vs-accent hover:bg-vs-accent-hover text-white px-6 py-2 rounded-sm text-sm font-medium transition-all shadow-lg active:scale-95 cursor-pointer border-none"
      >
        Retry Connection
      </button>
    </div>
  );

  if (isErrorState) {
    return (
      <div className="p-8 h-full flex flex-col justify-center">
        <EmptyState 
          title="Telemetry Connection Lost" 
          message="The Control Plane has lost the WebSocket pipe to the ingestion stream. This could be due to a regional failure in the buffer cluster."
          icon={AlertCircle}
        />
      </div>
    );
  }

  if (isSeeding) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center text-vs-text-muted gap-4">
        <Loader2 className="animate-spin text-vs-accent" size={32} />
        <span className="text-sm font-mono tracking-widest uppercase">Re-establishing mTLS Handshake...</span>
      </div>
    );
  }

  return (
    <main className="p-8 animate-in fade-in duration-300">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-white text-xl font-light tracking-tight">Data Plane Fleet Monitoring</h2>
          <p className="text-vs-text-muted text-[13px] mt-2 max-w-3xl leading-relaxed">
            Monitor the health, connection status, and real-time telemetry of all distributed Data Plane agents (local hardware nodes) operating across different networks. Featuring real-time sparkline telemetry.
          </p>
        </div>
        <button 
          onClick={() => setIsErrorState(true)}
          className="text-[10px] text-vs-error opacity-40 hover:opacity-100 uppercase tracking-widest font-bold border border-vs-error/20 px-2 py-1 rounded bg-transparent cursor-pointer"
        >
          [Simulate Crash]
        </button>
      </div>

      {nodes.length === 0 ? (
        <EmptyState 
          title="No Data Plane Nodes Detected" 
          message="You have not registered any hardware nodes to this tenant yet. Use the Data Plane agent on your local machine to begin registration."
          icon={Monitor}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-vs-bg border border-vs-border p-5 rounded flex flex-col shadow-sm relative overflow-hidden group">
              <span className="text-gray-400 text-[11px] font-semibold uppercase tracking-widest z-10 relative">Total Agents</span>
              <span className="text-4xl font-light mt-3 tracking-tight text-vs-accent z-10 relative">2,408</span>
              <span className="text-vs-text-muted text-[11px] mt-3 font-medium border-t border-vs-border pt-2 z-10 relative">Active globally</span>
            </div>
            
            <div className="bg-vs-bg border border-vs-border p-5 rounded flex flex-col shadow-sm md:col-span-2 relative">
              <div className="flex justify-between items-start z-10">
                <span className="text-gray-400 text-[11px] font-semibold uppercase tracking-widest">Global Ingress / Throughput</span>
                <span className="text-vs-success flex items-center gap-2 text-xs font-mono">
                  <span className="w-2 h-2 bg-vs-success rounded-full animate-ping"></span>
                  Live stream
                </span>
              </div>
              <div className="flex items-end gap-4 mt-2 mb-2 z-10">
                <span className="text-4xl font-light tracking-tight text-white">{totalReqsStr}<span className="text-lg text-vs-text-muted ml-1">req/s</span></span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-24 opacity-80 pointer-events-none">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={throughputData}>
                    <defs>
                      <linearGradient id="colorReqs" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#007fd4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#007fd4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="reqs" stroke="#007fd4" strokeWidth={2} fillOpacity={1} fill="url(#colorReqs)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <span className="text-vs-text-muted text-[11px] font-medium border-t border-vs-border pt-2 mt-auto z-10 relative">Piped directly to Redis Streams</span>
            </div>

            <button 
              aria-label="Filter critical nodes"
              aria-pressed={filterCriticalOnly}
              className={`bg-vs-bg border p-5 rounded flex flex-col shadow-sm cursor-pointer transition-all text-left focus:outline-none focus:ring-2 focus:ring-vs-error ${filterCriticalOnly ? 'border-vs-error bg-vs-error/10' : 'border-vs-border hover:border-vs-error/50'}`}
              onClick={() => setFilterCriticalOnly(!filterCriticalOnly)}
            >
              <span className="text-gray-400 text-[11px] font-semibold uppercase tracking-widest">Degraded Nodes</span>
              <div className="flex items-center gap-4 mt-3">
                <div className="w-16 h-16 rounded-full border-4 border-vs-border flex items-center justify-center relative">
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle cx="28" cy="28" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-vs-error opacity-100 transition-all duration-500" strokeDasharray="175" strokeDashoffset={175 - (criticalCount / nodes.length * 175)} />
                  </svg>
                  <span className="text-xl font-light text-vs-error">{criticalCount}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-vs-error font-medium text-sm flex items-center gap-1"><AlertCircle size={14}/> Critical</span>
                  <span className="text-vs-text-muted text-[11px] mt-1">SLA At Risk</span>
                </div>
              </div>
              <span className="text-vs-text-muted text-[11px] mt-3 font-medium border-t border-vs-border pt-2">
                 {filterCriticalOnly ? 'Filtering view (Click to clear)' : 'Requires admin attention (Click to filter)'}
              </span>
            </button>
          </div>

          <div className="bg-vs-bg border border-vs-border rounded-sm shadow-xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-vs-border flex justify-between items-center bg-vs-panel flex-wrap gap-4">
              <h2 className="text-white text-[14px] font-medium tracking-tight">Active Hardware Ingress Logs</h2>
              <div className="flex bg-vs-base rounded-sm flex-row border border-vs-border p-1 text-[11px]" role="group" aria-label="Region filters">
                {['All Regions', 'US-East', 'EU-Central'].map(r => (
                   <button 
                     key={r}
                     onClick={() => setFilterRegion(r)}
                     aria-current={filterRegion === r}
                     className={`px-3 py-1 rounded-sm shadow-sm transition-colors border-none cursor-pointer ${filterRegion === r ? 'text-white bg-vs-active' : 'text-gray-500 hover:text-white bg-transparent'}`}
                   >
                     {r}
                   </button>
                ))}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-vs-border bg-vs-base text-[11px] text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-3 font-semibold">Node ID (HW)</th>
                      <th className="px-6 py-3 font-semibold">Region / Tenant</th>
                      <th className="px-6 py-3 font-semibold">Status / Telemetry</th>
                      <th className="px-6 py-3 font-semibold w-64">Capacity Fill</th>
                      <th className="px-6 py-3 font-semibold">Last Heartbeat</th>
                    </tr>
                  </thead>
                  <tbody className="text-[12px]">
                    {filteredNodes.map(node => (
                       <NodeRow key={node.hw} {...node} />
                    ))}
                    {filteredNodes.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-12 text-center text-vs-text-muted italic bg-vs-panel/20">No nodes match the selected region or health filter.</td></tr>
                    )}
                  </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </main>
  );
};

const NodeRow = ({hw, tenant, region, isOnline, isWarning, isCritical, throughput, heartbeat, capacity}: NodeData) => (
  <tr className="border-b border-vs-border hover:bg-vs-hover transition-colors group cursor-default">
    <td className="px-6 py-4 font-mono text-vs-accent text-[11.5px] flex items-center gap-3">
        <div className="relative flex items-center justify-center">
          {isOnline && <span className="absolute animate-ping w-2 h-2 rounded-full bg-vs-success opacity-50"></span>}
          <span className={`w-2 h-2 rounded-full z-10 ${isOnline ? 'bg-vs-success' : isWarning ? 'bg-orange-500' : 'bg-gray-500'}`}></span>
        </div>
        {hw}
    </td>
    <td className="px-6 py-4 text-white font-medium text-[12px]">
       <div>{tenant}</div>
       <div className="text-[10px] text-vs-text-muted font-mono mt-0.5 uppercase tracking-wide">{region}</div>
    </td>
    <td className={`px-6 py-3 font-medium text-[11px] uppercase tracking-wide flex flex-col gap-1 ${isOnline ? 'text-vs-success' : isWarning ? 'text-orange-500' : 'text-gray-500'}`}>
      {isOnline ? 'Online / Syncing' : isWarning ? 'High Latency' : 'Offline'}
      <span className="text-vs-text-muted font-mono lowercase tracking-normal font-normal">{throughput}</span>
    </td>
    <td className="px-6 py-4">
       <div className="flex items-center gap-3">
         <div className="w-full h-2 bg-vs-base rounded overflow-hidden border border-vs-border">
           <div 
             className={`h-full transition-all duration-300 ${isCritical ? 'bg-vs-error' : capacity > 75 ? 'bg-yellow-500' : 'bg-vs-accent'}`} 
             style={{width: `${capacity}%`}}
           ></div>
         </div>
         <span className={`font-mono text-[10px] w-8 ${isCritical ? 'text-vs-error font-bold' : 'text-vs-text-muted'}`}>{capacity}%</span>
       </div>
    </td>
    <td className="px-6 py-4 text-vs-text-muted font-mono text-[11.5px]">{heartbeat}</td>
  </tr>
);
