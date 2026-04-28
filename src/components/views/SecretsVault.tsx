import React, { useState, useEffect, useCallback } from 'react';
import { 
  Eye, EyeOff, Copy, ShieldAlert, KeyRound, Check, Filter, 
  Download, Plus, X, AlertCircle, Edit2, Trash2, Search, Loader2 
} from 'lucide-react';
import { VSCodeSelect } from '../ui/VSCodeSelect';
import { MockApiService } from '../../services/mockApiService';
import { useDebounce } from '../../hooks/useDebounce';

export interface SecretEntry {
  id: string;
  keyName: string;
  value: string;
  env: 'Production' | 'Staging' | 'Development';
  timestamp: number;
}

function getRelativeTime(timestamp: number) {
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60) return `Just now`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// Globalized tick context to avoid per-row interval timers
const RelativeTime: React.FC<{ timestamp: number, tick: number }> = ({ timestamp, tick }) => {
  return <span className="font-mono">{getRelativeTime(timestamp)}</span>;
};

export const SecretsVault: React.FC = () => {
  const [secrets, setSecrets] = useState<SecretEntry[]>([]);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState<'All' | 'Production' | 'Staging' | 'Development'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useDebounce(searchQuery, 300);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
  };

  const [showInjectModal, setShowInjectModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newEnv, setNewEnv] = useState<'Production' | 'Staging' | 'Development'>('Development');
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'github' | 'gitlab'>('github');
  const [copiedPipeline, setCopiedPipeline] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const isMounted = React.useRef(true);
  
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const fetchSecrets = useCallback(() => {
    setLoading(true);
    setApiError(null);
    MockApiService.getSecrets()
      .then(data => {
        if (!isMounted.current) return;
        setSecrets(data as SecretEntry[]);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted.current) return;
        setApiError('Connection refused: Vault proxy unavailable or rate-limited.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchSecrets();
    // Global tick for relative times every 30s
    const interval = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, [fetchSecrets]);

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

  const handleKeyNameChange = (val: string) => {
    let sanitized = val.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '').toUpperCase();
    if (/^[0-9]/.test(sanitized)) sanitized = 'S_' + sanitized;
    setNewKeyName(sanitized);
    setErrorStatus(null);
  };

  const handleInject = () => {
    if (!newKeyName || !newValue) return;
    if (secrets.some(s => s.keyName === newKeyName && s.env === newEnv && s.id !== editingId)) {
      setErrorStatus(`DUPLICATE_KEY: ${newKeyName} active in ${newEnv}`);
      return;
    }

    setSecrets(prev => {
      if (editingId) {
        return prev.map(s => s.id === editingId ? { ...s, keyName: newKeyName, value: newValue, env: newEnv, timestamp: Date.now() } : s);
      }
      return [{ id: crypto.randomUUID(), keyName: newKeyName, value: newValue, env: newEnv, timestamp: Date.now() }, ...prev];
    });
    resetModal();
  };

  const resetModal = () => {
    setShowInjectModal(false);
    setEditingId(null);
    setNewKeyName('');
    setNewValue('');
    setErrorStatus(null);
  };

  const filteredSecrets = secrets.filter(s => {
    const matchesEnv = filter === 'All' || s.env === filter;
    const matchesSearch = s.keyName.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    return matchesEnv && matchesSearch;
  });

  const generatedYaml = exportFormat === 'github' ? `name: Provision Secrets
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Inject Secure Keys
        run: |${
filteredSecrets.map(s => `
          echo "::add-mask::\${{ secrets.${s.keyName} }}"
          echo "${s.keyName}=\${{ secrets.${s.keyName} }}" >> $GITHUB_ENV`).join('')
        }
` : `variables:
${filteredSecrets.map(s => `  ${s.keyName}:
    value: "$\{${s.keyName}\}"
    description: "Provisioned from Multi-Tenant Vault"
    masked: true`).join('\n')}

deploy_prod:
  stage: deploy
  script:
    - echo "Deploying with synchronized entropy..."
`;

  if (apiError) {
    return (
      <main className="p-8 h-full flex flex-col items-center justify-center animate-in fade-in duration-500">
        <div className="max-w-md text-center">
           <AlertCircle size={48} className="text-vs-error mb-4 mx-auto opacity-50" />
           <h2 className="text-xl text-vs-text mb-2 font-medium">Vault Synchronization Failure</h2>
           <p className="text-vs-text-muted mb-8 text-sm leading-relaxed">The secure proxy layer could not establish a handshake with the secrets domain. This may be due to regional network isolation or expired session tokens.</p>
           <button 
             onClick={fetchSecrets} 
             className="bg-vs-accent hover:bg-vs-active text-vs-text px-8 py-2.5 rounded-sm text-xs font-bold uppercase tracking-widest border-none cursor-pointer transition-all shadow-lg"
           >
             Reconnect Pipeline
           </button>
        </div>
      </main>
    );
  }

  return (
    <main className="p-8 h-full flex flex-col overflow-hidden animate-in fade-in duration-300">
      <header className="mb-8 flex flex-shrink-0 items-start justify-between border-b border-vs-border pb-6">
         <div className="max-w-2xl">
            <h2 className="text-vs-text text-xl font-light tracking-tight flex items-center gap-3">
              <ShieldAlert className="text-vs-accent" size={24} />
              Secrets Management Domain
            </h2>
            <p className="text-vs-text-muted text-[13px] mt-2 leading-relaxed">
              Strictly isolated vault for cryptographic material and configuration entropy. All access is audited. Keys are masked by default to prevent incidental exposure during screen share or telemetry extraction.
            </p>
         </div>
         {revealed.size > 0 && (
           <button 
             onClick={() => setRevealed(new Set())}
             className="bg-vs-error hover:bg-red-600 text-vs-text px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border-none cursor-pointer transition-all animate-bounce"
           >
             <EyeOff size={14} /> Panic: Mask All
           </button>
         )}
      </header>

      <div className="bg-vs-bg border border-vs-border rounded-sm shadow-2xl flex flex-col flex-1 overflow-hidden">
        <div className="px-6 py-4 border-b border-vs-border flex justify-between flex-shrink-0 items-center bg-vs-panel flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <KeyRound size={16} className="text-vs-accent opacity-70" />
              <h2 className="text-vs-text text-[11px] font-bold uppercase tracking-widest opacity-80">Security Payload</h2>
            </div>
            
            <div className="flex items-center gap-3">
               <div className="relative">
                 <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-vs-text-muted" />
                 <input 
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                   placeholder="Filter keys..." 
                   className="bg-vs-base border border-vs-border focus:border-vs-accent text-vs-text outline-none rounded-sm pl-8 pr-2 py-1.5 text-[11px] w-48 transition-all"
                 />
                 {searchQuery && <button onClick={handleClearSearch} className="absolute right-1 text-vs-text-muted hover:text-vs-text bg-transparent border-none cursor-pointer"><X size={14} /></button>}
               </div>
               <nav className="flex bg-vs-base rounded-sm border border-vs-border p-1">
                  {['All', 'Production', 'Staging', 'Development'].map(env => (
                    <button 
                      key={env} 
                      onClick={() => setFilter(env as any)}
                      className={`px-3 py-1 text-[10px] font-bold uppercase tracking-tighter rounded-sm transition-all border-none cursor-pointer ${filter === env ? 'text-vs-text bg-vs-active' : 'text-gray-500 hover:text-vs-text bg-transparent'}`}
                    >
                      {env}
                    </button>
                  ))}
               </nav>
               <button onClick={() => setShowExportModal(true)} disabled={filteredSecrets.length === 0} className="bg-vs-base hover:bg-vs-hover text-vs-text border border-vs-border px-3 py-1.5 text-[11px] rounded-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors uppercase font-bold">
                 <Download size={14} /> Export
               </button>
               <button onClick={() => setShowInjectModal(true)} className="bg-vs-accent hover:bg-vs-accent-hover text-vs-text px-3 py-1.5 text-[11px] rounded-sm flex items-center gap-1.5 cursor-pointer border-none font-bold uppercase shadow-lg transition-all">
                 <Plus size={14} /> Inject
               </button>
            </div>
        </div>

        <div className="overflow-x-auto flex-1 w-full custom-scrollbar">
           <div className="min-w-[800px] h-full flex flex-col">
           {loading ? (
             <div className="h-full flex flex-col items-center justify-center text-vs-text-muted gap-4">
                <Loader2 size={32} className="animate-spin text-vs-accent" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">Decrypting Vault...</span>
             </div>
           ) : (
             <div className="flex-1 overflow-y-auto custom-scrollbar">
               <table className="w-full text-left border-collapse">
                   <thead className="sticky top-0 bg-vs-base z-10 border-b border-vs-border">
                     <tr className="text-[10px] text-vs-text-muted uppercase tracking-[0.15em] font-bold">
                       <th className="px-6 py-4">Key Identifier</th>
                       <th className="px-6 py-4 w-1/3">Configured Value</th>
                       <th className="px-6 py-4">Scope</th>
                       <th className="px-6 py-4">Last Sync</th>
                       <th className="px-6 py-4 text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="text-[12px]">
                     {filteredSecrets.length > 0 ? filteredSecrets.map(secret => {
                       const isRevealed = revealed.has(secret.id);
                       const isCopied = copied === secret.id;
                       return (
                         <tr key={secret.id} className="border-b border-vs-border/50 hover:bg-vs-hover/30 transition-colors group">
                           <td className="px-6 py-4 font-mono text-vs-accent group-hover:text-vs-text transition-colors capitalize">
                              {secret.keyName}
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <code className="block px-2.5 py-1.5 bg-vs-base border border-vs-border rounded-sm text-[11px] text-gray-400 font-mono w-full max-w-[320px] shadow-inner break-all">
                                   {isRevealed ? secret.value : (
                                     <>
                                       <span aria-hidden="true">••••••••••••••••••••••••</span>
                                       <span className="sr-only">Masked credential</span>
                                     </>
                                   )}
                                </code>
                                {!isRevealed && <div className="text-[9px] text-vs-text-muted font-bold opacity-0 group-hover:opacity-100 transition-opacity uppercase shrink-0">Encrypted</div>}
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 text-[9px] uppercase font-bold tracking-widest rounded-sm border ${secret.env === 'Production' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : secret.env === 'Staging' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-vs-accent/10 text-vs-accent border-vs-accent/20'}`}>
                                {secret.env}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-vs-text-muted text-[10px] opacity-70">
                             <RelativeTime timestamp={secret.timestamp} tick={tick} />
                           </td>
                           <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={() => toggleReveal(secret.id)} className="p-1.5 text-vs-text-muted hover:text-vs-text hover:bg-vs-active rounded cursor-pointer border-none bg-transparent" title="Toggle Visibility">
                                   {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                                 </button>
                                 <button onClick={() => copyToClipboard(secret.id, secret.value)} className="p-1.5 text-vs-text-muted hover:text-vs-text hover:bg-vs-active rounded cursor-pointer border-none bg-transparent" title="Copy Value">
                                   {isCopied ? <Check size={14} className="text-vs-success" /> : <Copy size={14} />}
                                 </button>
                                 <div className="w-[1px] h-4 bg-vs-border mx-1 opacity-50"></div>
                                 <button onClick={() => { handleKeyNameChange(secret.keyName); setNewValue(secret.value); setNewEnv(secret.env); setEditingId(secret.id); setShowInjectModal(true); }} className="p-1.5 text-vs-text-muted hover:text-vs-text hover:bg-vs-active rounded cursor-pointer border-none bg-transparent"><Edit2 size={13} /></button>
                                 <button onClick={() => setSecrets(s => s.filter(x => x.id !== secret.id))} className="p-1.5 text-vs-text-muted hover:text-vs-error hover:bg-vs-error/10 rounded cursor-pointer border-none bg-transparent"><Trash2 size={13} /></button>
                              </div>
                           </td>
                         </tr>
                       );
                     }) : (
                       <tr>
                         <td colSpan={5} className="px-6 py-10">
                            {debouncedSearchQuery ? (
                              <div className="flex flex-col items-center gap-4 py-10 opacity-40">
                                 <Search size={40} className="text-vs-text-muted" strokeWidth={1} />
                                 <div className="text-center">
                                   <p className="text-xs font-bold uppercase tracking-widest text-vs-text-muted">No key matches found</p>
                                   <p className="text-[11px] mt-1 italic">Query "{debouncedSearchQuery}" returned zero local entities.</p>
                                 </div>
                                 <button onClick={handleClearSearch} className="text-vs-accent text-xs hover:underline bg-transparent border-none cursor-pointer">Reset Query</button>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-3 py-10 opacity-30">
                                <KeyRound size={40} className="text-vs-text-muted" strokeWidth={1} />
                                <p className="text-xs uppercase tracking-widest font-bold">Vault Empty</p>
                                <p className="text-[11px] italic">No cryptographic secrets provisioned for {filter} scope.</p>
                              </div>
                            )}
                         </td>
                       </tr>
                     )}
                   </tbody>
               </table>
             </div>
           )}
           </div>
        </div>
      </div>

      {showInjectModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-8 z-[200] backdrop-blur-[2px]">
           <div className="w-96 bg-vs-panel rounded shadow-2xl border border-vs-border overflow-hidden animate-in zoom-in-95 duration-200">
              <header className="px-5 py-3 bg-vs-header border-b border-vs-border flex justify-between items-center">
                <span className="text-sm font-medium text-vs-text">{editingId ? 'Modify Secure Payload' : 'Inject New Entropy'}</span>
                <button onClick={resetModal} className="text-vs-text-muted hover:text-vs-text bg-transparent border-none cursor-pointer"><X size={18}/></button>
              </header>
              <div className="p-6 space-y-4">
                 <div>
                   <label className="text-[10px] font-bold text-vs-text-muted uppercase tracking-widest mb-2 block">SECRET_IDENTIFIER_KEY</label>
                   <input value={newKeyName} onChange={e => handleKeyNameChange(e.target.value)} placeholder="DATABASE_URL" className="w-full bg-vs-base border border-vs-border focus:border-vs-accent p-2.5 rounded text-xs text-vs-accent font-mono outline-none" />
                   {errorStatus && <p className="text-[9px] text-vs-error font-bold mt-1.5 uppercase flex items-center gap-1 animate-in slide-in-from-top-1"><AlertCircle size={10} /> {errorStatus}</p>}
                 </div>
                 <div>
                   <label className="text-[10px] font-bold text-vs-text-muted uppercase tracking-widest mb-2 block">ENCRYPTED_VALUE</label>
                   <input type="password" value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="••••••••••••••••" className="w-full bg-vs-base border border-vs-border focus:border-vs-accent p-2.5 rounded text-xs text-vs-text font-mono outline-none" />
                 </div>
                 <div>
                   <label className="text-[10px] font-bold text-vs-text-muted uppercase tracking-widest mb-2 block">TARGET ENVIRONMENT</label>
                   <VSCodeSelect value={newEnv} options={['Production', 'Staging', 'Development']} onChange={(v) => setNewEnv(v as any)} className="w-full" />
                 </div>
              </div>
              <footer className="p-4 bg-vs-header border-t border-vs-border flex justify-end gap-3">
                <button onClick={resetModal} className="px-4 py-1.5 text-xs text-vs-text-muted hover:text-vs-text bg-transparent border border-vs-border rounded-sm cursor-pointer">Cancel</button>
                <button onClick={handleInject} disabled={!newKeyName || !newValue} className="px-6 py-1.5 text-xs bg-vs-accent hover:bg-vs-accent-hover text-vs-text rounded font-bold border-none shadow-md disabled:opacity-50">Authorize Injection</button>
              </footer>
           </div>
        </div>
      )}

      {showExportModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-8 z-[200] backdrop-blur-[2px]">
           <div className="w-full max-w-2xl bg-vs-panel rounded shadow-2xl border border-vs-border overflow-hidden animate-in zoom-in-95 duration-200">
              <header className="px-5 py-3 bg-vs-header border-b border-vs-border flex justify-between items-center shadow-sm">
                <span className="text-sm font-medium text-vs-text flex items-center gap-2">
                   <Download size={16} className="text-vs-accent" /> Infrastructure Export: {exportFormat === 'github' ? 'GitHub Actions' : 'GitLab CI'}
                </span>
                <button onClick={() => setShowExportModal(false)} className="text-vs-text-muted hover:text-vs-text bg-transparent border-none cursor-pointer"><X size={18}/></button>
              </header>
              <div className="p-6">
                 <div className="flex bg-vs-base p-1 border border-vs-border rounded w-fit mb-4">
                    <button onClick={() => setExportFormat('github')} className={`px-4 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest border-none cursor-pointer transition-all ${exportFormat === 'github' ? 'bg-vs-active text-vs-text shadow-sm' : 'text-vs-text-muted hover:text-vs-text bg-transparent'}`}>GitHub</button>
                    <button onClick={() => setExportFormat('gitlab')} className={`px-4 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest border-none cursor-pointer transition-all ${exportFormat === 'gitlab' ? 'bg-vs-active text-vs-text shadow-sm' : 'text-vs-text-muted hover:text-vs-text bg-transparent'}`}>GitLab</button>
                 </div>
                 <div className="bg-vs-base border border-vs-border rounded overflow-hidden">
                    <div className="px-4 py-2 border-b border-vs-border flex justify-between items-center bg-vs-header/50">
                       <span className="text-[9px] font-bold text-vs-text-muted uppercase tracking-[0.2em]">{exportFormat === 'github' ? 'ci.yml' : '.gitlab-ci.yml'}</span>
                       <button 
                         onClick={() => {
                           navigator.clipboard.writeText(generatedYaml);
                           setCopiedPipeline(true);
                           setTimeout(() => setCopiedPipeline(false), 2000);
                         }}
                         className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-vs-accent hover:text-vs-accent-hover bg-transparent border-none cursor-pointer"
                       >
                         {copiedPipeline ? <Check size={12}/> : <Copy size={12}/>}
                         {copiedPipeline ? 'Copied' : 'Copy Payload'}
                       </button>
                    </div>
                    <pre className="p-5 text-[11px] text-vs-success font-mono leading-relaxed overflow-x-auto custom-scrollbar max-h-80 whitespace-pre">
                       {generatedYaml}
                    </pre>
                 </div>
              </div>
              <footer className="p-4 bg-vs-header border-t border-vs-border flex justify-end gap-3">
                 <button 
                   onClick={() => {
                     const blob = new Blob([generatedYaml], { type: 'text/yaml' });
                     const url = URL.createObjectURL(blob);
                     const a = document.createElement('a');
                     a.href = url;
                     a.download = exportFormat === 'github' ? 'secrets-sync.yml' : '.gitlab-ci.yml';
                     a.click();
                     URL.revokeObjectURL(url);
                   }}
                   className="px-4 py-1.5 text-xs text-vs-text bg-vs-active hover:bg-vs-hover border border-vs-border rounded font-bold cursor-pointer"
                 >
                   Download Payload
                 </button>
              </footer>
           </div>
        </div>
      )}
    </main>
  );
};
