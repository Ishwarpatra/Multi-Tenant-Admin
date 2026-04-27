import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Copy, ShieldAlert, KeyRound, Check, Filter, Download, Plus, X, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { VSCodeSelect } from '../ui/VSCodeSelect';
import { MockApiService } from '../../services/mockApiService';

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
   if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
   if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
   return `${Math.floor(diff/86400)}d ago`;
}

const RelativeTime: React.FC<{ timestamp: number }> = ({ timestamp }) => {
  const [val, setVal] = useState(getRelativeTime(timestamp));
  useEffect(() => {
    const timer = setInterval(() => setVal(getRelativeTime(timestamp)), 60000);
    return () => clearInterval(timer);
  }, [timestamp]);
  return <>{val}</>;
};

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export const SecretsVault: React.FC = () => {
  const [secrets, setSecrets] = useState<SecretEntry[]>([]);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState<'All' | 'Production' | 'Staging' | 'Development'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const [showInjectModal, setShowInjectModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newEnv, setNewEnv] = useState<'Production' | 'Staging' | 'Development'>('Development');
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'github' | 'gitlab'>('github');
  const [copiedPipeline, setCopiedPipeline] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchSecrets = () => {
    let isMounted = true;
    setApiError(null);
    MockApiService.getSecrets()
      .then(data => {
        if (isMounted) setSecrets(data as SecretEntry[]);
      })
      .catch(err => {
        if (isMounted) setApiError('Connection refused: Vault proxy unavailable.');
      });
    return () => { isMounted = false; };
  };

  useEffect(() => {
    return fetchSecrets();
  }, []);

  useEffect(() => {
    if (showInjectModal && !editingId) {
      setNewEnv(filter !== 'All' ? filter : 'Development');
    }
  }, [showInjectModal, filter, editingId]);

  const toggleReveal = (id: string) => {
    const newRevealed = new Set(revealed);
    if (newRevealed.has(id)) {
      newRevealed.delete(id);
    } else {
      newRevealed.add(id);
    }
    setRevealed(newRevealed);
  };

  const panicMaskAll = () => setRevealed(new Set());

  const copyToClipboard = (id: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleKeyNameChange = (val: string) => {
    // UPPER_SNAKE_CASE sanitization
    let sanitized = val
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/[^a-zA-Z0-9_]/g, '') // Strip special characters
      .toUpperCase();
    
    // Prevent environment variables starting with a digit 
    if (/^[0-9]/.test(sanitized)) {
      sanitized = 'APP_' + sanitized;
    }
    
    setNewKeyName(sanitized);
    setErrorStatus(null);
  };

  const resetModalState = () => {
    setShowInjectModal(false);
    setNewKeyName('');
    setNewValue('');
    setNewEnv('Development');
    setEditingId(null);
    setErrorStatus(null);
  };

  const handleInject = () => {
    if (!newKeyName || !newValue) return;

    // Collision detection
    if (secrets.some(s => s.keyName === newKeyName && s.env === newEnv && s.id !== editingId)) {
      setErrorStatus(`DUPLICATE_KEY: ${newKeyName} already exists in ${newEnv}`);
      return;
    }

    setSecrets(prev => {
      if (editingId) {
        return prev.map(s => s.id === editingId ? { ...s, keyName: newKeyName, value: newValue, env: newEnv, timestamp: Date.now() } : s);
      }
      return [{
        id: Date.now().toString(),
        keyName: newKeyName,
        value: newValue,
        env: newEnv,
        timestamp: Date.now()
      }, ...prev];
    });
    resetModalState();
  };

  const handleEdit = (secret: SecretEntry) => {
    setNewKeyName(secret.keyName);
    setNewValue(secret.value);
    setNewEnv(secret.env);
    setEditingId(secret.id);
    setShowInjectModal(true);
  };

  const handleDelete = (id: string) => {
    setSecrets(prev => prev.filter(s => s.id !== id));
    setRevealed(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    if (copied === id) setCopied(null);
    if (editingId === id) resetModalState();
  };

  if (apiError) {
    return (
      <main className="p-8 animate-in fade-in duration-300 relative h-full flex flex-col items-center justify-center">
        <AlertCircle size={48} className="text-vs-error mb-4 opacity-80" />
        <h2 className="text-xl text-white mb-2">Vault Connection Failed</h2>
        <p className="text-vs-text-muted mb-6">{apiError}</p>
        <button 
          onClick={fetchSecrets} 
          className="bg-vs-accent hover:bg-vs-accent-hover text-white px-4 py-2 rounded-sm text-[12px] font-medium border-none cursor-pointer"
        >
          Retry Connection
        </button>
      </main>
    );
  }

  const filteredSecrets = secrets.filter(s => {
    const matchesEnv = filter === 'All' || s.env === filter;
    const matchesSearch = s.keyName.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    return matchesEnv && matchesSearch;
  });

  const generatedYaml = exportFormat === 'github' ? `name: Inject Active Secrets
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Configure Secure Environment
        run: |${
filteredSecrets.map(s => `\n          echo "::add-mask::\${{ secrets.${s.keyName} }}"\n          echo "${s.keyName}=\${{ secrets.${s.keyName} }}" >> $GITHUB_ENV`).join('')
        }
` : `#!/bin/bash
# GitLab script to provision masked multitenant variables via GitLab API
# Requires GITLAB_TOKEN environment variable

PROJECT_ID="your_project_id"
GITLAB_URL="https://gitlab.example.com/api/v4"
${filteredSecrets.map(s => `
curl --request POST --header "PRIVATE-TOKEN: $GITLAB_TOKEN" \\
     --data "variable_type=env_var" \\
     --data "key=${s.keyName}" \\
     --data-urlencode "value=your_secret_value" \\
     --data "protected=true" \\
     --data "masked=true" \\
     "$GITLAB_URL/projects/$PROJECT_ID/variables"`).join('\n')}
`;

  return (
    <main className="p-8 animate-in fade-in duration-300 relative h-full flex flex-col overflow-hidden w-full">
      <header className="mb-8 flex flex-shrink-0 items-start justify-between border-b border-vs-border pb-6">
         <div>
            <h2 className="text-white text-xl font-light tracking-tight flex items-center gap-3">
              <ShieldAlert className="text-vs-accent" size={24} />
              Secrets Management Domain
            </h2>
            <p className="text-vs-text-muted text-[13px] mt-2 max-w-3xl leading-relaxed">
              Strictly isolated vault for cryptographic keys, billing secrets, and connection strings. Access is logged. Keys are heavily masked by default across all active UI sessions to prevent cross-tenant key leakage during support triage.
            </p>
         </div>
         {revealed.size > 0 && (
           <button 
             onClick={panicMaskAll}
             className="bg-vs-error hover:bg-red-600 text-white px-4 py-2 rounded-sm text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 border-none cursor-pointer shadow-lg animate-bounce"
           >
             <EyeOff size={14} /> Panic: Mask All
           </button>
         )}
      </header>

      <div className="bg-vs-bg border border-vs-border rounded-sm shadow-xl flex flex-col flex-1 overflow-hidden">
        <div className="px-6 py-4 border-b border-vs-border flex justify-between flex-shrink-0 items-center bg-vs-panel flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <KeyRound size={16} className="text-vs-accent" />
              <h2 className="text-white text-[14px] font-medium tracking-tight uppercase tracking-wider opacity-80">Encryption Keys & Environment Secrets</h2>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
               <div className="relative">
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                   placeholder="Search keys..." 
                   className="bg-vs-base border border-vs-border focus:border-vs-accent text-white outline-none rounded-sm px-2 py-1 text-xs w-48 shadow-inner"
                 />
                 {searchQuery && (
                   <button onClick={() => setSearchQuery('')} className="absolute right-1.5 top-1.5 text-gray-400 hover:text-white bg-transparent border-none cursor-pointer">
                     <X size={12} />
                   </button>
                 )}
               </div>
               <nav className="flex bg-vs-base rounded-sm flex-row border border-vs-border p-1" aria-label="Environment filters">
                  {['All', 'Production', 'Staging', 'Development'].map(env => (
                    <button 
                      key={env} 
                      onClick={() => setFilter(env as any)}
                      aria-current={filter === env}
                      className={`px-3 py-1 text-xs rounded-sm shadow-sm transition-colors border-none cursor-pointer ${filter === env ? 'text-white bg-vs-active' : 'text-gray-500 hover:text-white bg-transparent'}`}
                    >
                      {env}
                    </button>
                  ))}
               </nav>
               <button onClick={() => setShowExportModal(true)} disabled={filteredSecrets.length === 0} className="bg-vs-base hover:bg-vs-hover text-gray-300 border border-vs-border px-3 py-1.5 text-xs rounded-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-vs-accent flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                 <Download size={14} /> Export CI/CD
               </button>
               <button onClick={() => setShowInjectModal(true)} className="bg-vs-accent hover:bg-vs-accent-hover text-white px-3 py-1.5 text-xs rounded-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-vs-accent-hover flex items-center gap-1.5 cursor-pointer border-none font-semibold">
                 <Plus size={14} /> Inject Secret
               </button>
            </div>
        </div>

        <div className="overflow-x-auto overflow-y-auto flex-1 w-full custom-scrollbar pb-2 shadow-[inset_-10px_0_10px_-10px_rgba(0,0,0,0.5)]">
           <div className="min-w-[700px]">
              <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-vs-base z-10">
                    <tr className="border-b border-vs-border text-[11px] text-gray-500 uppercase tracking-wider">
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
                        <tr key={secret.id} className="border-b border-vs-border hover:bg-vs-hover/50 transition-colors group">
                          <td className="px-6 py-4 font-mono text-vs-accent text-[12px]">
                             {secret.keyName}
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-2">
                               <code className="block px-2 py-1 bg-vs-base border border-vs-border rounded-sm text-[12px] text-gray-300 font-mono min-w-[200px] w-full max-w-[280px] max-h-[50px] overflow-y-auto custom-scrollbar shadow-inner break-all">
                                  {isRevealed ? secret.value : '************************'}
                               </code>
                               {!isRevealed && <div className="text-[10px] text-vs-text-muted font-bold opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter shrink-0">Masked</div>}
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className={`px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full border ${secret.env === 'Production' ? 'bg-orange-500/10 text-vs-error border-vs-error/30' : secret.env === 'Staging' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}>
                               {secret.env}
                             </span>
                          </td>
                          <td className="px-6 py-4 text-vs-text-muted font-mono text-[11px] uppercase"><RelativeTime timestamp={secret.timestamp} /></td>
                          <td className="px-6 py-4 text-right">
                             <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => toggleReveal(secret.id)} 
                                  className="p-1 text-gray-400 hover:text-white hover:bg-vs-active rounded-sm border-none cursor-pointer"
                                  title={isRevealed ? "Mask secret" : "Reveal secret"}
                                >
                                  {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                                <button 
                                  onClick={() => copyToClipboard(secret.id, secret.value)} 
                                  className="p-1 text-gray-400 hover:text-white hover:bg-vs-active rounded-sm border-none cursor-pointer"
                                  title="Copy to clipboard"
                                >
                                  {isCopied ? <Check size={14} className="text-vs-success" /> : <Copy size={14} />}
                                </button>
                                <div className="w-[1px] h-4 bg-vs-border mx-1"></div>
                                <button 
                                  onClick={() => handleEdit(secret)} 
                                  className="p-1 text-gray-400 hover:text-blue-400 hover:bg-vs-active rounded-sm border-none cursor-pointer"
                                  title="Edit Secret"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDelete(secret.id)} 
                                  className="p-1 text-gray-400 hover:text-vs-error hover:bg-vs-active rounded-sm border-none cursor-pointer"
                                  title="Delete Secret"
                                >
                                  <Trash2 size={14} />
                                </button>
                             </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredSecrets.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center text-vs-text-muted bg-vs-panel/20">
                          <div className="flex flex-col items-center gap-3">
                            <KeyRound size={32} className="opacity-20" />
                            <p className="italic">No secrets currently provisioned for the <span className="text-vs-accent font-bold uppercase">{filter}</span> environment context.</p>
                            <button onClick={() => setShowInjectModal(true)} className="text-vs-accent hover:underline text-xs bg-transparent border-none cursor-pointer">Inject first secret</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
              </table>
           </div>
        </div>
      </div>

      {showInjectModal && (
         <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-vs-panel border border-vs-border rounded shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
               <div className="px-4 py-3 border-b border-vs-border flex justify-between items-center bg-vs-header">
                 <h2 className="text-white text-sm font-medium">Inject Secret</h2>
                 <button onClick={resetModalState} className="text-gray-400 hover:text-white border-none cursor-pointer bg-transparent"><X size={16}/></button>
               </div>
               <div className="p-4 space-y-4">
                  <div className="flex flex-col gap-1">
                    <label className="block text-xs text-gray-400 mb-1">Key Name (Sanitized)</label>
                    <input value={newKeyName} onChange={e=>handleKeyNameChange(e.target.value)} placeholder="e.g. AWS_ACCESS_KEY" className="w-full bg-vs-base border border-vs-border p-2 text-sm text-vs-accent rounded outline-none focus:border-vs-accent font-mono" />
                  </div>
                  {errorStatus && <p className="text-vs-error text-[10px] font-bold flex items-center gap-1"><AlertCircle size={10}/> {errorStatus}</p>}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Value</label>
                    <input type="password" value={newValue} onChange={e=>setNewValue(e.target.value)} placeholder="Secret value..." className="w-full bg-vs-base border border-vs-border p-2 text-sm text-white rounded outline-none focus:border-vs-accent font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Environment Scope</label>
                    <VSCodeSelect 
                      value={newEnv} 
                      options={['Development', 'Staging', 'Production']} 
                      onChange={(v) => setNewEnv(v as any)} 
                      className="w-full"
                    />
                  </div>
               </div>
               <div className="p-4 border-t border-vs-border flex justify-end gap-2 bg-vs-bg">
                 <button onClick={resetModalState} className="border-none cursor-pointer bg-transparent px-4 py-1.5 text-xs text-gray-400 hover:text-white">Cancel</button>
                 <button onClick={handleInject} disabled={!newKeyName || !newValue} className="px-4 py-1.5 border-none cursor-pointer text-xs bg-vs-accent hover:bg-vs-accent-hover text-white rounded disabled:opacity-50">Create Key</button>
               </div>
            </div>
         </div>
      )}

      {showExportModal && (
         <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-vs-panel border border-vs-border rounded shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden">
               <div className="px-4 py-3 border-b border-vs-border flex justify-between items-center bg-vs-header">
                 <h2 className="text-white text-sm font-medium">Export Infrastructure Payload</h2>
                 <button onClick={() => setShowExportModal(false)} className="border-none cursor-pointer bg-transparent text-gray-400 hover:text-white"><X size={16}/></button>
               </div>
               <div className="p-4">
                  <div className="flex gap-2 mb-4 p-1 bg-vs-base border border-vs-border rounded-sm w-fit">
                    <button onClick={() => setExportFormat('github')} className={`px-4 py-1 text-[10px] font-bold uppercase rounded-sm border-none cursor-pointer ${exportFormat === 'github' ? 'bg-vs-active text-white' : 'text-vs-text-muted hover:text-white bg-transparent'}`}>GitHub</button>
                    <button onClick={() => setExportFormat('gitlab')} className={`px-4 py-1 text-[10px] font-bold uppercase rounded-sm border-none cursor-pointer ${exportFormat === 'gitlab' ? 'bg-vs-active text-white' : 'text-vs-text-muted hover:text-white bg-transparent'}`}>GitLab CI</button>
                  </div>
                  <p className="text-xs text-gray-400 mb-4 italic opacity-80">
                    The {exportFormat === 'github' ? 'GitHub Actions' : 'GitLab API'} block below ensures that tokens are strictly redacted from logs.
                  </p>
                  <textarea readOnly value={generatedYaml} className="w-full h-64 bg-black border border-vs-border p-3 text-xs text-vs-success rounded outline-none font-mono resize-none leading-relaxed" />
               </div>
               <div className="p-4 border-t border-vs-border flex justify-end bg-vs-bg gap-2">
                 <button 
                   onClick={() => {
                     const blob = new Blob([generatedYaml], { type: 'text/yaml' });
                     const url = URL.createObjectURL(blob);
                     const a = document.createElement('a');
                     a.href = url;
                     a.download = exportFormat === 'github' ? 'github-secret-sync.yml' : '.gitlab-provision.sh';
                     a.click();
                     URL.revokeObjectURL(url);
                   }} 
                   className="px-4 py-1.5 text-xs bg-vs-base hover:bg-vs-hover text-white rounded flex items-center gap-1 border border-vs-border shadow-sm cursor-pointer"
                 >
                   <Download size={14}/> Download .yml
                 </button>
                 <button 
                   onClick={() => {
                     navigator.clipboard.writeText(generatedYaml);
                     setCopiedPipeline(true);
                     setTimeout(() => setCopiedPipeline(false), 2000);
                   }} 
                   className="px-4 py-1.5 text-xs bg-vs-accent hover:bg-vs-accent-hover text-white rounded flex items-center gap-1 border border-transparent shadow-sm cursor-pointer"
                 >
                   {copiedPipeline ? <Check size={14} className="text-white" /> : <Copy size={14}/>} 
                   {copiedPipeline ? 'Copied!' : 'Copy Pipeline YAML'}
                 </button>
               </div>
            </div>
         </div>
      )}
    </main>
  );
};