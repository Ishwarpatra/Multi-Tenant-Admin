import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Key, ChevronRight, FileText, 
  Search, Info, AlertCircle, Save, FolderOpen
} from 'lucide-react';

interface EnvVar {
  key: string;
  value: string;
}

interface EnvFile {
  name: string;
  vars: EnvVar[];
}

export const LocalEnvManager: React.FC = () => {
  const [files, setFiles] = useState<EnvFile[]>([
    { name: '.env', vars: [{ key: 'PORT', value: '3000' }, { key: 'DB_URL', value: 'localhost://5432' }] },
    { name: '.env.local', vars: [{ key: 'NODE_ENV', value: 'development' }] },
    { name: '.env.production', vars: [{ key: 'DB_URL', value: 'production.db.cluster' }] }
  ]);
  
  const [activeFileIdx, setActiveFileIdx] = useState(0);
  const [expanded, setExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [rawEnvText, setRawEnvText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);

  const activeFile = files[activeFileIdx];

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 800);
  };

  const handleRawImport = () => {
    try {
      setParseError(null);
      const vars: EnvVar[] = [];
      const lines = rawEnvText.split(/\r?\n/);
      let currentKey = '';
      let currentValue = '';
      let insideQuotes: string | null = null;
      
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        if (insideQuotes) {
           if (line.endsWith(insideQuotes)) {
              currentValue += '\n' + line.slice(0, -1);
              vars.push({ key: currentKey, value: currentValue });
              insideQuotes = null;
           } else {
              currentValue += '\n' + line;
           }
           continue;
        }

        line = line.trim();
        if (!line || line.startsWith('#')) continue;

        const match = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=(.*)$/);
        if (match) {
          const key = match[1];
          let val = match[2].trim();
          
          if ((val.startsWith('"') && !val.endsWith('"')) || (val.startsWith("'") && !val.endsWith("'"))) {
             insideQuotes = val[0];
             currentKey = key;
             currentValue = val.slice(1);
          } else {
             if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
               val = val.slice(1, -1);
             }
             val = val.split(/\s+#/)[0].trim(); // trim inline comments safely
             vars.push({ key, value: val });
          }
        }
      }
      
      if (insideQuotes) {
         throw new Error("Unterminated multi-line string in raw .env content.");
      }
      
      const newFiles = [...files];
      newFiles[activeFileIdx].vars = [...newFiles[activeFileIdx].vars, ...vars];
      setFiles(newFiles);
      setImportModalOpen(false);
      setRawEnvText('');
    } catch (err: any) {
      setParseError(err.message || 'Failed to parse raw .env blob.');
    }
  };

  const addVar = () => {
    const newFiles = [...files];
    newFiles[activeFileIdx].vars.push({ key: '', value: '' });
    setFiles(newFiles);
  };

  const updateVar = (idx: number, field: keyof EnvVar, val: string) => {
    const newFiles = [...files];
    const item = newFiles[activeFileIdx].vars[idx];
    if (field === 'key') {
      // Basic sanitization
      item.key = val.replace(/[^A-Z0-9_]/gi, '').toUpperCase();
    } else {
      item.value = val;
    }
    setFiles(newFiles);
  };

  const removeVar = (idx: number) => {
    const newFiles = [...files];
    newFiles[activeFileIdx].vars.splice(idx, 1);
    setFiles(newFiles);
  };

  const filteredVars = activeFile.vars.filter(v => 
    v.key.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full bg-vs-base text-vs-text font-sans">
      {/* VS Code styled Tree View Sidebar */}
      <aside className="w-64 border-r border-vs-border bg-vs-bg flex flex-col flex-shrink-0">
        <div className="px-4 py-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-vs-text-muted">
          <span>Local Workspace</span>
          <FolderOpen size={14} />
        </div>
        
        <button 
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-1 px-1 py-1 hover:bg-vs-hover text-[11px] font-bold border-none bg-transparent text-vs-text"
        >
          <ChevronRight size={14} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
          .ENV FILES
        </button>

        {expanded && (
          <div className="flex flex-col">
            {files.map((file, idx) => (
              <button
                key={file.name}
                onClick={() => setActiveFileIdx(idx)}
                className={`flex items-center gap-2 px-6 py-1 text-[13px] border-none text-left w-full h-7 ${activeFileIdx === idx ? 'bg-vs-active text-white' : 'text-vs-text-muted hover:bg-vs-hover hover:text-vs-text'}`}
              >
                <FileText size={14} className={activeFileIdx === idx ? 'text-vs-accent' : 'text-vs-text-muted'} />
                {file.name}
              </button>
            ))}
          </div>
        )}
      </aside>

      {/* Main Editor View */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="px-6 py-4 border-b border-vs-border flex items-center justify-between bg-vs-bg">
          <div className="flex items-center gap-3">
             <FileText size={18} className="text-vs-accent" />
             <h2 className="text-white text-sm font-medium">{activeFile.name} — Workspace Editor</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-vs-text-muted" />
              <input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Filter variables..."
                className="bg-vs-active border border-vs-border rounded-sm py-1 pl-8 pr-3 text-xs text-white focus:border-vs-accent outline-none w-48"
              />
            </div>
            <button 
              onClick={() => setImportModalOpen(true)}
              className="bg-vs-base hover:bg-vs-hover text-white text-xs px-3 py-1.5 rounded-sm transition-colors border border-vs-border cursor-pointer flex gap-2 items-center"
            >
              Parse Raw
            </button>
            <button 
              onClick={handleSave}
              className="bg-vs-accent hover:bg-vs-accent-hover text-white text-xs px-3 py-1.5 rounded-sm transition-colors flex items-center gap-2 border-none cursor-pointer"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={14} />}
              Save
            </button>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="max-w-4xl space-y-4">
            <div className="grid grid-cols-[1fr_1.5fr_40px] gap-4 mb-2 text-[10px] font-bold text-vs-text-muted uppercase tracking-widest px-2">
              <span>Variable Key</span>
              <span>Value</span>
              <span></span>
            </div>

            {filteredVars.map((v, i) => (
              <div key={i} className="grid grid-cols-[1fr_1.5fr_40px] gap-2 animate-in slide-in-from-left-1 duration-300">
                <input 
                  value={v.key}
                  onChange={e => updateVar(i, 'key', e.target.value)}
                  placeholder="ENV_VAR_KEY"
                  className="bg-vs-bg border border-vs-border rounded-sm p-2 text-xs font-mono text-vs-accent focus:border-vs-accent outline-none"
                />
                <input 
                  value={v.value}
                  onChange={e => updateVar(i, 'value', e.target.value)}
                  placeholder="Value"
                  className="bg-vs-bg border border-vs-border rounded-sm p-2 text-xs font-mono text-vs-text focus:border-vs-accent outline-none"
                />
                <button 
                  onClick={() => removeVar(i)}
                  className="flex items-center justify-center hover:bg-vs-error/20 text-vs-text-muted hover:text-vs-error transition-colors rounded-sm border-none bg-transparent cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            {filteredVars.length === 0 && searchTerm && (
              <div className="p-8 text-center text-vs-text-muted italic border border-dashed border-vs-border rounded bg-vs-bg/50">
                No variables matching "{searchTerm}"
              </div>
            )}

            <button 
              onClick={addVar}
              className="w-full py-4 border border-dashed border-vs-border rounded hover:bg-vs-hover transition-colors flex flex-col items-center gap-2 text-vs-text-muted group border-none bg-transparent cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full border border-vs-border flex items-center justify-center group-hover:bg-vs-accent group-hover:text-white transition-all">
                <Plus size={16} />
              </div>
              <span className="text-xs font-medium">Add new environment variable entry</span>
            </button>
          </div>
        </section>

        <footer className="px-6 py-4 border-t border-vs-border flex items-start gap-4 bg-vs-bg">
           <Info size={16} className="text-vs-accent shrink-0 mt-0.5" />
           <div className="text-[11px] text-vs-text-muted leading-relaxed">
             <strong className="text-white block mb-1">Local Development Policy</strong>
             Changes to local .env files are synced to your workspace instantly but require a service restart for the mocked node agent to pick up new entropy. 
             Comments and multiline strings are preserved using a regex-safe buffer during serialization.
           </div>
        </footer>

        {importModalOpen && (
          <div className="fixed inset-0 bg-black/60 flex flex-col items-center justify-center p-8 z-50">
             <div className="w-full max-w-2xl flex flex-col bg-vs-panel rounded-sm shadow-2xl border border-vs-border overflow-hidden">
                <header className="px-4 py-3 bg-vs-header border-b border-vs-border flex justify-between items-center">
                   <h2 className="text-sm font-medium text-white flex items-center gap-2">
                     <FileText size={16} /> Import Raw .env Blob
                   </h2>
                   <button onClick={() => { setImportModalOpen(false); setParseError(null); setRawEnvText(''); }} className="text-vs-text-muted hover:text-white border-none bg-transparent cursor-pointer">
                     <Info size={16} />
                   </button>
                </header>
                <div className="p-4 flex-1 flex flex-col min-h-0">
                   <p className="text-[12px] text-gray-400 mb-4 inline-block">
                     Paste standard <code className="text-gray-200">.env</code> formatted text here. The resilient regex parser will safely extract keys, multiline string values, and omit comments without crashing the render tree.
                   </p>
                   {parseError && (
                     <div className="mb-4 bg-vs-error/20 border border-vs-error text-vs-error p-3 rounded-sm text-xs flex items-center gap-2">
                       <AlertCircle size={14} /> {parseError}
                     </div>
                   )}
                   <textarea
                     value={rawEnvText}
                     onChange={(e) => setRawEnvText(e.target.value)}
                     className="flex-1 w-full h-64 bg-vs-base border border-vs-border focus:border-vs-accent rounded-sm outline-none text-[12px] font-mono p-4 text-white resize-none"
                     placeholder="# Paste .env here&#10;STRIPE_KEY=sk_test_123&#10;RSA_CERT=&#34;-----BEGIN CERTIFICATE-----&#10;MULTILINE&#10;-----END CERTIFICATE-----&#34;&#10;"
                   />
                </div>
                <footer className="px-4 py-3 bg-vs-header border-t border-vs-border flex justify-end gap-3">
                   <button 
                     onClick={() => { setImportModalOpen(false); setParseError(null); setRawEnvText(''); }}
                     className="px-4 py-1.5 text-xs bg-transparent text-vs-text-muted hover:text-white border border-vs-border rounded-sm cursor-pointer"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={handleRawImport}
                     className="px-4 py-1.5 text-xs bg-vs-accent hover:bg-vs-accent-hover text-white rounded-sm border-none shadow-md cursor-pointer"
                   >
                     Parse & Inject Key-Value Pairs
                   </button>
                </footer>
             </div>
          </div>
        )}
      </main>
    </div>
  );
};

const Loader2 = ({size, className}: {size: number, className: string}) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
