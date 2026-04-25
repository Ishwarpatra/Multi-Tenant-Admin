import React, { useState } from 'react';
import { Eye, EyeOff, Copy, ShieldAlert, KeyRound, Check, Filter } from 'lucide-react';

interface SecretEntry {
  id: string;
  keyName: string;
  value: string;
  env: 'Production' | 'Staging' | 'Development';
  lastUpdated: string;
}

const MOCK_SECRETS: SecretEntry[] = [
  { id: '1', keyName: 'STRIPE_SECRET_KEY', value: 'sk_live_51Nw9x2D...', env: 'Production', lastUpdated: '2 hours ago' },
  { id: '2', keyName: 'AWS_ACCESS_KEY_ID', value: 'AKIAIOSFODNN7EXAMPLE', env: 'Production', lastUpdated: '3 days ago' },
  { id: '3', keyName: 'OPENAI_API_KEY', value: 'sk-proj-783...', env: 'Staging', lastUpdated: '1 week ago' },
  { id: '4', keyName: 'DB_CONNECTION_STRING', value: 'postgresql://admin:...', env: 'Development', lastUpdated: '1 month ago' },
];

export const SecretsVault: React.FC = () => {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState<'All' | 'Production' | 'Staging' | 'Development'>('All');

  const toggleReveal = (id: string) => {
    const newRevealed = new Set(revealed);
    if (newRevealed.has(id)) {
      newRevealed.delete(id);
    } else {
      newRevealed.add(id);
    }
    setRevealed(newRevealed);
  };

  const copyToClipboard = (id: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const filteredSecrets = MOCK_SECRETS.filter(s => filter === 'All' || s.env === filter);

  return (
    <div className="p-8 animate-in fade-in duration-300">
      <div className="mb-8 flex items-start justify-between">
         <div>
            <h2 className="text-white text-xl font-light tracking-tight flex items-center gap-3">
              <ShieldAlert className="text-purple-500" size={24} />
              Secrets Management Domain
            </h2>
            <p className="text-vs-text-muted text-[13px] mt-2 max-w-3xl leading-relaxed">
              Strictly isolated vault for cryptographic keys, billing secrets, and connection strings. Access is logged. Keys are heavily masked by default across all active UI sessions to prevent cross-tenant key leakage during support triage.
            </p>
         </div>
      </div>

      <div className="bg-vs-bg border border-vs-border rounded shadow-xl flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-vs-border flex justify-between items-center bg-vs-panel">
            <div className="flex items-center gap-3">
              <KeyRound size={16} className="text-gray-400" />
              <h2 className="text-white text-[14px] font-medium tracking-tight">Active Application Secrets</h2>
            </div>
            
            <div className="flex items-center gap-3">
               <Filter size={14} className="text-gray-500" />
               <div className="flex bg-vs-base rounded flex-row border border-vs-border p-1">
                  {['All', 'Production', 'Staging', 'Development'].map(env => (
                    <button 
                      key={env} 
                      onClick={() => setFilter(env as any)}
                      className={`px-3 py-1 text-xs rounded shadow-sm transition-colors ${filter === env ? 'text-white bg-vs-border' : 'text-gray-500 hover:text-white'}`}
                    >
                      {env}
                    </button>
                  ))}
               </div>
               <button className="bg-vs-accent hover:bg-vs-accent-hover text-white px-4 py-1.5 text-xs rounded-sm transition-all shadow-sm focus:outline-none ml-2">
                 Inject Secret
               </button>
            </div>
        </div>

        <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-vs-border bg-vs-base text-[11px] text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-3 font-semibold">Key Identifier</th>
                <th className="px-6 py-3 font-semibold w-1/3">Secret Value</th>
                <th className="px-6 py-3 font-semibold">Scope Environment</th>
                <th className="px-6 py-3 font-semibold">Last Mutated</th>
                <th className="px-6 py-3 font-semibold text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="text-[12px]">
              {filteredSecrets.map(secret => {
                const isRevealed = revealed.has(secret.id);
                const isCopied = copied === secret.id;
                return (
                  <tr key={secret.id} className="border-b border-vs-border hover:bg-vs-hover transition-colors group">
                    <td className="px-6 py-4 font-mono text-blue-400 text-[12px]">
                       {secret.keyName}
                    </td>
                    <td className="px-6 py-4">
                       <code className="px-2 py-1 bg-vs-base border border-vs-border-light rounded text-[12px] text-gray-300 font-mono inline-block min-w-[200px]">
                          {isRevealed ? secret.value : '************************'}
                       </code>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full border ${secret.env === 'Production' ? 'bg-orange-500/10 text-vs-error border-vs-error/30' : secret.env === 'Staging' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}>
                         {secret.env}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-vs-text-muted">{secret.lastUpdated}</td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => toggleReveal(secret.id)} 
                            className="p-1.5 text-gray-400 hover:text-white hover:bg-vs-base rounded"
                            title={isRevealed ? "Mask secret" : "Reveal secret"}
                          >
                            {isRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          <button 
                            onClick={() => copyToClipboard(secret.id, secret.value)} 
                            className="p-1.5 text-gray-400 hover:text-white hover:bg-vs-base rounded"
                            title="Copy to clipboard"
                          >
                            {isCopied ? <Check size={16} className="text-vs-success" /> : <Copy size={16} />}
                          </button>
                       </div>
                    </td>
                  </tr>
                );
              })}
              {filteredSecrets.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">No secrets mapped for {filter}</td></tr>
              )}
            </tbody>
        </table>
      </div>
    </div>
  );
};
