import { loadTheme, saveTheme } from '@/utils/storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
    theme: Theme;
    setTheme: (t: Theme) => void;
    toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProviderLocal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemTheme = (Appearance.getColorScheme?.() ?? 'light') as Theme;
    const [theme, setThemeState] = useState<Theme>(systemTheme);

    useEffect(() => {
        (async () => {
            const stored = await loadTheme();
            if (stored === 'light' || stored === 'dark') setThemeState(stored);
        })();
    }, []);

    const setTheme = useCallback((t: Theme) => {
        setThemeState(t);
        saveTheme(t).catch(() => { });
    }, []);

    const toggle = useCallback(() => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    }, [theme, setTheme]);

    const value = useMemo(() => ({ theme, setTheme, toggle }), [theme, setTheme, toggle]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useAppTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useAppTheme must be used within ThemeProviderLocal');
    return ctx;
}
