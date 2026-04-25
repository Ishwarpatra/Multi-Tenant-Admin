import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { AlertCircle } from 'lucide-react';

const throughputData = Array.from({length: 40}).map((_, i) => ({
  time: `${i}s ago`,
  reqs: Math.floor(Math.random() * 200) + 1500 + Math.sin(i / 3) * 500
}));

export const HardwareMonitoring: React.FC = () => {
  return (
    <div className="p-8 animate-in fade-in duration-300">
      <div className="mb-8">
        <h2 className="text-white text-xl font-light tracking-tight">Data Plane Fleet Monitoring</h2>
        <p className="text-vs-text-muted text-[13px] mt-2 max-w-3xl leading-relaxed">
          Monitor the health, connection status, and real-time telemetry of all distributed Data Plane agents (local hardware nodes) operating across different networks. Featuring real-time sparkline telemetry.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-vs-bg border border-vs-border p-5 rounded flex flex-col shadow-sm relative overflow-hidden group">
          <span className="text-gray-400 text-[11px] font-semibold uppercase tracking-widest z-10 relative">Total Agents</span>
          <span className="text-4xl font-light mt-3 tracking-tight text-blue-500 z-10 relative">2,408</span>
          <span className="text-vs-text-muted text-[11px] mt-3 font-medium border-t border-vs-border pt-2 z-10 relative">Active globally</span>
        </div>
        
        {/* Real-time Telemetry Sparkline (Throughput) */}
        <div className="bg-vs-bg border border-vs-border p-5 rounded flex flex-col shadow-sm col-span-2 relative">
          <div className="flex justify-between items-start z-10">
            <span className="text-gray-400 text-[11px] font-semibold uppercase tracking-widest">Global Ingress / Throughput</span>
            <span className="text-green-500 flex items-center gap-2 text-xs font-mono">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live stream
            </span>
          </div>
          <div className="flex items-end gap-4 mt-2 mb-2 z-10">
            <span className="text-4xl font-light tracking-tight text-white">1,824<span className="text-lg text-vs-text-muted ml-1">req/s</span></span>
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
          <span className="text-vs-text-muted text-[11px] font-medium border-t border-vs-border pt-2 mt-auto z-10 relative">Piped directly to billing adapter</span>
        </div>

        {/* Static Gauge Alternative for Degraded Nodes */}
        <div className="bg-vs-bg border border-vs-border p-5 rounded flex flex-col shadow-sm">
          <span className="text-gray-400 text-[11px] font-semibold uppercase tracking-widest">Degraded Nodes</span>
          <div className="flex items-center gap-4 mt-3">
            <div className="w-16 h-16 rounded-full border-4 border-vs-border flex items-center justify-center relative">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="28" cy="28" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-vs-error opacity-100" strokeDasharray="175" strokeDashoffset="160" />
              </svg>
              <span className="text-xl font-light text-vs-error">7</span>
            </div>
            <div className="flex flex-col">
              <span className="text-vs-error font-medium text-sm flex items-center gap-1"><AlertCircle size={14}/> Critical</span>
              <span className="text-vs-text-muted text-[11px] mt-1">SLA At Risk</span>
            </div>
          </div>
          <span className="text-vs-text-muted text-[11px] mt-3 font-medium border-t border-vs-border pt-2">Requires admin attention</span>
        </div>
      </div>

      <div className="bg-vs-bg border border-vs-border rounded shadow-xl flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-vs-border flex justify-between items-center bg-vs-panel">
          <h2 className="text-white text-[14px] font-medium tracking-tight">Active Hardware Ingress Logs</h2>
          <div className="flex bg-vs-base rounded flex-row border border-vs-border p-1 text-[11px]">
            <button className="px-3 py-1 text-white bg-vs-hover rounded shadow-sm">All Regions</button>
            <button className="px-3 py-1 text-gray-500 hover:text-white">US-East</button>
            <button className="px-3 py-1 text-gray-500 hover:text-white">EU-Central</button>
          </div>
        </div>
        
        <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-vs-border bg-vs-base text-[11px] text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3 font-semibold">Node ID (HW Signature)</th>
                <th className="px-6 py-3 font-semibold">Assigned Tenant</th>
                <th className="px-6 py-3 font-semibold">Status / Telemetry</th>
                <th className="px-6 py-3 font-semibold">Capacity Fill</th>
                <th className="px-6 py-3 font-semibold">Last Heartbeat</th>
              </tr>
            </thead>
            <tbody className="text-[12px]">
              <NodeRow hw="8F3A-99B2-C711" tenant="Acme Corp" status="Online / Syncing" isOnline capacity={42} throughput="42 env/s" heartbeat="< 1s ago" />
              <NodeRow hw="77X2-11A0-BB90" tenant="Stark Industries" status="Online / Idle" isOnline capacity={5} throughput="0 env/s" heartbeat="12s ago" />
              <NodeRow hw="99Q1-88B2-DF34" tenant="Wayne Enterprises" status="High Latency" isOnline={false} isWarning capacity={85} throughput="18 env/s" heartbeat="2s ago" />
              <NodeRow hw="44A1-22C9-EE11" tenant="Cyberdyne Systems" status="Offline (Suspended)" isOnline={false} capacity={0} throughput="---" heartbeat="4 days ago" />
              <NodeRow hw="11B0-55C4-XZ92" tenant="Acme Corp" status="Online / Syncing" isOnline capacity={92} throughput="125 env/s" heartbeat="< 1s ago" />
            </tbody>
        </table>
      </div>
    </div>
  );
};

const NodeRow = ({hw, tenant, status, isOnline, isWarning, throughput, heartbeat, capacity}: {hw: string, tenant: string, status: string, isOnline: boolean, isWarning?: boolean, throughput: string, heartbeat: string, capacity: number}) => (
  <tr className="border-b border-vs-border hover:bg-vs-hover transition-colors group cursor-default">
    <td className="px-6 py-4 font-mono text-blue-400 text-[11.5px] flex items-center gap-3">
        <div className="relative flex items-center justify-center">
          {isOnline && <span className="absolute animate-ping w-2 h-2 rounded-full bg-vs-success opacity-50"></span>}
          <span className={`w-2 h-2 rounded-full z-10 ${isOnline ? 'bg-vs-success' : isWarning ? 'bg-vs-error' : 'bg-gray-500'}`}></span>
        </div>
        {hw}
    </td>
    <td className="px-6 py-4 text-white font-medium text-[12px]">{tenant}</td>
    <td className={`px-6 py-3 font-medium text-[11px] uppercase tracking-wide flex flex-col gap-1 ${isOnline ? 'text-vs-success' : isWarning ? 'text-vs-error' : 'text-gray-500'}`}>
      {status}
    </td>
    <td className="px-6 py-4 w-48">
       {/* Required Capacity Bar */}
       <div className="flex items-center gap-3">
         <div className="w-full h-2 bg-vs-base rounded overflow-hidden border border-vs-border">
           <div 
             className={`h-full ${capacity > 90 ? 'bg-vs-error' : capacity > 75 ? 'bg-yellow-500' : 'bg-blue-500'}`} 
             style={{width: `${capacity}%`}}
           ></div>
         </div>
         <span className="font-mono text-[10px] text-gray-400 w-8">{capacity}%</span>
       </div>
    </td>
    <td className="px-6 py-4 text-vs-text-muted font-mono text-[11.5px]">{heartbeat}</td>
  </tr>
);
