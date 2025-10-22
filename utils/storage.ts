import type { Category, ThemePreference, Transaction } from '@/types/finance';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
    transactions: 'WS_TRANSACTIONS',
    categories: 'WS_CATEGORIES',
    theme: 'WS_THEME',
} as const;

export async function loadTransactions(): Promise<Transaction[]> {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.transactions);
    if (!json) return [];
    try {
        const parsed = JSON.parse(json);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export async function saveTransactions(data: Transaction[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(data));
}

export async function loadCategories(): Promise<Category[]> {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.categories);
    if (!json) return getDefaultCategories();
    try {
        const parsed = JSON.parse(json);
        return Array.isArray(parsed) ? parsed : getDefaultCategories();
    } catch {
        return getDefaultCategories();
    }
}

export async function saveCategories(data: Category[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(data));
}

export async function loadTheme(): Promise<ThemePreference['theme'] | null> {
    const v = await AsyncStorage.getItem(STORAGE_KEYS.theme);
    if (!v) return null;
    try {
        const parsed = JSON.parse(v) as ThemePreference;
        if (parsed && (parsed.theme === 'light' || parsed.theme === 'dark')) return parsed.theme;
        return null;
    } catch {
        return null;
    }
}

export async function saveTheme(theme: ThemePreference['theme']): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.theme, JSON.stringify({ theme } satisfies ThemePreference));
}

export function getDefaultCategories(): Category[] {
    return [
        { id: 'food', name: 'Food', color: '#FF8A65' },
        { id: 'shopping', name: 'Shopping', color: '#BA68C8' },
        { id: 'bills', name: 'Bills', color: '#4DB6AC' },
        { id: 'transport', name: 'Transport', color: '#64B5F6' },
        { id: 'salary', name: 'Salary', color: '#81C784' },
        { id: 'entertainment', name: 'Entertainment', color: '#FFD54F' },
        { id: 'misc', name: 'Misc', color: '#90A4AE' },
    ];
}
