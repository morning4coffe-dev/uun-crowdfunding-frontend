import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface NotificationSettings {
  emailBackedProjects: boolean;
  emailCreatedProjects: boolean;
  productUpdates: boolean;
}

interface SettingsContextValue {
  theme: Theme;
  notificationSettings: NotificationSettings;
  location: string;
  setTheme: (theme: Theme) => void;
  updateNotificationSettings: (partial: Partial<NotificationSettings>) => void;
  setLocation: (value: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

const THEME_KEY = 'uun-theme';
const NOTIFICATIONS_KEY = 'uun-notifications';
const LOCATION_KEY = 'uun-location';

const defaultNotifications: NotificationSettings = {
  emailBackedProjects: true,
  emailCreatedProjects: true,
  productUpdates: false,
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotifications);
  const [location, setLocationState] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedTheme = (localStorage.getItem(THEME_KEY) as Theme | null) || null;
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const initialTheme: Theme = storedTheme || (prefersDark ? 'dark' : 'light');
    applyTheme(initialTheme);
    setThemeState(initialTheme);

    const storedNotifications = localStorage.getItem(NOTIFICATIONS_KEY);
    if (storedNotifications) {
      try {
        const parsed = JSON.parse(storedNotifications);
        setNotificationSettings({ ...defaultNotifications, ...parsed });
      } catch {
        setNotificationSettings(defaultNotifications);
      }
    }

    const storedLocation = localStorage.getItem(LOCATION_KEY);
    if (storedLocation) {
      setLocationState(storedLocation);
    }
  }, []);

  const applyTheme = (next: Theme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (next === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const setTheme = (next: Theme) => {
    setThemeState(next);
    applyTheme(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_KEY, next);
    }
  };

  const updateNotificationSettings = (partial: Partial<NotificationSettings>) => {
    setNotificationSettings((prev) => {
      const next = { ...prev, ...partial };
      if (typeof window !== 'undefined') {
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(next));
      }
      return next;
    });
  };

  const setLocation = (value: string) => {
    setLocationState(value);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCATION_KEY, value);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        theme,
        notificationSettings,
        location,
        setTheme,
        updateNotificationSettings,
        setLocation,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return ctx;
}
