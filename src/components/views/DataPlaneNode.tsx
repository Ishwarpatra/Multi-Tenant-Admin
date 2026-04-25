import React, { useState, useEffect, useRef } from 'react';
import { X, Cpu, Key, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export const DataPlaneNode: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'validating' | 'error' | 'success'>('idle');
  const [licenseKey, setLicenseKey] = useState('');
  
  // FIX: Provide cleanup mechanism for timeouts to prevent memory leaks (Issue 5 Refactor)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleActivate = () => {
    setStatus('validating');
    timeoutRef.current = setTimeout(() => {
      if (licenseKey.trim() === 'VALID-KEY') {
        setStatus('success');
      } else {
        setStatus('error');
      }
    }, 2000);
  };

  const handleReset = () => {
    setStatus('idle');
    setLicenseKey('');
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div 
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="w-[500px] bg-vs-bg rounded shadow-2xl border border-vs-border flex flex-col select-none overflow-hidden max-w-full"
      >
        {/* Title Bar */}
        <div className="h-10 border-b border-vs-border flex items-center justify-between px-4 bg-vs-header">
          <div className="flex items-center gap-2.5">
            <Cpu size={14} className="text-vs-accent" aria-hidden="true" />
            <span id="dialog-title" className="text-[11.5px] font-medium text-gray-300 tracking-wide">Data Plane: Local Hardware Node Setup</span>
          </div>
          <div className="flex items-center -mr-4">
            <button 
              onClick={handleReset}
              aria-label="Close configuration dialog"
              className="hover:bg-[#e81123] hover:text-white p-3 cursor-pointer transition-colors text-gray-400 bg-transparent border-none outline-none"
            >
               <X size={14} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 text-[12px] text-vs-text flex-1 flex flex-col bg-vs-bg">
          {(status === 'idle' || status === 'validating') && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-vs-panel p-4 border border-vs-border rounded flex items-start gap-3 shadow-inner">
                <Cpu size={18} className="text-gray-400 mt-0.5" aria-hidden="true" />
                <div>
                  <h2 className="text-white text-lg font-light mb-1">Hardware Fingerprint</h2>
                  <div className="font-mono text-blue-400 text-xs mt-1">H(ID_mb || ID_cpu) = 8F3A-99B2-C711</div>
                  <div className="text-[11px] text-vs-text-muted mt-2">This physical signature will be mapped to a Tenant on the Control Plane.</div>
                </div>
              </div>

              <div className="space-y-2 mt-6">
                <label htmlFor="license-key-input" className="block text-[11px] text-gray-300 font-semibold">One-Time Setup Key</label>
                <div className="relative">
                  <Key size={14} className="absolute left-3 top-2.5 text-vs-text-muted" aria-hidden="true" />
                  <input
                    id="license-key-input"
                    type="text"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    placeholder="Enter proxy key (Try: VALID-KEY)"
                    aria-required="true"
                    disabled={status === 'validating'}
                    className="w-full bg-vs-base border border-vs-border-light rounded-sm pl-9 pr-3 py-2 text-[12px] text-white focus:outline-none focus:border-vs-accent placeholder:text-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
                  />
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center justify-center py-4 space-y-3 animate-in fade-in duration-300">
              <AlertCircle size={40} className="text-vs-error" aria-hidden="true" />
              <h2 className="text-white text-lg font-light" role="alert">Connection Rejected</h2>
              <div className="text-center text-vs-text-muted text-[12px] max-w-[320px]">
                The provided setup key is invalid or not registered in the Central Control Plane. Telemetry routing denied.
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center py-4 space-y-3 animate-in fade-in duration-300">
              <CheckCircle size={40} className="text-vs-success" aria-hidden="true" />
              <h2 className="text-white text-lg font-light">Hardware ID Handshake Complete</h2>
              <div className="text-center text-vs-text-muted text-[12px] max-w-[320px]">
                This proxy node is now securely registered. Billing and API metering data will securely pipe to the Control Plane.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-16 bg-vs-bg border-t border-vs-border flex items-center justify-end px-6 gap-3">
          {(status === 'idle' || status === 'validating' || status === 'error') && (
            <button
              onClick={handleReset}
              disabled={status === 'validating'}
              className="px-8 py-1.5 text-[12px] text-gray-300 bg-vs-active hover:bg-[#45494e] border border-vs-border-light rounded-sm transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}
          {(status === 'idle' || status === 'validating') && (
            <button
              onClick={handleActivate}
              disabled={status === 'validating' || !licenseKey}
              className="min-w-[100px] px-4 py-1.5 text-[12px] text-white bg-vs-accent hover:bg-vs-accent-hover rounded-sm transition-all shadow-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed border border-transparent flex items-center justify-center gap-2"
            >
              {status === 'validating' ? (
                <>
                  <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                  <span>Connecting...</span>
                </>
              ) : (
                'Connect Node'
              )}
            </button>
          )}
          {status === 'error' && (
            <button
              onClick={handleReset}
              className="px-8 py-1.5 text-[12px] text-white bg-vs-accent hover:bg-vs-accent-hover rounded-sm transition-all shadow-sm focus:outline-none border border-transparent"
            >
              Retry
            </button>
          )}
          {status === 'success' && (
            <button
              onClick={handleReset}
              className="px-8 py-1.5 text-[12px] text-white bg-vs-accent hover:bg-vs-accent-hover rounded-sm transition-all shadow-sm focus:outline-none border border-transparent"
            >
              Close & Start Proxy
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
