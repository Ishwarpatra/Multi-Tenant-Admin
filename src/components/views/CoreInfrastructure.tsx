import React, { useState } from 'react';
import { 
  Shield, CreditCard, Database, Box, Plug, CheckCircle2, 
  Settings, Terminal, ToggleLeft, ToggleRight, Loader2, 
  Activity, Lock, GitBranch, Cpu 
} from 'lucide-react';
import { VSCodeSelect } from '../ui/VSCodeSelect';

export const CoreInfrastructure: React.FC<{onOpenSettings?: () => void}> = ({onOpenSettings}) => {
  const [activeConfig, setActiveConfig] = useState<string | null>(null);

  // RLS State simulation
  const [rlsTenantId, setRlsTenantId] = useState('tenant_A');
  const [rlsQuery, setRlsQuery] = useState('SELECT * FROM billing_records');
  const [rlsResult, setRlsResult] = useState<string | null>(null);
  const [rlsLoading, setRlsLoading] = useState(false);

  const testRls = () => {
    if (!rlsQuery.toLowerCase().startsWith('select')) {
      setRlsLoading(true);
      setTimeout(() => {
        setRlsResult(`[SQL SYNTAX ERROR]
Unauthorized Mutation attempt detected. Multi-tenant RLS policies strictly enforce read-only operations via the analytics mirror.
Trace: RBAC_DENY_NON_SELECT_OP`);
        setRlsLoading(false);
      }, 500);
      return;
    }

    setRlsLoading(true);
    setRlsResult(null);
    let randomDropped = 0;
    let rowCount = 0;
    
    if (rlsTenantId === 'tenant_A') {
      rowCount = 2;
      randomDropped = 1402;
    } else if (rlsTenantId === 'tenant_B') {
      rowCount = 48;
      randomDropped = 845;
    } else {
      rowCount = 0;
      randomDropped = 2190;
    }

    setTimeout(() => {
      setRlsResult(`[Postgres RLS Policy Enforced]
Execute: SET ROLE application_user;
Execute: SET request.jwt.claim.tenant_id = '${rlsTenantId}';
Execute: ${rlsQuery}

Result: ${rowCount} rows returned. 
(Note: ${randomDropped} records belonging to other tenants were dropped at the DB engine level before execution planner returned results.)`);
      setRlsLoading(false);
    }, 800);
  };

  return (
    <main className="p-8 animate-in fade-in duration-300 pb-10 flex h-full flex-col overflow-hidden bg-vs-base">
      <header className="mb-6 border-b border-vs-border pb-4 flex-shrink-0">
        <h2 className="text-vs-text text-xl font-light tracking-tight">Architectural Solutions Center</h2>
        <p className="text-vs-text-muted text-[13px] mt-2 max-w-4xl leading-relaxed">
          The Control Plane implements a Zero-Trust, high-availability architecture designed to mitigate the five critical 
          bottlenecks of multi-tenant system design. Every solution is enforced at the infrastructure level rather than the application layer.
        </p>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-4 pb-12">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Solution 1: RLS Isolation */}
          <SolutionCard 
            id="rls"
            isActive={activeConfig === 'rls'}
            onConfigure={() => setActiveConfig(activeConfig === 'rls' ? null : 'rls')}
            icon={<Shield size={20} className="text-vs-success" />}
            title="1. Database-Level Tenant Isolation"
            subtitle="PostgreSQL Row-Level Security (RLS)"
            badgeLabel="Status: Engine-Level Isolation Active"
          >
            {activeConfig === 'rls' ? (
              <div className="mt-4 p-4 bg-black border border-vs-border-light rounded flex flex-col gap-3 animate-in slide-in-from-top-2">
                <div className="flex justify-between items-center text-xs text-gray-400 font-mono mb-2">
                  <span>SQL RLS Simulator</span>
                  <Terminal size={14} />
                </div>
                <div className="flex flex-col gap-3">
                   <div className="flex items-center gap-3">
                      <label htmlFor="rls-tenant" className="text-xs text-gray-400 w-24">Injected Tenant:</label>
                      <VSCodeSelect 
                        value={rlsTenantId} 
                        onChange={(v) => setRlsTenantId(v)} 
                        options={['tenant_A', 'tenant_B', 'tenant_C']}
                        labels={{
                          'tenant_A': 'Stark Industries (A)',
                          'tenant_B': 'Wayne Enterprises (B)',
                          'tenant_C': 'Acme Corp (C)'
                        }}
                        className="w-48"
                      />
                   </div>
                   <div className="flex items-center gap-3">
                      <label htmlFor="rls-query" className="text-xs text-gray-400 w-24">Query Payload:</label>
                      <input 
                        id="rls-query"
                        value={rlsQuery} 
                        onChange={e=>setRlsQuery(e.target.value)} 
                        className="flex-1 bg-vs-base border border-vs-border text-vs-text font-mono text-xs p-1.5 focus:border-vs-accent outline-none rounded-sm" 
                      />
                   </div>
                </div>
                <button 
                  onClick={testRls} 
                  disabled={rlsLoading} 
                  className="self-end bg-vs-accent hover:bg-vs-accent-hover text-vs-text text-xs px-4 py-2 mt-2 flex items-center gap-2 rounded-sm transition-colors shadow-lg"
                >
                  {rlsLoading ? <Loader2 size={12} className="animate-spin" /> : 'Apply Security Policy'}
                </button>
                {rlsResult && <pre className="mt-2 text-[10px] text-green-400 bg-[#060606] p-3 rounded border border-vs-border whitespace-pre-wrap font-mono uppercase leading-tight">{rlsResult}</pre>}
              </div>
            ) : (
              <p className="text-vs-text text-[13px] leading-relaxed mt-2">
                Replaces prone-to-error <code className="bg-vs-base px-1 rounded text-orange-400 font-mono">WHERE tenant_id</code> application logic. 
                Middleware injects <code className="text-blue-400 font-mono">tenant_id</code> into the Postgres session, making cross-tenant data mathematically invisible to the execution engine.
              </p>
            )}
          </SolutionCard>

          {/* Solution 2: Telemetry Pipeline */}
          <SolutionCard 
            id="ingestion"
            isActive={activeConfig === 'ingestion'}
            onConfigure={() => setActiveConfig(activeConfig === 'ingestion' ? null : 'ingestion')}
            icon={<Activity size={20} className="text-vs-accent" />}
            title="2. High-Volume Ingestion Pipeline"
            subtitle="Buffered Redis Streams + Async Workers"
            badgeLabel="Capacity: 1.8M events/min"
          >
             <p className="text-vs-text text-[13px] leading-relaxed mt-2">
                Mitigates performance bottlenecks under load. Data Plane telemetry hits a stateless intake cluster that buffers 
                events into high-throughput Redis Streams. Asynchronous background workers then compute billing meters, 
                preventing DB write-locking during spike events.
             </p>
          </SolutionCard>

          {/* Solution 3: Hardware Auth */}
          <SolutionCard 
            id="hwauth"
            isActive={activeConfig === 'hwauth'}
            onConfigure={() => setActiveConfig(activeConfig === 'hwauth' ? null : 'hwauth')}
            icon={<Cpu size={20} className="text-purple-500" />}
            title="3. Hardware Identity Handshake"
            subtitle="mTLS + Cryptographic Fingerprinting"
            badgeLabel="Mode: Zero-Trust Auth"
          >
             <p className="text-vs-text text-[13px] leading-relaxed mt-2">
                Ensures Data Plane nodes cannot be spoofed. Registration requires a valid proxy key paired with an 
                OS-level hardware hash <code className="text-blue-400 font-mono">H(MB_ID || CPU_ID)</code>. Valid nodes are issued 
                ephemeral tokens strictly scoped to their specific Tenant partition.
             </p>
          </SolutionCard>

          {/* Solution 4: Envelope Encryption */}
          <SolutionCard 
            id="encryption"
            isActive={activeConfig === 'encryption'}
            onConfigure={() => setActiveConfig(activeConfig === 'encryption' ? null : 'encryption')}
            icon={<Lock size={20} className="text-vs-error" />}
            title="4. Envelope Cryptographic Storage"
            subtitle="KMS-Managed Tenant Master Keys"
            badgeLabel="Standard: FIPS 140-2"
          >
             <p className="text-vs-text text-[13px] leading-relaxed mt-2">
                Prevents data leakage in the event of a DB compromise. Secrets are encrypted using individual Data Encryption 
                Keys (DEKs), which are themselves encrypted with a Tenant Master Key (TMK) managed by an isolated KMS cluster.
             </p>
          </SolutionCard>

          {/* Solution 5: CI/CD Masking */}
          <SolutionCard 
            id="cicd"
            isActive={activeConfig === 'cicd'}
            onConfigure={() => setActiveConfig(activeConfig === 'cicd' ? null : 'cicd')}
            icon={<GitBranch size={20} className="text-orange-400" />}
            title="5. Secure CI/CD Secret Exposure"
            subtitle="Dynamic Log-Masking Proxy"
            badgeLabel="CI Sync: Activated"
          >
             <p className="text-vs-text text-[13px] leading-relaxed mt-2">
                External runners query a machine-to-machine endpoint. The Control Plane dynamically wraps exported secrets 
                in CI-specific log masking triggers (e.g. <code className="text-green-400 font-mono">::add-mask::</code>) 
                to prevent accidental leakage in GitHub Actions or GitLab logs.
             </p>
          </SolutionCard>

          {/* Hexagonal Billing Card */}
          <SolutionCard 
            id="billing"
            isActive={activeConfig === 'billing'}
            onConfigure={() => setActiveConfig(activeConfig === 'billing' ? null : 'billing')}
            icon={<CreditCard size={20} className="text-blue-500" />}
            title="6. Hexagonal Billing Architecture"
            subtitle="Vendor-Agnostic Usage Metering"
            badgeLabel="Adapter: Kill Bill (OS)"
          >
             <div className="flex flex-col gap-3">
               <p className="text-vs-text text-[13px] leading-relaxed mt-2">
                  Decouples core logic from billing providers. A standardized adapter pipes usage events 
                  into an open-core Billing engine.
               </p>
               {activeConfig === 'billing' && (
                 <button 
                  onClick={() => onOpenSettings?.()}
                  className="bg-vs-active hover:bg-vs-hover text-vs-text text-[11px] font-bold uppercase tracking-widest px-4 py-2 border border-vs-border rounded-sm animate-in slide-in-from-top-1 cursor-pointer"
                 >
                   Open Billing Gateways
                 </button>
               )}
             </div>
          </SolutionCard>
        </div>
      </div>
    </main>
  );
};

interface SolutionCardProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  badgeLabel: string;
  onConfigure: () => void;
  isActive?: boolean;
}

const SolutionCard: React.FC<SolutionCardProps> = ({
  icon, 
  title, 
  subtitle, 
  children, 
  badgeLabel, 
  onConfigure, 
  isActive
}) => (
  <section 
    aria-labelledby={`title-${title.replace(/\s+/g, '-').toLowerCase()}`}
    className={`bg-vs-panel border transition-all duration-500 rounded-sm flex flex-col relative overflow-hidden group shadow-md
      ${isActive ? 'border-vs-accent ring-1 ring-vs-accent/20 bg-vs-panel' : 'border-vs-border hover:border-vs-border-light hover:bg-vs-hover/50'}
    `}
  >
    <div className={`absolute top-0 left-0 w-1 h-full transition-colors duration-500 ${isActive ? 'bg-vs-accent' : 'bg-transparent group-hover:bg-vs-border-light'}`}></div>
    
    <div className="p-6 flex flex-col flex-1">
      <div className="flex items-start justify-between border-b border-vs-border/50 pb-4 mb-3">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded bg-vs-base flex items-center justify-center border border-vs-border-light shadow-inner">
            {icon}
          </div>
          <div>
            <h3 id={`title-${title.replace(/\s+/g, '-').toLowerCase()}`} className="text-vs-text text-[15px] font-semibold tracking-tight">{title}</h3>
            <p className="text-vs-accent text-[12px] font-mono mt-0.5 font-medium">{subtitle}</p>
          </div>
        </div>
        <button 
          onClick={onConfigure} 
          aria-label={`Configure ${title}`}
          aria-expanded={isActive}
          className={`p-2 rounded-sm transition-all focus:outline-none focus:ring-2 focus:ring-vs-accent
            ${isActive ? 'bg-vs-accent text-vs-text rotate-90 scale-110 shadow-lg' : 'text-vs-text-muted hover:text-vs-text hover:bg-vs-base border border-transparent'}
          `}
        >
          <Settings size={18} className={isActive ? 'animate-spin' : ''} />
        </button>
      </div>
      
      <div className="flex-1 min-h-[60px]">
        {children}
      </div>

      <footer className="mt-5 border-t border-vs-border/50 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-vs-success text-[10px] font-bold tracking-widest uppercase bg-vs-success/5 px-2 py-0.5 rounded-full border border-vs-success/20">
          <CheckCircle2 size={12} />
          {badgeLabel}
        </div>
        <button 
          onClick={() => alert(`Redirecting to internal architecture wiki for: ${title}`)}
          className="text-[11px] text-vs-text-muted hover:text-vs-text transition-colors flex items-center gap-1.5 font-medium px-2 py-1 rounded hover:bg-vs-base border-none cursor-pointer"
        >
          <span>Documentation</span>
          <Terminal size={12} />
        </button>
      </footer>
    </div>
  </section>
);
