import React, { useState, useEffect } from 'react';
import { Settings, Search, Check, ChevronDown, X } from 'lucide-react';
import { useApp, Theme } from '../../context/AppContext';
import { VSCodeSelect } from '../ui/VSCodeSelect';

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

export const SettingsView: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  const settingRows = [
    {
      id: 'font-size',
      category: 'Commonly Used',
      label: 'Editor: Font Size',
      description: 'Controls the font size in pixels across the entire application interface.',
      control: (
        <input 
          id="font-size"
          aria-describedby="font-size-desc"
          type="number" 
          value={settings.fontSize}
          onChange={e => updateSettings({ fontSize: parseInt(e.target.value) || 12 })}
          className="bg-vs-bg border border-vs-border focus:border-vs-accent text-vs-text px-2 py-1 text-sm outline-none w-32 rounded-sm"
        />
      )
    },
    {
      id: 'auto-save',
      category: 'Commonly Used',
      label: 'Files: Auto Save',
      description: 'Controls auto save of dirty editors. Choose afterDelay to save changes automatically.',
      control: (
        <VSCodeSelect 
          id="auto-save"
          aria-describedby="auto-save-desc"
          value={settings.autosave} 
          options={['off', 'afterDelay', 'onFocusChange', 'onWindowChange']} 
          onChange={(val) => updateSettings({ autosave: val as any })}
        />
      )
    },
    {
      id: 'color-theme',
      category: 'Workbench',
      label: 'Workbench: Color Theme',
      description: 'Specifies the color theme used in the workbench. High Contrast mode is optimized for accessibility.',
      control: (
        <VSCodeSelect 
          id="color-theme"
          aria-describedby="color-theme-desc"
          value={settings.theme} 
          options={['dark', 'light', 'hc']} 
          labels={{ dark: 'Dark (Visual Studio)', light: 'Light (Visual Studio)', hc: 'High Contrast' }}
          onChange={(val) => updateSettings({ theme: val as Theme })}
        />
      )
    },
    {
      id: 'telemetry',
      category: 'Security',
      label: 'Telemetry: Enable Heartbeat',
      description: 'Determines if health metrics from peripheral nodes are aggregated into the Control Plane.',
      control: (
        <div className="flex items-center gap-2">
          <input 
            id="telemetry"
            aria-describedby="telemetry-desc"
            type="checkbox" 
            checked={settings.telemetryEnabled}
            onChange={e => updateSettings({ telemetryEnabled: e.target.checked })}
            className="w-4 h-4 cursor-pointer"
          />
          <label htmlFor="telemetry" className="text-vs-text-muted text-xs">Enabled</label>
        </div>
      )
    }
  ];

  const filteredRows = settingRows.filter(row => 
    row.label.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
    row.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    row.category.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-vs-base text-vs-text font-sans animate-in fade-in duration-300">
      <header className="px-6 py-4 border-b border-vs-border bg-vs-bg flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Settings size={18} className="text-vs-accent" />
          <h2 className="text-vs-text text-[15px] font-medium tracking-tight">Settings</h2>
        </div>
        <div className="w-72 relative">
           <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-vs-text-muted" />
           <input 
             value={search}
             onChange={e => setSearch(e.target.value)}
             placeholder="Search settings (e.g. 'theme' or 'font')" 
             className="w-full bg-vs-active border border-vs-border focus:border-vs-accent text-vs-text px-8 py-1.5 text-xs outline-none rounded-sm transition-all shadow-inner"
           />
           {search && <button onClick={() => setSearch('')} className="absolute right-1.5 top-1.5 text-vs-text-muted hover:text-vs-text bg-transparent border-none cursor-pointer"><X size={12}/></button>}
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-4xl space-y-12">
          {filteredRows.length > 0 ? (
            <div className="space-y-10">
              {Array.from(new Set(filteredRows.map(r => r.category))).map(cat => (
                <section key={cat}>
                  <h3 className="text-[11px] font-bold text-vs-text mb-6 border-b border-vs-border pb-2 uppercase tracking-widest opacity-60">{cat}</h3>
                  <div className="space-y-8 pl-4">
                    {filteredRows.filter(r => r.category === cat).map(row => (
                      <div key={row.id} className="flex flex-col gap-1 max-w-2xl animate-in slide-in-from-left-2 duration-300">
                        <label htmlFor={row.id} className="text-[13px] font-semibold text-vs-text">{row.label}</label>
                        <p id={`${row.id}-desc`} className="text-[12px] text-vs-text-muted mb-3 leading-relaxed">{row.description}</p>
                        {row.control}
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-20 text-vs-text-muted">
              <Search size={40} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">No settings found matching "{search}"</p>
              <button 
                onClick={() => setSearch('')}
                className="mt-4 text-vs-accent hover:underline text-xs bg-transparent border-none cursor-pointer"
              >
                Clear search filter
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

