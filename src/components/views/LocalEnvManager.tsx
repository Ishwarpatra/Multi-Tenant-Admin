import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Trash2, Key, ChevronRight, FileText, 
  Search, Info, AlertCircle, Save, FolderOpen, FilePlus, X
} from 'lucide-react';
import { useWorkspace, useNotifications } from '../../context/AppContext';
import { useDebounce } from '../../hooks/useDebounce';

export const LocalEnvManager: React.FC = () => {
  const { files, setFiles } = useWorkspace();
  const { addNotification } = useNotifications();
  
  const [activeFileIdx, setActiveFileIdx] = useState(0);
  const [expanded, setExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<number | null>(null);
  
  const [newFileName, setNewFileName] = useState('.env.custom');
  const [rawEnvText, setRawEnvText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);

  const activeFile = files[activeFileIdx] || { name: '', vars: [] };

  const handleSave = () => {
    // Validation: Check for duplicate keys in active file
    const keys = new Set<string>();
    const activeFileVars = files[activeFileIdx].vars;
    
    for (const v of activeFileVars) {
      if (!v.key && v.value) {
        addNotification({ type: 'error', title: 'Save Prevented', message: 'Variables with values must have valid keys.' });
        return;
      }
      if (v.key && keys.has(v.key)) {
        addNotification({ type: 'error', title: 'Save Prevented', message: `Duplicate key detected: ${v.key}` });
        return;
      }
      if (v.key) keys.add(v.key);
    }

    setSaving(true);
    setTimeout(() => {
      // Scrubbing: Filter out entries where key is entirely empty
      const newFiles = [...files];
      newFiles[activeFileIdx].vars = newFiles[activeFileIdx].vars.filter(v => v.key.trim() !== '');
      setFiles(newFiles);
      
      setSaving(false);
      addNotification({ type: 'success', title: 'File Synchronized', message: `Successfully pushed ${activeFile.name} changes to workspace agent.` });
    }, 800);
  };

  const executeCreateFile = () => {
    if (!newFileName) return;
    
    if (!/^\.env(\.[a-zA-Z0-9_-]+)?$/.test(newFileName)) {
      addNotification({ type: 'error', title: 'Invalid File Name', message: 'Environment file names must match .env or .env.[suffix]' });
      return;
    }

    if (files.some(f => f.name.toLowerCase() === newFileName.toLowerCase())) {
      addNotification({ type: 'error', title: 'Collision Detected', message: 'A file with that name (case-insensitive) already exists.' });
      return;
    }

    setFiles(prev => [...prev, { name: newFileName, vars: [] }]);
    setActiveFileIdx(files.length);
    setCreateModalOpen(false);
    setNewFileName('.env.custom');
  };

  const executeDeleteFile = () => {
    if (deleteModalOpen === null) return;
    const idx = deleteModalOpen;
    
    if (files.length <= 1) {
      addNotification({ type: 'error', title: 'Policy Violation', message: 'Workspace requires at least one active .env manifest.' });
      setDeleteModalOpen(null);
      return;
    }

    const deletedFileName = files[idx].name;
    setFiles(prev => prev.filter((_, i) => i !== idx));
    
    // Only shift index if we are deleting the active file or something preceding it
    if (activeFileIdx === idx) {
      setActiveFileIdx(Math.max(0, idx - 1));
    } else if (idx < activeFileIdx) {
      setActiveFileIdx(activeFileIdx - 1);
    }
    
    addNotification({ type: 'info', title: 'File Deleted', message: `Successfully removed ${deletedFileName} from workspace.` });
    setDeleteModalOpen(null);
  };

  const handleRawImport = () => {
    try {
      setParseError(null);
      const vars: any[] = [];
      const lines = rawEnvText.split(/\r?\n/);
      let insideQuotes: string | null = null;
      let currentKey = '';
      let currentValue = '';
      
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        if (insideQuotes) {
           if (line.endsWith(insideQuotes)) {
              currentValue += '\n' + line.slice(0, -1);
              vars.push({ id: crypto.randomUUID(), key: currentKey, value: currentValue, comment: '', isActive: true });
              insideQuotes = null;
           } else {
              currentValue += '\n' + line;
           }
           continue;
        }

        line = line.trim();
        if (!line || line.startsWith('#')) continue;

        // Handle optional 'export ' prefix
        const match = line.match(/^(?:export\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*=(.*)$/);
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
             } else {
               val = val.split(/\s+#/)[0].trim();
             }
             vars.push({ id: crypto.randomUUID(), key, value: val, comment: '', isActive: true });
          }
        }
      }
      
      if (insideQuotes) throw new Error("Unterminated string literal.");
      
      const newFiles = [...files];
      const activeVars = [...newFiles[activeFileIdx].vars];
      
      for (const parsed of vars) {
         const existingIndex = activeVars.findIndex(v => v.key === parsed.key);
         if (existingIndex !== -1) {
            activeVars[existingIndex] = { ...activeVars[existingIndex], value: parsed.value };
         } else {
            activeVars.push(parsed);
         }
      }
      
      newFiles[activeFileIdx].vars = activeVars;
      setFiles(newFiles);
      setImportModalOpen(false);
      setRawEnvText('');
      addNotification({ type: 'success', title: 'Import Succeeded', message: `Merged ${vars.length} variables into ${activeFile.name}.` });
    } catch (err: any) {
      setParseError(err.message || 'Parser Error: Invalid .env payload structure.');
    }
  };

  const addVar = () => {
    const newFiles = [...files];
    newFiles[activeFileIdx].vars.push({ id: crypto.randomUUID(), key: '', value: '', comment: '', isActive: true });
    setFiles(newFiles);
  };

  const updateVar = (id: string, field: 'key'|'value', val: string) => {
    const newFiles = [...files];
    const item = newFiles[activeFileIdx].vars.find(v => v.id === id);
    if (!item) return;
    
    if (field === 'key') {
      let sanitized = val.replace(/[^a-zA-Z0-9_]/g, '').toUpperCase();
      if (/^[0-9]/.test(sanitized)) sanitized = '_' + sanitized;
      item.key = sanitized;
    } else {
      item.value = val;
    }
    setFiles(newFiles);
  };

  const removeVar = (id: string) => {
    const newFiles = [...files];
    newFiles[activeFileIdx].vars = newFiles[activeFileIdx].vars.filter(v => v.id !== id);
    setFiles(newFiles);
  };

  const filteredVars = activeFile.vars.filter(v => 
    v.key.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
    v.value.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full bg-vs-base text-vs-text font-sans">
      <aside className="w-64 border-r border-vs-border bg-vs-bg flex flex-col flex-shrink-0 relative">
        <div className="px-4 py-2 mt-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-vs-text-muted">
          <span>Local Workspace</span>
          <div className="flex items-center gap-1.5">
             <button onClick={() => setCreateModalOpen(true)} className="p-1 hover:bg-vs-active rounded text-vs-text-muted hover:text-white transition-colors border-none bg-transparent cursor-pointer" title="New File">
               <FilePlus size={13} />
             </button>
             <FolderOpen size={13} />
          </div>
        </div>
        
        <button 
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-1 px-1 py-1 mt-2 hover:bg-vs-hover text-[11px] font-bold border-none bg-transparent text-vs-text text-left"
        >
          <ChevronRight size={14} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
          .ENV FILES
        </button>

        {expanded && (
          <div className="flex flex-col mt-0.5" role="tree">
            {files.map((file, idx) => (
              <button
                key={file.name}
                onClick={() => setActiveFileIdx(idx)}
                role="treeitem"
                aria-selected={activeFileIdx === idx}
                className={`flex justify-between items-center px-6 py-1 text-[13px] border-none text-left w-full h-7 group/item ${activeFileIdx === idx ? 'bg-vs-active text-white' : 'text-vs-text-muted hover:bg-vs-hover hover:text-vs-text cursor-pointer bg-transparent'}`}
              >
                <div className="flex items-center gap-2 pointer-events-none truncate">
                  <FileText size={14} className={activeFileIdx === idx ? 'text-vs-accent' : 'text-vs-text-muted'} />
                  <span className="truncate">{file.name}</span>
                </div>
                <div 
                  onClick={(e) => { e.stopPropagation(); setDeleteModalOpen(idx); }} 
                  className="p-1 text-vs-text-muted hover:text-vs-error opacity-0 group-hover/item:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </div>
              </button>
            ))}
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="px-6 py-4 border-b border-vs-border flex items-center justify-between bg-vs-bg">
          <div className="flex items-center gap-3">
             <FileText size={18} className="text-vs-accent" />
             <h2 className="text-white text-sm font-medium">{activeFile.name} <span className="text-vs-text-muted font-normal ml-1">Editor</span></h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-vs-text-muted" />
              <input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Filter variables..."
                className="bg-vs-base border border-vs-border rounded-sm py-1.5 pl-8 pr-7 text-xs text-white focus:border-vs-accent outline-none w-48"
              />
              {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-1 top-1.5 p-1 text-vs-text-muted hover:text-white bg-transparent border-none cursor-pointer"><X size={13}/></button>}
            </div>
            <button 
              onClick={() => setImportModalOpen(true)}
              className="bg-vs-base hover:bg-vs-hover text-white text-xs px-3 py-1.5 rounded-sm transition-colors border border-vs-border cursor-pointer flex gap-2 items-center"
            >
              Parse Raw
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-vs-accent hover:bg-vs-accent-hover text-white text-xs px-4 py-1.5 rounded-sm transition-colors flex items-center gap-2 border-none cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={14} />}
              Push Changes
            </button>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="max-w-4xl space-y-3">
            <div className="grid grid-cols-[1fr_1.5fr_40px] gap-4 mb-2 text-[10px] font-bold text-vs-text-muted uppercase tracking-widest px-2">
              <span>Environment Key</span>
              <span>Configuration Value</span>
              <span></span>
            </div>

            {filteredVars.map((v) => (
              <div key={v.id} className="grid grid-cols-[1fr_1.5fr_40px] gap-2 items-center animate-in fade-in duration-200">
                <input 
                  value={v.key}
                  onChange={e => updateVar(v.id, 'key', e.target.value)}
                  placeholder="DB_HOST"
                  className="bg-vs-base border border-vs-border rounded-sm p-2 text-xs font-mono text-vs-accent focus:border-vs-accent outline-none"
                />
                <input 
                  value={v.value}
                  onChange={e => updateVar(v.id, 'value', e.target.value)}
                  placeholder="localhost:5432"
                  className="bg-vs-base border border-vs-border rounded-sm p-2 text-xs font-mono text-vs-text focus:border-vs-accent outline-none"
                />
                <button 
                  onClick={() => removeVar(v.id)}
                  className="p-2 hover:bg-vs-error/10 text-vs-text-muted hover:text-vs-error transition-all rounded-sm border-none bg-transparent cursor-pointer"
                  title="Remove Variable"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}

            {filteredVars.length === 0 && (
              <div className="p-12 text-center text-vs-text-muted italic border border-dashed border-vs-border rounded-lg bg-vs-base/30">
                {searchTerm ? `No matches found for "${searchTerm}"` : 'No variables defined in this manifest.'}
              </div>
            )}

            <button 
              onClick={addVar}
              className="w-full py-4 mt-4 border border-dashed border-vs-border rounded-sm hover:bg-vs-hover transition-colors flex flex-col items-center gap-2 text-vs-text-muted group border-none bg-transparent cursor-pointer"
            >
              <Plus size={20} className="opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all text-vs-accent" />
              <span className="text-[11px] font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 italic">Add metadata entry</span>
            </button>
          </div>
        </section>

        <footer className="px-6 py-4 border-t border-vs-border flex items-start gap-4 bg-vs-bg">
           <Info size={16} className="text-vs-accent shrink-0 mt-0.5" />
           <div className="text-[11px] text-vs-text-muted leading-relaxed">
             <strong className="text-white block mb-1">Infrastructure Synchronization Agent</strong>
             Workspace entities are persisted via cached local storage. All changes must be pushed to the virtual disk context before they can be evaluated by the runtime telemetry agent.
           </div>
        </footer>

        {/* Modal Overlay System */}
        {(importModalOpen || createModalOpen || deleteModalOpen !== null) && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-8 z-[200] backdrop-blur-[2px]">
             {/* Import Modal */}
             {importModalOpen && (
               <div className="w-full max-w-2xl bg-vs-bg rounded shadow-2xl border border-vs-border overflow-hidden animate-in zoom-in-95 duration-200">
                  <header className="px-4 py-3 bg-vs-header border-b border-vs-border flex justify-between items-center">
                     <h2 className="text-sm font-medium text-white flex items-center gap-2">
                       <FileText size={16} className="text-vs-accent" /> Raw Import Engine
                     </h2>
                     <button onClick={() => { setImportModalOpen(false); setRawEnvText(''); }} className="text-vs-text-muted hover:text-white border-none bg-transparent cursor-pointer">
                       <X size={18} />
                     </button>
                  </header>
                  <div className="p-5 flex flex-col min-h-0">
                     <p className="text-[12px] text-vs-text-muted mb-4 leading-relaxed">
                       Paste keys from a standard <code className="bg-vs-base px-1.5 py-0.5 rounded text-vs-text">.env</code> file. Existing keys will be <strong className="text-white">overwritten</strong>; new keys will be appended to the bottom of the manifest.
                     </p>
                     {parseError && (
                       <div className="mb-4 bg-vs-error/10 border border-vs-error text-vs-error p-3 rounded text-[11px] flex items-center gap-2">
                         <AlertCircle size={14} /> {parseError}
                       </div>
                     )}
                     <textarea
                       autoFocus
                       value={rawEnvText}
                       onChange={(e) => setRawEnvText(e.target.value)}
                       className="w-full h-80 bg-vs-base border border-vs-border focus:border-vs-accent rounded p-4 text-[12px] font-mono text-vs-text outline-none resize-none leading-relaxed"
                       placeholder="DATABASE_URL=postgres://...&#10;export NODE_ENV=production"
                     />
                  </div>
                  <footer className="px-5 py-3 bg-vs-header border-t border-vs-border flex justify-end gap-3">
                     <button onClick={() => setImportModalOpen(false)} className="px-4 py-1.5 text-xs text-vs-text-muted hover:text-white bg-transparent border border-vs-border rounded-sm cursor-pointer">Cancel</button>
                     <button onClick={handleRawImport} className="px-6 py-1.5 text-xs bg-vs-accent hover:bg-vs-accent-hover text-white rounded-sm border-none font-bold">Merge Variables</button>
                  </footer>
               </div>
             )}

             {/* Create File Modal */}
             {createModalOpen && (
               <div className="w-96 bg-vs-bg rounded shadow-2xl border border-vs-border overflow-hidden animate-in zoom-in-95 duration-200">
                  <header className="px-4 py-3 bg-vs-header border-b border-vs-border flex justify-between items-center text-sm font-medium text-white">
                    New Configuration Manifest
                    <button onClick={() => setCreateModalOpen(false)} className="text-vs-text-muted hover:text-white border-none bg-transparent cursor-pointer"><X size={16} /></button>
                  </header>
                  <div className="p-5">
                    <label className="text-[10px] font-bold text-vs-text-muted uppercase mb-2 block">FILE PATH</label>
                    <input 
                      autoFocus
                      value={newFileName}
                      onChange={e => setNewFileName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && executeCreateFile()}
                      className="w-full bg-vs-base border border-vs-border focus:border-vs-accent p-2 rounded text-xs text-white outline-none"
                    />
                    <p className="text-[10px] text-vs-text-muted mt-3">Valid format: <code className="text-vs-text">.env</code> or <code className="text-vs-text">.env.PRODUCTION_V2</code></p>
                  </div>
                  <footer className="p-4 bg-vs-header border-t border-vs-border flex justify-end gap-2">
                    <button onClick={() => setCreateModalOpen(false)} className="px-3 py-1.5 text-xs text-vs-text-muted hover:text-white bg-transparent border border-vs-border cursor-pointer">Cancel</button>
                    <button onClick={executeCreateFile} className="px-4 py-1.5 text-xs bg-vs-accent hover:bg-vs-accent-hover text-white rounded font-bold border-none">Provision File</button>
                  </footer>
               </div>
             )}

             {/* Delete Confirm Modal */}
             {deleteModalOpen !== null && (
                <div className="w-80 bg-vs-bg rounded shadow-2xl border border-vs-border overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-6 text-center">
                    <Trash2 size={40} className="text-vs-error mb-4 mx-auto opacity-80" />
                    <h3 className="text-sm font-medium text-white mb-2">Delete workspace manifest?</h3>
                    <p className="text-xs text-vs-text-muted leading-relaxed">
                      You are about to permanently purge <span className="text-white font-mono">{files[deleteModalOpen].name}</span>. This operation is not reversible.
                    </p>
                  </div>
                  <footer className="p-3 bg-vs-panel border-t border-vs-border flex items-center justify-center gap-3">
                    <button onClick={() => setDeleteModalOpen(null)} className="flex-1 py-2 text-xs text-vs-text-muted hover:text-white bg-transparent border border-vs-border rounded hover:bg-vs-active cursor-pointer transition-colors">Abort</button>
                    <button onClick={executeDeleteFile} className="flex-1 py-2 text-xs bg-vs-error/20 hover:bg-vs-error text-vs-error hover:text-white rounded border border-vs-error cursor-pointer font-bold transition-all">Confirm Delete</button>
                  </footer>
                </div>
             )}
          </div>
        )}
      </main>
    </div>
  );
};

const Loader2 = ({size, className}: {size: number, className: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
