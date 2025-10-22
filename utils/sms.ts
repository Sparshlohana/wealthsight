import type { Transaction } from '@/types/finance';
import { Platform } from 'react-native';
import { autoAssignCategory } from './categories';

// NOTE: Expo managed apps cannot read inbox SMS. This module provides parsing utilities and
// Android-only placeholders for permissions. For true auto-import, you need a custom dev client
// and a native SMS-read module. We expose a friendly message via canReadSms().

export async function canReadSms(): Promise<{ supported: boolean; reason?: string }> {
    if (Platform.OS !== 'android') return { supported: false, reason: 'SMS import is Android-only.' };
    // expo-sms supports sending only; inbox read requires native module
    return { supported: false, reason: 'Reading SMS requires a custom dev client with an SMS-read module.' };
}

export function parseTransactionFromMessage(message: string, receivedAt?: Date): Transaction | null {
    // Normalize
    const text = message.replace(/\n/g, ' ').trim();

    // Amount patterns like Rs 1,234.56 or INR 500
    const amountMatch = text.match(/(?:rs\.?|inr)\s*([,\d]+(?:\.\d{1,2})?)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : undefined;

    // Type detection
    const isDebit = /(debited|spent|paid|purchase|sent|withdrawn)/i.test(text);
    const isCredit = /(credited|received|deposit|refund)/i.test(text);
    let type: 'income' | 'expense' | undefined;
    if (isCredit && !isDebit) type = 'income';
    else if (isDebit && !isCredit) type = 'expense';
    else if (isDebit && isCredit) type = undefined; // ambiguous

    // Merchant extraction (simple heuristics)
    const viaMatch = text.match(/(?:at|to|in|via)\s+([A-Za-z0-9 &@._-]{2,40})/i);
    const merchant = viaMatch?.[1]?.trim();

    if (!amount || !type) return null;
    const date = (receivedAt ?? new Date()).toISOString();

    const categoryGuess = autoAssignCategory(merchant || text) ?? (type === 'income' ? 'salary' : 'misc');

    const tx: Transaction = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        amount,
        type,
        category: categoryGuess,
        description: merchant ? `${type === 'expense' ? 'Spent at' : 'From'} ${merchant}` : undefined,
        date,
        merchant,
        source: 'sms',
        photoUri: null,
    };
    return tx;
}

export function parseMultiple(messages: { body: string; date?: Date }[]): Transaction[] {
    const out: Transaction[] = [];
    for (const m of messages) {
        const tx = parseTransactionFromMessage(m.body, m.date);
        if (tx) out.push(tx);
    }
    return out;
}
