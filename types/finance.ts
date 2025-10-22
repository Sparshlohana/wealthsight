export type TransactionType = 'income' | 'expense';

export interface Transaction {
    id: string;
    amount: number;
    type: TransactionType;
    category: string;
    description?: string;
    date: string; // ISO string
    merchant?: string;
    photoUri?: string | null;
    source?: 'manual' | 'sms';
}

export interface Category {
    id: string;
    name: string;
    color?: string;
}

export interface ThemePreference {
    theme: 'light' | 'dark';
}

export interface FinanceState {
    transactions: Transaction[];
    categories: Category[];
}
