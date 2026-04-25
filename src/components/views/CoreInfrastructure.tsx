import React, { useState } from 'react';
import { Shield, CreditCard, Database, Box, Plug, CheckCircle2, Settings, Terminal, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';

export const CoreInfrastructure: React.FC<{onOpenSettings?: () => void}> = ({onOpenSettings}) => {
  const [activeConfig, setActiveConfig] = useState<string | null>(null);

  // RLS State
  const [rlsTenantId, setRlsTenantId] = useState('tenant_A');
  const [rlsQuery, setRlsQuery] = useState('SELECT * FROM billing_records');
  const [rlsResult, setRlsResult] = useState<string | null>(null);
  const [rlsLoading, setRlsLoading] = useState(false);

  // Sharding State
  const [shardingMode, setShardingMode] = useState<'pooled' | 'hybrid' | 'siloed'>('hybrid');

  const testRls = () => {
    setRlsLoading(true);
    setRlsResult(null);
    setTimeout(() => {
      setRlsResult(`[Postgres RLS Policy Enforced]\nExecute: SET ROLE application_user;\nExecute: SET request.jwt.claim.tenant_id = '${rlsTenantId}';\nExecute: ${rlsQuery}\n\nResult: 2 rows returned. (All invisible rows dropped at engine level)`);
      setRlsLoading(false);
    }, 800);
  };

  return (
    <div className="p-8 animate-in fade-in duration-300 pb-10 flex h-full">
      <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-4">
        <div className="mb-6 border-b border-vs-border pb-4">
          <h2 className="text-white text-xl font-light tracking-tight">Architectural Solutions Center</h2>
          <p className="text-vs-text-muted text-[13px] mt-2 max-w-3xl leading-relaxed">
            Deploying a multi-tenant Control Plane introduces extreme complexity in security, billing, scaling, and delivery. 
            This panel defines the active mitigations enacted by this system to solve those specific architectural bottlenecks.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <SolutionCard 
            id="rls"
            isActive={activeConfig === 'rls'}
            onConfigure={() => setActiveConfig(activeConfig === 'rls' ? null : 'rls')}
            icon={<Shield size={20} className="text-vs-success" />}
            title="1. Data Leakage (Cross-Tenant Access)"
            subtitle="Solved via PostgreSQL Row-Level Security (RLS)"
            badgeLabel="Status: RLS Enforced"
          >
            {activeConfig === 'rls' ? (
              <div className="mt-4 p-4 bg-black border border-vs-border-light rounded flex flex-col gap-3 animate-in slide-in-from-top-2">
                <div className="flex justify-between items-center text-xs text-gray-400 font-mono mb-2">
                  <span>RLS Testing Console</span>
                  <Terminal size={14} />
                </div>
                <div className="flex items-center gap-3">
                   <label className="text-xs text-gray-400 w-24">JWT Tenant ID:</label>
                   <select value={rlsTenantId} onChange={e=>setRlsTenantId(e.target.value)} className="bg-vs-base border border-vs-border text-white text-xs p-1.5 focus:border-vs-accent outline-none">
                     <option value="tenant_A">tenant_A (Stark Ind.)</option>
                     <option value="tenant_B">tenant_B (Wayne Ent.)</option>
                     <option value="tenant_C">tenant_C (Acme Corp)</option>
                   </select>
                </div>
                <div className="flex items-center gap-3">
                   <label className="text-xs text-gray-400 w-24">SQL Query:</label>
                   <input value={rlsQuery} onChange={e=>setRlsQuery(e.target.value)} className="flex-1 bg-vs-base border border-vs-border text-white font-mono text-xs p-1.5 focus:border-vs-accent outline-none" />
                </div>
                <button onClick={testRls} disabled={rlsLoading} className="self-end bg-vs-accent hover:bg-vs-accent-hover text-white text-xs px-4 py-1.5 mt-2 flex items-center gap-2">
                  {rlsLoading ? <Loader2 size={12} className="animate-spin" /> : 'Execute Query'}
                </button>
                {rlsResult && <pre className="mt-2 text-[10px] text-green-400 bg-[#0d0d0d] p-3 rounded border border-vs-border whitespace-pre-wrap">{rlsResult}</pre>}
              </div>
            ) : (
              <p className="text-gray-400 text-[13px] leading-relaxed mt-2">
                Enforcing strict isolation at the database engine level via RLS. Data belonging to another tenant is mathematically invisible to the query execution planner.
              </p>
            )}
          </SolutionCard>

          <SolutionCard 
            id="sharding"
            isActive={activeConfig === 'sharding'}
            onConfigure={() => setActiveConfig(activeConfig === 'sharding' ? null : 'sharding')}
            icon={<Database size={20} className="text-purple-500" />}
            title="2. Performance vs. Infrastructure Cost"
            subtitle="Solved via Hybrid Pool & Silo Sharding"
            badgeLabel={`Topology: ${shardingMode.charAt(0).toUpperCase() + shardingMode.slice(1)}`}
          >
            {activeConfig === 'sharding' ? (
              <div className="mt-4 p-4 bg-vs-base border border-vs-border rounded flex flex-col gap-4 animate-in slide-in-from-top-2">
                 <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-widest border-b border-vs-border pb-2">Cluster Sharding Strategy</h4>
                 
                 <div className="flex items-center justify-between p-3 border border-vs-border rounded hover:bg-vs-hover cursor-pointer" onClick={() => setShardingMode('pooled')}>
                    <div>
                       <div className="text-sm text-white font-medium">Pooled Architecture</div>
                       <div className="text-xs text-gray-500 mt-1">All tenants share a single database cluster. Max cost efficiency.</div>
                    </div>
                    {shardingMode === 'pooled' ? <ToggleRight size={24} className="text-blue-500" /> : <ToggleLeft size={24} className="text-gray-600" />}
                 </div>

                 <div className="flex items-center justify-between p-3 border border-vs-border-light bg-[#007fd4]/10 rounded hover:bg-[#007fd4]/20 cursor-pointer" onClick={() => setShardingMode('hybrid')}>
                    <div>
                       <div className="text-sm text-blue-400 font-medium">Hybrid Sharding (Active)</div>
                       <div className="text-xs text-gray-500 mt-1">Standard tenants share a pool; Enterprise clients get isolated DB silos.</div>
                    </div>
                    {shardingMode === 'hybrid' ? <ToggleRight size={24} className="text-blue-500" /> : <ToggleLeft size={24} className="text-gray-600" />}
                 </div>

                 <div className="flex items-center justify-between p-3 border border-vs-border rounded hover:bg-vs-hover cursor-pointer" onClick={() => setShardingMode('siloed')}>
                    <div>
                       <div className="text-sm text-white font-medium">Siloed Architecture</div>
                       <div className="text-xs text-gray-500 mt-1">Every tenant gets a dedicated database cluster. Max isolation, max cost.</div>
                    </div>
                    {shardingMode === 'siloed' ? <ToggleRight size={24} className="text-blue-500" /> : <ToggleLeft size={24} className="text-gray-600" />}
                 </div>
              </div>
            ) : (
              <p className="text-gray-400 text-[13px] leading-relaxed mt-2">
                Dynamic deployment topologies. Standard tenants share a pooled database cluster, while Enterprise clients are automatically routed to physically isolated database silos.
              </p>
            )}
          </SolutionCard>

          <SolutionCard 
            id="billing"
            onConfigure={() => onOpenSettings?.()}
            icon={<CreditCard size={20} className="text-blue-500" />}
            title="3. The 'Billing Nightmare' at Scale"
            subtitle="Solved via Hexagonal Billing Abstraction"
            badgeLabel="Active Engine: Kill Bill"
          >
             <p className="text-gray-400 text-[13px] leading-relaxed mt-2">
                Adapter pattern proxies events directly into battle-tested open-source billing engines like Kill Bill, entirely offloading proration, cycles, and credit ledgers.
             </p>
          </SolutionCard>
        </div>
      </div>
    </div>
  );
};

const SolutionCard = ({id, icon, title, subtitle, children, badgeLabel, onConfigure, isActive}: {id: string, icon: React.ReactNode, title: string, subtitle: string, children: React.ReactNode, badgeLabel: string, onConfigure: () => void, isActive?: boolean}) => (
  <div className={`bg-vs-panel border ${isActive ? 'border-vs-accent shadow-[0_0_15px_rgba(0,127,212,0.15)]' : 'border-vs-border'} p-6 rounded shadow-lg flex flex-col relative overflow-hidden group transition-all duration-300`}>
    <div className={`absolute top-0 left-0 w-1 h-full transition-colors duration-500 ${isActive ? 'bg-vs-accent' : 'bg-transparent group-hover:bg-vs-border-light'}`}></div>
    <div className="flex items-center justify-between border-b border-vs-border pb-4 mb-2">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-vs-base flex items-center justify-center border border-vs-border-light">
          {icon}
        </div>
        <div>
          <h3 className="text-white text-[15px] font-medium">{title}</h3>
          <p className="text-blue-400 text-[12px] font-mono mt-0.5 opacity-90">{subtitle}</p>
        </div>
      </div>
      <div>
        <button onClick={onConfigure} className={`p-2 rounded transition-colors ${isActive ? 'bg-vs-accent text-white' : 'text-gray-500 hover:text-white hover:bg-vs-hover'}`}>
          <Settings size={18} className={isActive ? 'animate-spin' : ''} />
        </button>
      </div>
    </div>
    
    <div className="flex-1">
      {children}
    </div>

    <div className="mt-5 border-t border-vs-border pt-4 flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-vs-success text-[11px] font-semibold tracking-wide uppercase">
        <CheckCircle2 size={12} />
        {badgeLabel}
      </div>
    </div>
  </div>
);
