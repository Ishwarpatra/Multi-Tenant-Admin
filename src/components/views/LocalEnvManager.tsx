import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Key, ChevronRight, FileText, Edit2 } from 'lucide-react';

interface EnvVar {
  key: string;
  value: string;
}

export const LocalEnvManager: React.FC = () => {
  const [envFiles, setEnvFiles] = useState<{name: string, vars: EnvVar[]}[]>([
    { name: '.env', vars: [{ key: 'DATABASE_URL', value: 'postgresql://postgres:password@localhost:5432/db' }, { key: 'API_PORT', value: '3000' }] },
    { name: '.env.production', vars: [{ key: 'DATABASE_URL', value: 'postgresql://prod:secret@aws-rds:5432/platform' }, { key: 'STRIPE_SECRET', value: 'sk_live_...' }] }
  ]);
  
  const [activeFileIdx, setActiveFileIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(true);

  // Debounced save
  useEffect(() => {
    setSaving(true);
    const timer = setTimeout(() => setSaving(false), 800);
    return () => clearTimeout(timer);
  }, [envFiles]);

  const activeFile = envFiles[activeFileIdx];

  const handleUpdate = (varIdx: number, newKey: string, newValue: string) => {
    const newFiles = [...envFiles];
    newFiles[activeFileIdx].vars[varIdx] = { key: newKey, value: newValue };
    setEnvFiles(newFiles);
  };

  const handleCreate = () => {
    const newFiles = [...envFiles];
    newFiles[activeFileIdx].vars.push({ key: '', value: '' });
    setEnvFiles(newFiles);
  };

  const handleDelete = (varIdx: number) => {
    const newFiles = [...envFiles];
    newFiles[activeFileIdx].vars.splice(varIdx, 1);
    setEnvFiles(newFiles);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-[#cccccc] font-sans">
      <div className="px-6 py-4 border-b border-[#3c3c3c] bg-[#252526] flex justify-between items-center">
        <div>
           <h2 className="text-white text-[14px] font-medium tracking-tight flex items-center gap-2">
             <Key size={16} className="text-[#007fd4]" /> Local Workspace .env Manager
           </h2>
           <p className="text-gray-500 text-[12px] mt-1">Real-time parser and scope visualizer for local environment files</p>
        </div>
        <div className="flex gap-2 text-xs">
           <span className={`flex items-center gap-1 transition-opacity ${saving ? 'opacity-100' : 'opacity-0'} text-gray-400`}>
             <Save size={12} className="animate-pulse" /> Saving...
           </span>
           {!saving && <span className="flex items-center gap-1 text-gray-500"><Save size={12} /> Saved</span>}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
         {/* File list (VS Code Tree View Simulation) */}
         <div className="w-64 border-r border-[#3c3c3c] bg-[#252526] flex flex-col pt-2 select-none">
            <div className="px-5 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center justify-between">
              <span>EXPLORER</span>
              <span className="cursor-pointer hover:text-gray-300">...</span>
            </div>
            
            <div className="flex flex-col mt-1">
              {/* Root Folder Level */}
              <div 
                className="flex items-center px-1 py-1 cursor-pointer hover:bg-[#2a2d2e] group"
                onClick={() => setExpanded(!expanded)}
              >
                 <div className="w-5 flex justify-center text-gray-400">
                    <ChevronRight size={16} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
                 </div>
                 <span className="text-[11px] font-bold tracking-wider text-gray-300 font-mono uppercase">MULTITENANT-WORKSPACE</span>
              </div>
              
              {/* Files Level */}
              {expanded && (
                <div className="flex flex-col">
                  {envFiles.map((f, idx) => (
                    <div 
                      key={f.name}
                      onClick={() => setActiveFileIdx(idx)}
                      className={`flex items-center pl-6 pr-2 py-1 cursor-pointer transition-colors group relative ${activeFileIdx === idx ? 'bg-[#37373d] text-white' : 'hover:bg-[#2a2d2e] text-[#cccccc]'}`}
                    >
                      <div className="w-4 flex justify-center mr-1">
                        <FileText size={14} className={f.name.includes('production') ? 'text-orange-400' : 'text-yellow-400'} />
                      </div>
                      <span className="text-[13px]">{f.name}</span>
                      
                      {/* Context Actions (On Hover) */}
                      <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="p-0.5 hover:bg-[#4d4d4d] rounded text-gray-400 hover:text-white" title="Add Variable" onClick={(e) => { e.stopPropagation(); setActiveFileIdx(idx); handleCreate(); }}>
                           <Plus size={14} />
                         </button>
                         <button className="p-0.5 hover:bg-[#4d4d4d] rounded text-gray-400 hover:text-white" title="Rename" onClick={(e) => e.stopPropagation()}>
                           <Edit2 size={12} />
                         </button>
                         <button className="p-0.5 hover:bg-[#4d4d4d] rounded text-gray-400 hover:text-white" title="Delete" onClick={(e) => { e.stopPropagation(); /* mock delete */ }}>
                           <Trash2 size={12} />
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
         </div>

         {/* Variables editor */}
         <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-[#1e1e1e]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-200 font-mono">{activeFile.name} Variables</h3>
              <button onClick={handleCreate} className="px-3 py-1.5 text-xs bg-[#007fd4] hover:bg-[#0069a1] text-white rounded transition-colors flex items-center gap-1 border border-transparent">
                 <Plus size={14} /> Add Variable
              </button>
            </div>
            
            <div className="space-y-2">
              {activeFile.vars.map((v, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                     value={v.key}
                     onChange={(e) => handleUpdate(i, e.target.value, v.value)}
                     placeholder="KEY_NAME"
                     className="flex-1 max-w-[250px] bg-[#2d2d2d] border border-[#454545] focus:border-[#007fd4] rounded px-3 py-1.5 text-xs font-mono text-blue-400 outline-none"
                  />
                  <span className="text-gray-500 font-mono">=</span>
                  <input
                     value={v.value}
                     onChange={(e) => handleUpdate(i, v.key, e.target.value)}
                     placeholder="Value"
                     className="flex-1 bg-[#2d2d2d] border border-[#454545] focus:border-[#007fd4] rounded px-3 py-1.5 text-xs font-mono text-green-400 outline-none"
                  />
                  <button onClick={() => handleDelete(i)} className="p-1.5 text-gray-500 hover:text-[#f4511e] hover:bg-[#f4511e]/10 rounded transition-colors">
                     <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {activeFile.vars.length === 0 && (
                <div className="text-gray-500 text-xs italic py-4">No environment variables defined in this file.</div>
              )}
            </div>
         </div>
      </div>
    </div>
  );
};
