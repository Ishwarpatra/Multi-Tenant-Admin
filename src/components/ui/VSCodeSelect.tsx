import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface VSCodeSelectProps {
  value: string;
  options: string[];
  labels?: Record<string, string>;
  onChange: (val: string) => void;
  className?: string;
  id?: string;
  'aria-describedby'?: string;
  'aria-label'?: string;
}

export const VSCodeSelect: React.FC<VSCodeSelectProps> = ({ value, options, labels, onChange, className = '', id, 'aria-describedby': ariaDescribedby, 'aria-label': ariaLabel }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button 
        id={id}
        aria-describedby={ariaDescribedby}
        aria-label={ariaLabel}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-vs-active border border-vs-border px-3 py-1.5 text-sm outline-none rounded-sm text-left transition-all text-white ${isOpen ? 'ring-1 ring-vs-accent border-vs-accent' : 'hover:border-vs-border-light'}`}
        type="button"
      >
        <span className="truncate">{labels ? labels[value] : value}</span>
        <ChevronDown size={14} className={`text-vs-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 bg-vs-panel border border-vs-border rounded-sm shadow-2xl z-[70] py-1 animate-in fade-in slide-in-from-top-1 duration-200">
            {options.map(opt => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                type="button"
                className="w-full flex items-center justify-between px-3 py-1.5 text-sm text-white hover:bg-vs-active text-left border-none bg-transparent cursor-pointer"
              >
                <span>{labels ? labels[opt] : opt}</span>
                {value === opt && <Check size={14} className="text-vs-accent" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
