import React from 'react';
import { Minus, Square, X, Settings } from 'lucide-react';

interface WinUI3ShellProps {
  children: React.ReactNode;
  title?: string;
}

export const WinUI3Shell: React.FC<WinUI3ShellProps> = ({ children, title = 'Application' }) => {
  return (
    <div className="w-full h-full flex flex-col bg-[#202020] text-white font-[Segoe_UI,sans-serif] shadow-2xl rounded-t-xl overflow-hidden border border-[#303030]">
      {/* Mica/Acrylic style title bar */}
      <div className="h-9 flex items-center justify-between px-3 bg-[#2b2b2b] select-none shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Mock app icon */}
          <div className="w-4 h-4 bg-blue-500 rounded-sm shadow-sm flex items-center justify-center">
             <div className="w-2 h-2 border-[1.5px] border-white transform rotate-45"></div>
          </div>
          <span className="text-[12px] text-gray-200 mt-0.5">{title}</span>
        </div>
        
        {/* Caption Buttons */}
        <div className="flex items-center -mr-3 h-full">
          <button className="h-full px-4 hover:bg-[#3d3d3d] transition-colors flex items-center justify-center">
            <Minus size={14} className="text-gray-300" strokeWidth={1} />
          </button>
          <button className="h-full px-4 hover:bg-[#3d3d3d] transition-colors flex items-center justify-center">
            <Square size={12} className="text-gray-300" strokeWidth={1.5} />
          </button>
          <button className="h-full px-4 hover:bg-[#e81123] hover:text-white transition-colors flex items-center justify-center text-gray-300">
            <X size={15} strokeWidth={1} />
          </button>
        </div>
      </div>
      
      {/* Ribbon / Toolbar */}
      <div className="h-12 bg-[#202020] border-b border-[#303030] flex items-center px-2 shadow-sm flex-shrink-0">
         <div className="px-3 h-8 flex items-center justify-center gap-2 hover:bg-[#303030] rounded cursor-pointer text-sm text-gray-300 transition-colors">
            File
         </div>
         <div className="px-3 h-8 flex items-center justify-center gap-2 hover:bg-[#303030] rounded cursor-pointer text-sm text-gray-300 transition-colors">
            Edit
         </div>
         <div className="px-3 h-8 flex items-center justify-center gap-2 hover:bg-[#303030] rounded cursor-pointer text-sm text-gray-300 transition-colors">
            View
         </div>
         <div className="ml-auto px-3 h-8 flex items-center justify-center gap-2 hover:bg-[#303030] rounded cursor-pointer text-sm text-gray-300 transition-colors">
            <Settings size={14} />
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex bg-[#1e1e1e]">
         {/* Native-looking side navigation */}
         <div className="w-60 bg-[#202020] border-r border-[#303030] flex flex-col p-2 space-y-1 z-10 flex-shrink-0 shadow-xl">
             <div className="px-3 py-2 text-sm text-white bg-[#303030] rounded-sm font-medium flex items-center">
               <div className="w-1 h-3 bg-blue-500 rounded-full mr-3"></div>
               Agent Setup
             </div>
             <div className="px-3 py-2 text-sm text-gray-400 hover:bg-[#2d2d2d] rounded-sm transition-colors cursor-pointer ml-4">
               Hardware Identity
             </div>
             <div className="px-3 py-2 text-sm text-gray-400 hover:bg-[#2d2d2d] rounded-sm transition-colors cursor-pointer ml-4">
               Local Logs
             </div>
         </div>
         
         {/* Actual view */}
         <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#1c1c1c]">
           {children}
         </div>
      </div>
    </div>
  );
}
