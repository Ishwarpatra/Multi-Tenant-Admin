import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Theme = 'dark' | 'light' | 'hc';

interface Notification {
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

interface AppContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  notifications: Notification[];
  addNotification: (n: Omit<Notification, 'id' | 'timestamp'>) => void;
  dismissNotification: (id: string) => void;
  activeRootView: 'control' | 'data';
  setActiveRootView: (view: 'control' | 'data') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    fontSize: 14,
    autosave: 'afterDelay',
    telemetryEnabled: true
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeRootView, setActiveRootView] = useState<'control' | 'data'>('control');

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const addNotification = (n: Omit<Notification, 'id' | 'timestamp'>) => {
    const id = Math.random().toString(36).substring(7);
    setNotifications(prev => [{ ...n, id, timestamp: new Date() }, ...prev].slice(0, 50));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <AppContext.Provider value={{ 
      settings, updateSettings, 
      notifications, addNotification, dismissNotification,
      activeRootView, setActiveRootView
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
