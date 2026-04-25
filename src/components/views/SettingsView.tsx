import React, { useState } from 'react';
import { Settings, Search } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState('Dark (Visual Studio Code)');
  const [autosave, setAutosave] = useState('afterDelay');
  const [fontSize, setFontSize] = useState('14');
  
  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-[#cccccc] font-sans">
      <div className="px-6 py-4 border-b border-[#3c3c3c] bg-[#252526] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings size={18} className="text-[#007fd4]" />
          <h2 className="text-white text-[15px] font-medium tracking-tight">Settings</h2>
        </div>
        <div className="w-64 relative">
           <Search size={14} className="absolute left-2.5 top-2 text-gray-500" />
           <input 
             value={search}
             onChange={e => setSearch(e.target.value)}
             placeholder="Search settings" 
             className="w-full bg-[#3c3c3c] border border-transparent focus:border-[#007fd4] text-white px-8 py-1.5 text-xs outline-none"
           />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="max-w-3xl space-y-8">
          <section>
            <h3 className="text-sm font-semibold text-white mb-4 border-b border-[#3c3c3c] pb-2">Commonly Used</h3>
            
            <div className="space-y-6">
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-medium text-[#e7e7e7]">Editor: Font Size</label>
                <div className="text-[12px] text-gray-400 mb-1">Controls the font size in pixels.</div>
                <input 
                  type="number" 
                  value={fontSize}
                  onChange={e => setFontSize(e.target.value)}
                  className="bg-[#3c3c3c] border border-transparent focus:border-[#007fd4] text-white px-2 py-1 text-sm outline-none w-32"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-medium text-[#e7e7e7]">Files: Auto Save</label>
                <div className="text-[12px] text-gray-400 mb-1">Controls auto save of dirty editors. Read more about auto save.</div>
                <select 
                  value={autosave}
                  onChange={e => setAutosave(e.target.value)}
                  className="bg-[#3c3c3c] border border-transparent focus:border-[#007fd4] text-white px-2 py-1 text-sm outline-none w-48"
                >
                  <option value="off">off</option>
                  <option value="afterDelay">afterDelay</option>
                  <option value="onFocusChange">onFocusChange</option>
                  <option value="onWindowChange">onWindowChange</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-medium text-[#e7e7e7]">Workbench: Color Theme</label>
                <div className="text-[12px] text-gray-400 mb-1">Specifies the color theme used in the workbench.</div>
                <select 
                  value={theme}
                  onChange={e => setTheme(e.target.value)}
                  className="bg-[#3c3c3c] border border-transparent focus:border-[#007fd4] text-white px-2 py-1 text-sm outline-none w-64"
                >
                  <option value="Dark (Visual Studio Code)">Dark (Visual Studio Code)</option>
                  <option value="Light (Visual Studio Code)">Light (Visual Studio Code)</option>
                  <option value="High Contrast">High Contrast</option>
                </select>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
