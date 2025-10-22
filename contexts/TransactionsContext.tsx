import type { Transaction } from '@/types/finance';
import { loadTransactions, saveTransactions } from '@/utils/storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface TransactionsContextValue {
    transactions: Transaction[];
    add: (t: Transaction) => void;
    update: (t: Transaction) => void;
    remove: (id: string) => void;
    importMany: (items: Transaction[]) => void;
    clearAll: () => void;
}

const TransactionsContext = createContext<TransactionsContextValue | undefined>(undefined);

export const TransactionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        (async () => {
            const loaded = await loadTransactions();
            setTransactions(loaded);
        })();
    }, []);

    useEffect(() => {
        saveTransactions(transactions).catch(() => { });
    }, [transactions]);

    const add = useCallback((t: Transaction) => {
        setTransactions((prev) => [t, ...prev]);
    }, []);

    const update = useCallback((t: Transaction) => {
        setTransactions((prev) => prev.map((x) => (x.id === t.id ? t : x)));
    }, []);

    const remove = useCallback((id: string) => {
        setTransactions((prev) => prev.filter((x) => x.id !== id));
    }, []);

    const importMany = useCallback((items: Transaction[]) => {
        if (!items.length) return;
        setTransactions((prev) => [...items, ...prev]);
    }, []);

    const clearAll = useCallback(() => setTransactions([]), []);

    const value = useMemo(
        () => ({ transactions, add, update, remove, importMany, clearAll }),
        [transactions, add, update, remove, importMany, clearAll]
    );

    return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>;
};

export function useTransactions(): TransactionsContextValue {
    const ctx = useContext(TransactionsContext);
    if (!ctx) throw new Error('useTransactions must be used within TransactionsProvider');
    return ctx;
}
