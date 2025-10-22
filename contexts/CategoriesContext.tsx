import type { Category } from '@/types/finance';
import { getDefaultCategories, loadCategories, saveCategories } from '@/utils/storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface CategoriesContextValue {
    categories: Category[];
    add: (name: string, color?: string) => void;
    rename: (id: string, newName: string) => void;
    remove: (id: string) => void;
    resetDefaults: () => void;
}

const CategoriesContext = createContext<CategoriesContextValue | undefined>(undefined);

export const CategoriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        (async () => {
            const loaded = await loadCategories();
            setCategories(loaded);
        })();
    }, []);

    useEffect(() => {
        saveCategories(categories).catch(() => { });
    }, [categories]);

    const add = useCallback((name: string, color?: string) => {
        const id = name.toLowerCase().replace(/\s+/g, '-');
        setCategories((prev) => [{ id, name, color }, ...prev]);
    }, []);

    const rename = useCallback((id: string, newName: string) => {
        setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name: newName } : c)));
    }, []);

    const remove = useCallback((id: string) => {
        setCategories((prev) => prev.filter((c) => c.id !== id));
    }, []);

    const resetDefaults = useCallback(() => setCategories(getDefaultCategories()), []);

    const value = useMemo(
        () => ({ categories, add, rename, remove, resetDefaults }),
        [categories, add, rename, remove, resetDefaults]
    );

    return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
};

export function useCategories(): CategoriesContextValue {
    const ctx = useContext(CategoriesContext);
    if (!ctx) throw new Error('useCategories must be used within CategoriesProvider');
    return ctx;
}
