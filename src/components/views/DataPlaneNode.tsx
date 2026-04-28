import React, { useState, useEffect, useRef } from 'react';
import { X, Cpu, Key, AlertCircle, CheckCircle, Loader2, ShieldAlert, Info } from 'lucide-react';
import { useNotifications } from '../../context/AppContext';

export const DataPlaneNode: React.FC = () => {
  const { addNotification } = useNotifications();
  const [status, setStatus] = useState<'idle' | 'hashing' | 'validating' | 'error' | 'success'>('idle');
  const [licenseKey, setLicenseKey] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [rawMbId, setRawMbId] = useState<string | null>(null);
  const [rawCpuId, setRawCpuId] = useState<string | null>(null);
  const [hashedId, setHashedId] = useState<string | null>(null);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const cleanup = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  useEffect(() => {
    return cleanup;
  }, []);

  useEffect(() => {
    import('../../services/mockApiService').then(({ MockApiService }) => {
      MockApiService.getArchLogs().then(data => {
        setLogs(prev => prev.length === 0 ? data : prev);
      }).catch(err => {
        console.error(err);
      });
    });
  }, []);

  const appendLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const sleep = (ms: number, signal: AbortSignal) => {
    return new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(resolve, ms);
      signal.addEventListener('abort', () => {
        clearTimeout(timeout);
        reject(new Error('Aborted'));
      }, { once: true });
    });
  };

  const handleActivate = () => {
    if (!licenseKey) return;
    
    cleanup();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    setStatus('hashing');
    setLogs([]);
    setRawMbId(null);
    setRawCpuId(null);
    setHashedId(null);
    
    appendLog('Executing WMI query: SELECT * FROM Win32_BaseBoard...');
    
    const runSequence = async () => {
      try {
        // Step 1: Hashing mb
        await sleep(1200, signal);
        const mbIdPayload = 'BaseBoard_X99_A221';
        setRawMbId(mbIdPayload);
        appendLog(`Found Motherboard ID: ${mbIdPayload}`);
        appendLog('Executing WMI query for Processor ID...');
        
        // Step 2: Hashing cpu
        await sleep(1200, signal);
        const cpuIdPayload = 'BFEBFBFF000906EA';
        setRawCpuId(cpuIdPayload);
        appendLog(`Found Processor ID: ${cpuIdPayload}`);
        appendLog('Computing cryptographic hash: H(ID_mb || ID_cpu)...');
        
        // Step 3: Compute hash
        await sleep(1000, signal);
        const inputString = mbIdPayload + cpuIdPayload;
        let hashInt = 0;
        for (let i = 0; i < inputString.length; i++) {
           hashInt = Math.imul(31, hashInt) + inputString.charCodeAt(i) | 0;
        }
        const dynamicHash = Math.abs(hashInt).toString(16).toUpperCase().padStart(8, '0') + '-' + Date.now().toString(16).toUpperCase().slice(-4);
        setHashedId(dynamicHash);
        appendLog(`Hash generated: ${dynamicHash}`);
        setStatus('validating');
        appendLog('Sending secure payload to Control Plane...');
        
        // Step 4: Validate
        await sleep(1500, signal);
        
        if (licenseKey.trim().toUpperCase() === 'VALID-KEY') {
          setStatus('success');
          appendLog('Handshake accepted. Local proxy online.');
          addNotification({
            type: 'success',
            title: 'Edge Node Registered',
            message: `Hardware bond established for node ${dynamicHash}. Telemetry pipe active.`
          });
        } else {
          setStatus('error');
          appendLog('Connection rejected: Invalid license key.');
          addNotification({
            type: 'error',
            title: 'Edge Auth Failure',
            message: `Node registration rejected for hash ${dynamicHash}. Invalid setup key.`
          });
        }
      } catch (err: any) {
        if (err.message !== 'Aborted') {
          console.error('Sequence failed', err);
        }
      }
    };

    runSequence();
  };

  const handleReset = () => {
    cleanup();
    setStatus('idle');
    setLicenseKey('');
    setLogs([]);
    setRawMbId(null);
    setRawCpuId(null);
    setHashedId(null);
  };

  return (
    <main className="w-full h-full flex flex-col p-8 md:p-12 bg-vs-base text-vs-text animate-in fade-in duration-500 overflow-y-auto custom-scrollbar">
      <header className="mb-8 border-b border-vs-border pb-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-vs-accent/10 rounded-lg border border-vs-accent/20">
            <Cpu size={28} className="text-vs-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Data Plane Identity & Registration</h1>
            <p className="text-vs-text-muted mt-2 text-[13px] max-w-2xl leading-relaxed">
              Establishing a cryptographic bond between this hardware agent and a Control Plane tenant partition. 
              Fingerprinting prevents malicious node spoofing and ensures accurate billing metrics.
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-col flex-1 gap-10">
        {/* Hardware Fingerprint Card */}
        <section 
          aria-labelledby="hw-setup-title"
          className="bg-vs-panel p-8 border border-vs-border rounded-sm shadow-xl relative overflow-hidden group min-h-[400px] flex flex-col"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-vs-accent"></div>
          <h2 id="hw-setup-title" className="text-lg font-medium mb-6 flex items-center gap-2">
            <ShieldAlert size={20} className="text-vs-accent" />
            Hardware Handshake Configuration
          </h2>
          
          {(status === 'hashing' || status === 'validating') && (
            <div className="absolute inset-0 bg-vs-base/90 z-20 flex flex-col items-center justify-center backdrop-blur-md animate-in fade-in duration-300">
              <div className="w-20 h-20 relative flex justify-center items-center mb-8">
                <Loader2 size={48} className="text-vs-accent animate-spin absolute" />
                <div className="w-16 h-16 border-4 border-dashed border-vs-border-light rounded-full animate-[spin_4s_linear_infinite]" />
              </div>
              <h3 className="text-2xl font-light mb-2 tracking-tight">
                {status === 'hashing' ? 'Extracting Identity via WMI...' : 'Negotiating Control Plane Link...'}
              </h3>
              <div className="text-vs-accent font-mono text-sm max-w-lg text-center h-6 animate-pulse px-6">
                {logs[logs.length - 1]}
              </div>
              
              {status === 'hashing' && (
                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl px-8">
                  <div className="bg-vs-bg p-4 border border-vs-border rounded shadow-inner">
                    <div className="text-[10px] text-vs-text-muted uppercase font-bold tracking-widest mb-1">Motherboard</div>
                    <div className="font-mono text-vs-accent text-[13px] truncate">{rawMbId || 'Executing WMI Query...'}</div>
                  </div>
                  <div className="bg-vs-bg p-4 border border-vs-border rounded shadow-inner">
                    <div className="text-[10px] text-vs-text-muted uppercase font-bold tracking-widest mb-1">Processor</div>
                    <div className="font-mono text-vs-accent text-[13px] truncate">{rawCpuId || 'Awaiting I/O...'}</div>
                  </div>
                  <div className="sm:col-span-2 bg-[#060606] p-4 border border-vs-border mt-2 rounded shadow-inner border-dashed">
                    <div className="text-[10px] text-vs-text-muted uppercase font-bold tracking-widest mb-1">Hashed Hardware ID</div>
                    <div className="font-mono text-vs-success text-[15px] mt-1">{hashedId || (rawMbId && rawCpuId ? 'Generating SHA-256...' : 'Compiling payload...')}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-6 relative flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="hw-hash-display" className="text-[11px] uppercase font-bold text-vs-text-muted tracking-widest">Active Hardware Bond</label>
                  <div id="hw-hash-display" className="flex items-center justify-between p-4 bg-vs-bg border border-vs-border rounded shadow-inner">
                    <span className="text-[12px] text-vs-text-muted font-mono leading-none pt-1">SHA-256 ADAPTER BOND</span>
                    <span className="font-mono text-vs-accent font-semibold tracking-widest text-lg">
                      {hashedId || '0000-0000-0000'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label htmlFor="licenseKey" className="text-[11px] uppercase font-bold text-vs-text-muted tracking-widest">Control Plane Proxy Key</label>
                  <div className="relative group">
                    <Key size={18} className="absolute left-4 top-3.5 text-vs-text-muted transition-colors group-focus-within:text-vs-accent" />
                    <input
                      id="licenseKey"
                      type="text"
                      value={licenseKey}
                      onChange={(e) => setLicenseKey(e.target.value)}
                      placeholder="Enter activation token (Try: VALID-KEY)"
                      maxLength={256}
                      disabled={status === 'hashing' || status === 'validating' || status === 'success'}
                      className="w-full bg-vs-bg border border-vs-border rounded pl-12 pr-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-vs-accent/50 focus:border-vs-accent transition-all disabled:opacity-50 shadow-inner font-mono tracking-tight"
                    />
                  </div>
                  <p className="text-[11px] text-vs-text-muted italic">Tokens are vaulted in the Control Plane and unique to a single hardware hash.</p>
                </div>
              </div>

              <div className="flex flex-col">
                 <div className="text-[11px] uppercase font-bold text-vs-text-muted tracking-widest mb-4">Diagnostic Handshake Log</div>
                 <div className="flex-1 min-h-[120px] bg-black border border-vs-border rounded-sm p-4 font-mono text-[11px] text-vs-success overflow-y-auto custom-scrollbar shadow-inner leading-relaxed">
                   {logs.length > 0 ? logs.map((L, i) => (
                     <div key={i} className="mb-1 animate-in slide-in-from-left-1">{L}</div>
                   )) : (
                     <div className="text-vs-text-muted opacity-30 italic">AGENT IDLE: Awaiting initialization sequence...</div>
                   )}
                   <div ref={logsEndRef} />
                 </div>
              </div>
            </div>
            
            <div className="pt-4 h-16">
              {status === 'error' && (
                <div className="flex items-center gap-3 p-4 bg-vs-error/10 border border-vs-error/30 rounded text-vs-error animate-in shake duration-500">
                  <AlertCircle size={20} />
                  <div className="text-sm font-medium">Identity Handshake Rejected: The provided setup key does not match this hardware hash in the global registry.</div>
                </div>
              )}

              {status === 'success' && (
                <div className="flex items-center gap-3 p-4 bg-vs-success/10 border border-vs-success/30 rounded text-vs-success animate-in slide-in-from-bottom-2">
                  <CheckCircle size={20} />
                  <div className="text-sm font-medium tracking-tight">Machine Identity Validated. Persistent mTLS tunnel established. Secure telemetry piping active.</div>
                </div>
              )}
            </div>
          </div>

          <footer className="mt-auto pt-8 border-t border-vs-border flex flex-wrap justify-end gap-4">
            <button
              onClick={handleReset}
              className="px-8 py-2.5 text-sm bg-vs-bg hover:bg-vs-panel border border-vs-border rounded-sm transition-all focus:ring-2 focus:ring-vs-border text-vs-text-muted hover:text-vs-text"
            >
              Flush All Identity Buffers
            </button>
            <button
              onClick={handleActivate}
              disabled={!licenseKey || status === 'hashing' || status === 'validating' || status === 'success'}
              className="px-8 py-2.5 text-sm bg-vs-accent hover:bg-vs-accent-hover text-vs-text rounded-sm transition-all border border-transparent shadow shadow-vs-accent/20 disabled:opacity-30 disabled:cursor-not-allowed flex flex-row items-center gap-2 font-semibold active:scale-95"
            >
              <Key size={16} /> Negotiate Secure Link
            </button>
          </footer>
        </section>

        <section className="p-6 bg-vs-panel/50 border border-vs-border border-dashed rounded-sm flex items-center gap-6">
           <div className="w-12 h-12 rounded-full border border-vs-border flex items-center justify-center flex-shrink-0 text-vs-text-muted">
              <Info size={24} />
           </div>
           <div className="text-[13px] text-vs-text-muted leading-relaxed">
             <strong className="text-vs-text">Notice:</strong> Hardware ID generation is non-reversible and based on localized UEFI/WMI signals. 
             If you replace your motherboard or CPU, you will need to re-issue a setup token via the Multi-Tenant Control Plane Settings.
           </div>
        </section>
      </div>
    </main>
  );
};
