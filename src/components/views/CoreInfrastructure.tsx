import React from 'react';
import { Shield, CreditCard, Database, Box, Plug, CheckCircle2, Settings } from 'lucide-react';

export const CoreInfrastructure: React.FC = () => {
  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-300 pb-10">
      <div className="mb-8 border-b border-vs-border pb-6">
        <h2 className="text-white text-xl font-light tracking-tight">Architectural Solutions Center</h2>
        <p className="text-vs-text-muted text-[13px] mt-2 max-w-3xl leading-relaxed">
          Deploying a multi-tenant Control Plane introduces extreme complexity in security, billing, scaling, and delivery. 
          This panel defines the active mitigations enacted by this system to solve those specific architectural bottlenecks.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Solution 1 */}
        <SolutionCard 
          icon={<Shield size={20} className="text-vs-success" />}
          title="1. Data Leakage (Cross-Tenant Access)"
          subtitle="Solved via PostgreSQL Row-Level Security (RLS)"
          description="Instead of relying on application-level logic which is prone to human error, we enforce strict isolation at the database engine level. Every SQL query automatically inherits a session variable injected by our Auth middleware. Data belonging to another tenant is mathematically invisible to the query execution planner."
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
  );
};

const SolutionCard = ({icon, title, subtitle, description, badgeLabel}: {icon: React.ReactNode, title: string, subtitle: string, description: string, badgeLabel: string}) => (
  <div className="bg-vs-panel border border-vs-border p-6 rounded shadow-lg flex flex-col relative overflow-hidden group">
    <div className="absolute top-0 left-0 w-1 h-full bg-vs-border group-hover:bg-vs-accent transition-colors duration-500"></div>
    <div className="flex items-center gap-4 border-b border-vs-border pb-4 mb-4">
      <div className="w-10 h-10 rounded-full bg-vs-base flex items-center justify-center border border-vs-border-light">
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
    <div className="mt-5 pt-4 border-t border-vs-border flex items-center justify-between">
      <div className="flex items-center gap-1.5 text-vs-success text-[11px] font-semibold tracking-wide uppercase">
        <CheckCircle2 size={12} />
        {badgeLabel}
      </div>
      <button className="text-gray-500 hover:text-white transition-colors focus:outline-none">
        <Settings size={14} />
      </button>
    </div>
  </div>
);
