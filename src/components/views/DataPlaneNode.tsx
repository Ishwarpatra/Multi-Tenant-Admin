import React, { useState, useEffect, useRef } from 'react';
import { X, Cpu, Key, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export const DataPlaneNode: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'hashing' | 'validating' | 'error' | 'success'>('idle');
  const [licenseKey, setLicenseKey] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const appendLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleActivate = () => {
    setStatus('hashing');
    setLogs([]);
    appendLog('Executing WMI query for Motherboard serial number...');
    timeoutRef.current = setTimeout(() => {
      appendLog('Found Motherboard ID: BaseBoard_X99_A221');
      appendLog('Executing WMI query for Processor ID...');
      timeoutRef.current = setTimeout(() => {
        appendLog('Found Processor ID: BFEBFBFF000906EA');
        appendLog('Computing cryptographic hash: H(ID_mb || ID_cpu)...');
        timeoutRef.current = setTimeout(() => {
          appendLog('Hash generated: 8F3A-99B2-C711');
          setStatus('validating');
          appendLog('Sending secure payload to Control Plane...');
          timeoutRef.current = setTimeout(() => {
            if (licenseKey.trim() === 'VALID-KEY') {
              setStatus('success');
              appendLog('Handshake accepted. Local proxy online.');
            } else {
              setStatus('error');
              appendLog('Connection rejected: Invalid license key.');
            }
          }, 1500);
        }, 1200);
      }, 1000);
    }, 1000);
  };

  const handleReset = () => {
    setStatus('idle');
    setLicenseKey('');
    setLogs([]);
  };

  return (
    <div className="w-full h-full flex flex-col p-8 bg-[#1c1c1c] text-white">
      <div className="mb-6 border-b border-[#303030] pb-4">
        <div className="flex items-center gap-3">
          <Cpu size={24} className="text-blue-500" />
          <h1 className="text-2xl font-semibold">Data Plane: Local Hardware Node Setup</h1>
        </div>
        <p className="text-gray-400 mt-2">
          This panel configures the local agent's connection to the Control Plane. 
          Your hardware signature ensures exact billing and security alignment.
        </p>
      </div>

      <div className="flex flex-col flex-1 max-w-4xl gap-8">
        {/* Hardware Fingerprint Card */}
        <div className="bg-[#252526] p-6 border border-[#3c3c3c] rounded shadow-md">
          <h2 className="text-lg font-medium mb-4">Hardware Fingerprint</h2>
          
          {(status === 'hashing' || status === 'validating') && (
            <div className="absolute inset-0 bg-black/60 z-10 flex flex-col items-center justify-center backdrop-blur-sm rounded">
              <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
              <div className="text-lg font-semibold">{status === 'hashing' ? 'Extracting Identity...' : 'Negotiating Control Plane...'}</div>
              <div className="text-gray-400 mt-2 text-sm">{logs[logs.length - 1]}</div>
            </div>
          )}

          <div className="space-y-4 relative">
            <div className="flex items-center justify-between p-3 bg-[#1e1e1e] border border-[#303030] rounded">
              <span className="text-sm text-gray-400 font-mono">H(ID_mb || ID_cpu)</span>
              <span className="font-mono text-blue-400 font-semibold tracking-wider">
                {status === 'idle' || status === 'hashing' ? 'PENDING...' : '8F3A-99B2-C711'}
              </span>
            </div>

            <div className="space-y-2 mt-6">
              <label htmlFor="licenseKey" className="block text-sm text-gray-300 font-medium">One-Time Setup Key</label>
              <div className="relative">
                <Key size={16} className="absolute left-3 top-3 text-gray-500" />
                <input
                  id="licenseKey"
                  type="text"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  placeholder="Enter proxy key (Try: VALID-KEY)"
                  disabled={status === 'hashing' || status === 'validating'}
                  className="w-full bg-[#1e1e1e] border border-[#303030] rounded pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 shadow-inner"
                />
              </div>
            </div>
            
            {status === 'error' && (
              <div className="flex items-center gap-3 p-4 bg-[#F4511E]/10 border border-[#F4511E]/30 rounded text-[#F4511E] mt-4">
                <AlertCircle size={20} />
                <div className="text-sm">Connection Rejected: The provided setup key is invalid or not registered.</div>
              </div>
            )}

            {status === 'success' && (
              <div className="flex items-center gap-3 p-4 bg-[#00B050]/10 border border-[#00B050]/30 rounded text-[#00B050] mt-4">
                <CheckCircle size={20} />
                <div className="text-sm">Hardware ID Handshake Complete. Proxy is online and piping metering data.</div>
              </div>
            )}
            
            {logs.length > 0 && (
               <div className="mt-8">
                 <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Diagnostic Shell Output</div>
                 <div className="h-32 bg-black border border-[#303030] rounded p-3 font-mono text-xs text-green-400 overflow-y-auto custom-scrollbar">
                   {logs.map((L, i) => <div key={i}>{L}</div>)}
                 </div>
               </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[#303030]">
          {(status === 'idle' || status === 'error' || status === 'success') && (
            <button
              onClick={handleReset}
              className="px-6 py-2 text-sm bg-[#303030] hover:bg-[#3d3d3d] border border-[#454545] rounded transition-colors"
            >
              Reset Configuration
            </button>
          )}
          {(status === 'idle' || status === 'error') && (
             <button
                onClick={handleActivate}
                disabled={!licenseKey}
                className="px-6 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors border border-transparent shadow shadow-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed flex flex-row items-center gap-2"
             >
                <Cpu size={14} /> Establish Control Plane Link
             </button>
          )}
        </div>
      </div>
    </div>
  );
};
