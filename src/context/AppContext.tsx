import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';

export type Theme = 'dark' | 'light' | 'hc';

export interface Notification {
  id: string;
  type: 'info' | 'warn' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
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
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (n: Omit<Notification, 'id' | 'timestamp'>) => void;
  dismissNotification: (id: string, man?: boolean) => void;
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

  useEffect(() => {
    // Initial data fetch
    import('../services/mockApiService').then(({ MockApiService }) => {
      MockApiService.getWorkspaceFiles().then(data => {
        setFiles(data);
      }).catch(() => {
        // Fallback or handle error
      });
    });
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = `${settings.fontSize}px`;
  }, [settings.fontSize]);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substring(7);
    setNotifications(prev => [{ ...n, id, timestamp: new Date() }, ...prev].slice(0, 50));
    setTimeout(() => {
      dismissNotification(id);
    }, 4000);
  }, [dismissNotification]);

  const appValue = useMemo(() => ({ settings, updateSettings, activeRootView, setActiveRootView }), [settings, updateSettings, activeRootView]);
  const notifValue = useMemo(() => ({ notifications, addNotification, dismissNotification }), [notifications, addNotification, dismissNotification]);
  const workspaceValue = useMemo(() => ({ files, setFiles }), [files, setFiles]);

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
