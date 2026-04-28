import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';

export type Theme = 'dark' | 'light' | 'hc';

export interface Notification {
  id: string;
  type: 'info' | 'warn' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  isDismissed: boolean;
}

interface AppSettings {
  theme: Theme;
  fontSize: number;
  autosave: 'off' | 'afterDelay' | 'onFocusChange' | 'onWindowChange';
  telemetryEnabled: boolean;
}

export interface EnvVar {
  id: string;
  key: string;
  value: string;
  comment: string;
  isActive: boolean;
}

export interface EnvFile {
  name: string;
  vars: EnvVar[];
}

interface AppContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  activeRootView: 'control' | 'data';
  setActiveRootView: (view: 'control' | 'data') => void;
}

interface WorkspaceContextType {
  files: EnvFile[];
  setFiles: React.Dispatch<React.SetStateAction<EnvFile[]>>;
  isLoading: boolean;
  error: string | null;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'isDismissed'>) => void;
  dismissNotification: (id: string) => void;
  clearHistory: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);
const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    fontSize: 14,
    autosave: 'afterDelay',
    telemetryEnabled: true
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeRootView, setActiveRootView] = useState<'control' | 'data'>('control');
  
  const [files, setFiles] = useState<EnvFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wsError, setWsError] = useState<string | null>(null);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isDismissed: true } : n));
  }, []);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp' | 'isDismissed'>) => {
    const id = crypto.randomUUID();
    setNotifications(prev => [{ ...n, id, timestamp: new Date(), isDismissed: false }, ...prev].slice(0, 50));
    setTimeout(() => {
      dismissNotification(id);
    }, 4000);
  }, [dismissNotification]);

  const clearHistory = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    // Initial data fetch
    import('../services/mockApiService').then(({ MockApiService }) => {
      MockApiService.getWorkspaceFiles().then(data => {
        setFiles(data);
        setIsLoading(false);
      }).catch(() => {
        const msg = 'Failed to synchronize local workspace.';
        setWsError(msg);
        addNotification({
          type: 'error',
          title: 'Infrastructure Link Failure',
          message: msg
        });
        setIsLoading(false);
      });
    });
  }, [addNotification]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${settings.fontSize}px`;
    
    if (settings.theme === 'light') {
      root.classList.add('theme-light');
      root.classList.remove('theme-hc');
    } else if (settings.theme === 'hc') {
      root.classList.add('theme-hc');
      root.classList.remove('theme-light');
    } else {
      root.classList.remove('theme-light', 'theme-hc');
    }
  }, [settings.fontSize, settings.theme]);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const appValue = useMemo(() => ({ settings, updateSettings, activeRootView, setActiveRootView }), [settings, updateSettings, activeRootView]);
  const notifValue = useMemo(() => ({ notifications, addNotification, dismissNotification, clearHistory }), [notifications, addNotification, dismissNotification, clearHistory]);
  const workspaceValue = useMemo(() => ({ files, setFiles, isLoading, error: wsError }), [files, setFiles, isLoading, wsError]);

  return (
    <AppContext.Provider value={appValue}>
      <WorkspaceContext.Provider value={workspaceValue}>
        <NotificationContext.Provider value={notifValue}>
          {children}
        </NotificationContext.Provider>
      </WorkspaceContext.Provider>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within AppProvider');
  return context;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within AppProvider');
  return context;
};
